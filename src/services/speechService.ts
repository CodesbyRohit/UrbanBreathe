/**
 * SpeechService — utterance-queue-based speech synthesis service.
 *
 * Design principles:
 *
 * 1. QUEUE, NEVER CANCEL
 *    `speak()` adds an utterance to a FIFO queue. The current utterance
 *    is NEVER interrupted. Only explicit calls to `cancel()` (Skip, Mute,
 *    page navigation) stop the current utterance and purge the queue.
 *
 * 2. `onend` CHAINING
 *    Each utterance has an `onend` handler that calls `next()`, which
 *    dequeues the next utterance and speaks it. This guarantees no
 *    overlap between utterances and every utterance plays to completion.
 *
 * 3. GESTURE-FIRST INIT
 *    `init(firstText?)` must be called from a user gesture. It queues the
 *    welcome text and immediately calls `next()`, so the first
 *    `speechSynthesis.speak()` fires synchronously inside the gesture.
 *    This satisfies Chrome's autoplay policy (critical for Incognito).
 *
 * 4. NO ASYNC/AWAIT IN SPEAK
 *    Voice loading is fire-and-forget. If voices arrive after the welcome
 *    has started, they're cached for subsequent utterances. The welcome
 *    plays with the default voice if no cache is available — this is fine.
 *
 * 5. SILENT FAILURE
 *    Never throws, never logs.
 */

type VoicePreference = 'male' | 'female' | 'auto';

const PREFERRED_VOICE_NAMES = ['google uk english male', 'david', 'daniel', 'james', 'mark'];

class SpeechService {
  private voices: SpeechSynthesisVoice[] | null = null;
  private _initialized = false;
  private destroyed = false;

  /** FIFO queue of utterances waiting to be spoken. */
  private queue: SpeechSynthesisUtterance[] = [];

  /**
   * true while an utterance is actively being spoken by the browser.
   * Prevents `next()` from processing the queue while speech is active.
   */
  private speaking = false;

  // ── Initialisation ──────────────────────────────────────────────────────

  /**
   * Must be called from within a user gesture (click/tap/keydown handler).
   *
   * - Resets any stale browser speech state and clears the internal queue.
   * - Begins asynchronous voice loading (fire-and-forget; cached for later).
   * - If `firstText` is provided, queues it and immediately calls `next()`.
   *   The first `speechSynthesis.speak()` therefore fires synchronously
   *   inside the gesture, satisfying Chrome's autoplay policy.
   *
   * Safe to call multiple times — only the first call with text takes effect.
   */
  init(firstText?: string): void {
    if (this._initialized || this.destroyed) return;
    if (!this.supported) return;

    this._initialized = true;

    // Fresh start — cancel any stale audio left from a previous page lifecycle
    window.speechSynthesis.cancel();

    // Reset internal state
    this.queue = [];
    this.speaking = false;

    // Load voices: synchronous if cached, async (fire-and-forget) if not
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      this.voices = immediate;
    } else {
      // Fire-and-forget — results are cached in this.voices when loaded
      this.startLoadingVoices();
    }

    // Queue the first utterance (plays immediately via next())
    if (firstText) {
      this.enqueue(firstText);
    }
  }

  /**
   * Speak (enqueue) a line of synthetic speech.
   *
   * - Does NOT cancel any in-progress utterance.
   * - Adds the text to the FIFO queue. When the current utterance finishes,
   *   `onend` fires, `next()` dequeues this one, and it plays.
   * - Returns true if the utterance was queued, false if unsupported.
   */
  speak(text: string): boolean {
    if (this.destroyed || !this.supported) return false;
    this.enqueue(text);
    return true;
  }

  /**
   * Immediately stop current speech, clear the queue, and reset state.
   * Only call for explicit user actions (Skip, Mute) or teardown.
   */
  cancel(): void {
    this.queue = [];
    this.speaking = false;
    try {
      window.speechSynthesis.cancel();
    } catch (_) {
      // Swallow
    }
  }

  /**
   * Full teardown. Call on component unmount or test cleanup.
   */
  destroy(): void {
    this.destroyed = true;
    this.cancel();
    this.voices = null;
    this._initialized = false;
  }

  // ── Internal Queue ──────────────────────────────────────────────────────

  /**
   * Create an utterance, wire onend/onerror handlers, push to queue,
   * and start processing if no utterance is currently speaking.
   */
  private enqueue(text: string): void {
    const utterance = this.makeUtterance(text);

    // Assign voice immediately if already loaded
    if (this.voices) {
      const preferred = this.pickVoice(this.voices);
      if (preferred) utterance.voice = preferred;
    }

    // Chain: when this utterance finishes naturally, process the next one.
    utterance.onend = () => this.next();
    utterance.onerror = () => this.next();

    this.queue.push(utterance);

    // If the engine is idle, start speaking immediately.
    if (!this.speaking) {
      this.next();
    }
  }

  /**
   * Dequeue the next utterance and speak it.
   *
   * Called by:
   * - `onend` / `onerror` of the previous utterance
   * - `init()` / `enqueue()` when the engine was idle
   *
   * Chrome bug workaround:
   * After `onend` fires, `speechSynthesis.speaking` may still be `true`
   * momentarily. Calling `speak()` in this state throws or silently fails.
   * We detect this and defer to a microtask (Promise.resolve().then()),
   * which is a standard JavaScript pattern — NOT a setTimeout workaround.
   */
  private next(): void {
    if (this.destroyed) return;

    // Chrome: after onend, the engine may still report 'speaking'.
    // Defer to a microtask to let the engine settle completely.
    if (window.speechSynthesis.speaking) {
      Promise.resolve().then(() => this.next());
      return;
    }

    while (this.queue.length > 0) {
      const utterance = this.queue.shift()!;

      // Assign voice if it arrived while the previous utterance was playing
      if (!utterance.voice && this.voices) {
        const preferred = this.pickVoice(this.voices);
        if (preferred) utterance.voice = preferred;
      }

      try {
        window.speechSynthesis.speak(utterance);
        this.speaking = true;
        return; // One utterance per next() call
      } catch (_) {
        // Utterance failed silently — try the next one in the queue
        continue;
      }
    }

    this.speaking = false;
  }

  // ── Voice Loading (Fire-and-Forget) ─────────────────────────────────────

  private async startLoadingVoices(): Promise<void> {
    // Some browsers (Firefox) load voices synchronously
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      this.voices = existing;
      return;
    }

    // Chrome loads voices asynchronously — wait for the voiceschanged event.
    // The Promise is never awaited; it's just a firing mechanism that sets
    // this.voices when voices arrive. Subsequent next() calls will pick them up.
    return new Promise<void>((resolve) => {
      const onChanged = () => {
        const result = window.speechSynthesis.getVoices();
        if (result.length > 0) {
          this.voices = result;
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
          resolve();
        }
      };
      window.speechSynthesis.addEventListener('voiceschanged', onChanged);

      // Safety net: poll after a timeout in case the event never fires
      setTimeout(() => {
        const result = window.speechSynthesis.getVoices();
        if (result.length > 0) {
          this.voices = result;
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
          resolve();
        }
      }, 1500);
    });
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
