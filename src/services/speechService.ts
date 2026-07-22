/**
 * SpeechService — singleton promise-based speech synthesis service.
 *
 * Key design decisions:
 * 1. Must be initialised inside a user gesture (click handler).
 * 2. The first `init()` call speaks the welcome text SYNCHRONOUSLY so it
 *    stays within the user gesture — this is critical for Chrome, which
 *    silently blocks speechSynthesis.speak() calls from non-gesture contexts.
 * 3. Pre-loads and caches voices so subsequent async speak() calls work.
 * 4. Always calls speechSynthesis.cancel() before queuing new speech.
 * 5. Never reuses utterance objects.
 * 6. Fails silently — never throws, never logs.
 */

type VoicePreference = 'male' | 'female' | 'auto';

const PREFERRED_VOICE_NAMES = ['google uk english male', 'david', 'daniel', 'james', 'mark'];

class SpeechService {
  private voices: SpeechSynthesisVoice[] | null = null;
  private voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;
  private _initialized = false;
  private destroyed = false;

  // ── Initialisation ──────────────────────────────────────────────────────

  /**
   * Must be called from within a user gesture (click/tap/keydown handler).
   *
   * - Primes Chrome's speech engine by speaking `firstText` immediately
   *   (synchronously, inside the gesture). This is ESSENTIAL for Incognito
   *   where voice data is never cached and the async path would push the
   *   speechSynthesis.speak() call outside the gesture where Chrome blocks it.
   * - Begins asynchronous voice loading for subsequent speak() calls.
   * - Safe to call multiple times — only the first call takes effect.
   */
  init(firstText?: string): void {
    if (this._initialized || this.destroyed) return;
    if (!this.supported) return;

    this._initialized = true;

    // Cancel any leftover speech from a previous lifecycle
    window.speechSynthesis.cancel();

    // Check for synchronously available voices (cached by Chrome)
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      this.voices = immediate;
    } else {
      // Start async voice loading for subsequent speak() calls
      this.voicesPromise = this.loadVoices();
    }

    // ── Speak the first text NOW, inside the user gesture ───────────────
    // This is the critical fix for Incognito/private browsing.
    // Chrome requires the FIRST speechSynthesis.speak() to happen within
    // a user gesture. In Incognito, voice data is never cached, so the
    // async voice-loading path would cause the actual speak() to fire
    // outside the gesture — Chrome silently blocks it.
    //
    // By speaking synchronously here (even without a preferred voice),
    // we unlock Chrome's audio pipeline. Voices will be selected for
    // subsequent speak() calls when they become available.
    if (firstText) {
      const utterance = this.makeUtterance(firstText);
      // If voices are cached, apply the preferred voice immediately
      if (this.voices) {
        const preferred = this.pickVoice(this.voices);
        if (preferred) utterance.voice = preferred;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      // No text provided — prime the engine with a silent utterance
      // BUT do NOT cancel it (cancelling mid-init breaks Chrome's engine).
      const unlock = new SpeechSynthesisUtterance(' ');
      window.speechSynthesis.speak(unlock);
    }
  }

  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      this.voices = existing;
      return existing;
    }

    // Chrome loads voices asynchronously — wait for the voiceschanged event.
    return new Promise((resolve) => {
      const onChanged = () => {
        const result = window.speechSynthesis.getVoices();
        if (result.length > 0) {
          this.voices = result;
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
          resolve(result);
        }
      };
      window.speechSynthesis.addEventListener('voiceschanged', onChanged);

      // Safety net: re-trigger getVoices() after a timeout in case the event
      // never fires.
      setTimeout(() => {
        const result = window.speechSynthesis.getVoices();
        if (result.length > 0) {
          this.voices = result;
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
          resolve(result);
        }
      }, 1000);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Wait until voices are available (cached or freshly loaded).
   */
  async ensureVoices(): Promise<SpeechSynthesisVoice[]> {
    if (this.destroyed) return [];
    if (this.voices) return this.voices;
    if (!this.voicesPromise) {
      this.voicesPromise = this.loadVoices();
    }
    return this.voicesPromise;
  }

  /**
   * Speak a line of synthetic speech.
   *
   * - Cancels any in-progress utterance first (including the firstText
   *   spoken during init()).
   * - Waits for voices to be ready before speaking.
   * - Creates a brand-new utterance object every call.
   * - Returns true if speech was queued, false if unsupported.
   * - Never throws.
   */
  async speak(
    text: string,
    preference: VoicePreference = 'auto',
  ): Promise<boolean> {
    if (this.destroyed) return false;
    if (!this.supported) return false;

    try {
      window.speechSynthesis.cancel();

      const voices = await this.ensureVoices();
      if (this.destroyed) return false;

      const utterance = this.makeUtterance(text);
      const preferred = this.pickVoice(voices, preference);
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Immediately cancel any in-progress speech.
   */
  cancel(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {
        // Swallow
      }
    }
  }

  /**
   * Tear down the service. Cancels speech, clears caches, removes listeners.
   */
  destroy(): void {
    this.destroyed = true;
    this.cancel();
    this.voices = null;
    this.voicesPromise = null;
    this._initialized = false;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private makeUtterance(text: string): SpeechSynthesisUtterance {
    // Remove trailing ellipsis for cleaner speech
    const clean = text.replace(/\.{3,}$/g, '.');
    // Leading space prevents Chrome TTS from stuttering the first syllable
    const utterance = new SpeechSynthesisUtterance(` ${clean}`);
    utterance.rate = 0.92;
    utterance.pitch = 0.85;
    utterance.volume = 1;
    return utterance;
  }

  private pickVoice(
    voices: SpeechSynthesisVoice[],
    _preference: VoicePreference = 'auto',
  ): SpeechSynthesisVoice | undefined {
    if (voices.length === 0) return undefined;

    return (
      voices.find((v) =>
        PREFERRED_VOICE_NAMES.some((name) =>
          v.name.toLowerCase().includes(name),
        ),
      ) ?? voices[0]
    );
  }

  get supported(): boolean {
    return (
      typeof window !== 'undefined' && 'speechSynthesis' in window
    );
  }

  get initialized(): boolean {
    return this._initialized;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────

let instance: SpeechService | null = null;

export function getSpeechService(): SpeechService {
  if (!instance) {
    instance = new SpeechService();
  }
  return instance;
}

/**
 * Only use for testing — resets the singleton so the next getSpeechService()
 * call creates a fresh instance.
 */
export function resetSpeechService(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}
