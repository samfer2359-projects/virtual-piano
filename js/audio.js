let audioContext = null;

const harmonics = [
    { multiplier: 2, volume: 0.08 },
    { multiplier: 3, volume: 0.03 },
    { multiplier: 4, volume: 0.01 },
    { multiplier: 5, volume: 0.005 }
];

export function getAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    return audioContext;
}

export async function ensureAudioReady() {
    const context = getAudioContext();

    if (context.state === "suspended") {
        await context.resume();
    }

    return context;
}

export function getFrequency(note) {
    const match = note.match(/^([A-G]#?)(\d)$/);

    if (!match) {
        return 0;
    }

    const noteName = match[1];
    const octave = Number(match[2]);

    const noteMap = {
        C: 0,
        "C#": 1,
        D: 2,
        "D#": 3,
        E: 4,
        F: 5,
        "F#": 6,
        G: 7,
        "G#": 8,
        A: 9,
        "A#": 10,
        B: 11
    };

    const midiNumber =
        (octave + 1) * 12 +
        noteMap[noteName];

    return 440 * Math.pow(
        2,
        (midiNumber - 69) / 12
    );
}

export async function playNote(
    note,
    velocity = 0.5,
    duration = 1.5
) {
    const context = await ensureAudioReady();

    const frequency = getFrequency(note);

    if (!frequency) {
        return;
    }

    const now = context.currentTime;
    const peakVolume = 0.3 * velocity;

    const oscillator =
        context.createOscillator();

    const gainNode =
        context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(
        0.001,
        now
    );

    gainNode.gain.linearRampToValueAtTime(
        peakVolume,
        now + 0.01
    );

    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        now + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);

    for (const harmonic of harmonics) {
        const harmonicOscillator =
            context.createOscillator();

        const harmonicGain =
            context.createGain();

        harmonicOscillator.type = "sine";

        harmonicOscillator.frequency.value =
            frequency * harmonic.multiplier;

        harmonicGain.gain.setValueAtTime(
            peakVolume * harmonic.volume,
            now
        );

        harmonicGain.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration
        );

        harmonicOscillator.connect(
            harmonicGain
        );

        harmonicGain.connect(
            context.destination
        );

        harmonicOscillator.start(now);
        harmonicOscillator.stop(
            now + duration
        );
    }
}