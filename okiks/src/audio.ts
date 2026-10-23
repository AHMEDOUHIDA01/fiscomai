/** Synthèse vocale anglaise, reconnaissance vocale et petits sons d'interface (sans fichiers audio). */

let voice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pref = ["en-GB", "en-US"];
  return (
    voices.find((v) => pref.includes(v.lang) && /natural|google|samantha|daniel|serena/i.test(v.name)) ??
    voices.find((v) => pref.includes(v.lang)) ??
    voices[0] ??
    null
  );
}

if (typeof speechSynthesis !== "undefined") {
  voice = pickVoice();
  speechSynthesis.addEventListener?.("voiceschanged", () => (voice = pickVoice()));
}

export const canSpeakAloud = () => typeof speechSynthesis !== "undefined";

export function sayEnglish(text: string, slow = false): void {
  if (!canSpeakAloud()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? "en-GB";
  if (voice) u.voice = voice;
  u.rate = slow ? 0.6 : 0.9;
  speechSynthesis.speak(u);
}

// ---------------------------------------------------------------------------

type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
};

function recognitionCtor(): (new () => Recognition) | null {
  const w = globalThis as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => Recognition) | null;
}

export const canRecognizeSpeech = () => recognitionCtor() !== null;

/** Écoute une phrase anglaise ; renvoie les transcriptions candidates. */
export function listenOnce(): { result: Promise<string[]>; stop: () => void } {
  const Ctor = recognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error("unsupported")), stop: () => {} };
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  const result = new Promise<string[]>((resolve, reject) => {
    let got: string[] = [];
    rec.onresult = (e) => {
      const first = e.results[0];
      got = Array.from({ length: first.length }, (_, i) => first[i].transcript);
    };
    rec.onerror = (e) => reject(new Error(e.error));
    rec.onend = () => resolve(got);
  });
  rec.start();
  return { result, stop: () => rec.abort() };
}

// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null;
let soundOn = true;

/** Suit le réglage « effets sonores » de l'élève. */
export function setSoundEnabled(on: boolean) {
  soundOn = on;
}

function tone(freqs: number[], duration = 0.12, type: OscillatorType = "sine", gain = 0.08) {
  if (!soundOn) return;
  try {
    audioCtx ??= new AudioContext();
    const t0 = audioCtx.currentTime;
    freqs.forEach((f, i) => {
      const osc = audioCtx!.createOscillator();
      const g = audioCtx!.createGain();
      osc.type = type;
      osc.frequency.value = f;
      const start = t0 + i * duration;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(gain, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(g).connect(audioCtx!.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    });
  } catch {
    /* audio indisponible : on ignore */
  }
}

/** Petits motifs inspirés du oud / de la gamme hijaz. */
export const sfx = {
  correct: () => tone([587, 740, 880], 0.09, "triangle"),
  wrong: () => tone([311, 277], 0.14, "sawtooth", 0.04),
  complete: () => tone([440, 466, 554, 587, 659, 880], 0.11, "triangle"),
  tap: () => tone([660], 0.04, "sine", 0.03),
};
