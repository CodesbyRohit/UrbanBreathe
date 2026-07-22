/**
 * SpeechService — singleton promise-based speech synthesis service.
 *
 * Key design decisions:
 * 1. Must be initialised inside a user gesture (click handler).
 * 2. Pre-loads and caches voices so consumers never race with Chrome's async voice loading.
 * 3. Always calls speechSynthesis.cancel() before creating a new utterance.
 * 4. Never reuses utterance objects.
 * 5. Returns a Promise so callers can await voice readiness.
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
   * Primes Chrome's speech engine and begins asynchronous voice loading.
   * Safe to call multiple times — only the first call takes effect.
   */
  init(): void {
    if (this._initialized || this.destroyed) return;
    if (!this.supported) return;

    this._initialized = true;

    // Cancel any leftover speech from a previous lifecycle
    window.speechSynthesis.cancel();

    // Prime the speech engine with a silent utterance inside the user gesture.
    // Chrome requires at least one speak() call from a gesture context before
    // timer-driven speak() calls are allowed.
    const unlock = new SpeechSynthesisUtterance(' ');
    window.speechSynthesis.speak(unlock);
    window.speechSynthesis.cancel();

    // Guard: if voices are synchronously available (Chrome caches them after the
    // first load in the same tab session), cache them immediately.
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      this.voices = immediate;
      return;
    }

    // Otherwise start async loading so consumers can await ensureVoices().
    this.voicesPromise = this.loadVoices();
  }

  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    // Some browsers (Firefox) load voices synchronously.
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
   * - Cancels any in-progress utterance first.
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
      // Always cancel before queuing new speech to prevent overlap.
      window.speechSynthesis.cancel();

      // Wait for voice data to be available.
      const voices = await this.ensureVoices();
      if (this.destroyed) return false;

      // Create a brand-new utterance (never reuse objects).
      const clean = text.replace(/\.{3,}$/g, '.');
      // Leading space prevents Chrome TTS from stuttering the first syllable.
      const utterance = new SpeechSynthesisUtterance(` ${clean}`);
      utterance.rate = 0.92;
      utterance.pitch = 0.85;
      utterance.volume = 1;

      const preferred = this.pickVoice(voices, preference);
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (_) {
      // Swallow all errors — never let speech fail the boot sequence.
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

  private pickVoice(
    voices: SpeechSynthesisVoice[],
    _preference: VoicePreference,
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
