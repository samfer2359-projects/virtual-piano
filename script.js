const title = document.getElementById("piano-title");

title.textContent = "My Virtual Piano";

const audioContext = new AudioContext();
const piano = document.querySelector(".piano");

const pianoWrapper = document.querySelector(".piano-wrapper");

const noteNames = [
    "C", "C#", "D", "D#", "E", "F",
    "F#", "G", "G#", "A", "A#", "B"
];

const blackNoteNames = ["C#", "D#", "F#", "G#", "A#"];

const allNotes = [];

for (let octave = 1; octave <= 7; octave++) {
    for (const noteName of noteNames) {
        allNotes.push(noteName + octave);
    }
}

allNotes.unshift("A0", "A#0", "B0");
allNotes.push("C8");

console.log("Total notes:", allNotes.length);

function isBlackKey(note) {
    const noteName = note.slice(0, -1);

    return blackNoteNames.includes(noteName);
}

const whiteNotes = [];
const blackNotesGenerated = [];

for (const note of allNotes) {
    if (isBlackKey(note)) {
        blackNotesGenerated.push(note);
    } else {
        whiteNotes.push(note);
    }
}

console.log("White keys:", whiteNotes.length);
console.log("Black keys:", blackNotesGenerated.length);

const frequencies = {};
const A4_FREQUENCY = 440;

for (let i = 0; i < allNotes.length; i++) {
    const note = allNotes[i];

    const semitonesFromA4 = i - 48;

    const frequency =
        A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12);

    frequencies[note] = frequency;
}

const harmonics = [
    { multiplier: 2, volume: 0.08 },
    { multiplier: 3, volume: 0.03 },
    { multiplier: 4, volume: 0.01 },
    { multiplier: 5, volume: 0.005 }
];

function playNote(frequency, velocity) {
    const peakVolume = 0.3 * velocity;
    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gainNode.gain.value = 0;

    gainNode.gain.linearRampToValueAtTime(
        peakVolume,
        now + 0.01
    );

    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        now + 1.5
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(now + 1.5);

    for (const harmonic of harmonics) {
        const harmonicOscillator = audioContext.createOscillator();
        const harmonicGain = audioContext.createGain();

        harmonicOscillator.type = "sine";

        harmonicOscillator.frequency.value =
            frequency * harmonic.multiplier;

        harmonicGain.gain.value = harmonic.volume;

        harmonicGain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 1.5
        );

        harmonicOscillator.connect(harmonicGain);
        harmonicGain.connect(audioContext.destination);

        harmonicOscillator.start();
        harmonicOscillator.stop(now + 1.5);
    }
}

function activateKey(key) {
    key.classList.add("active");

    setTimeout(function() {
        key.classList.remove("active");
    }, 150);
}

function handleKeyPress(key) {
    audioContext.resume();

    const note = key.dataset.note;
    const frequency = frequencies[note];
    const velocity = 0.5;

    playNote(frequency, velocity);

    activateKey(key);
}

const whiteKeyElements = {};
const keyElements = {};

for (const note of whiteNotes) {
    const key = document.createElement("div");

    key.textContent = note;
    key.classList.add("key");
    key.dataset.note = note;

    piano.appendChild(key);

    whiteKeyElements[note] = key;
    keyElements[note] = key;

    key.addEventListener("click", function() {
        handleKeyPress(key);
    });
}

for (const note of blackNotesGenerated) {
    const key = document.createElement("div");

    key.textContent = note;
    key.classList.add("black-key");
    key.dataset.note = note;

    piano.appendChild(key);

    keyElements[note] = key;

    const noteName = note.slice(0, -1);
    const octave = note.slice(-1);

    const precedingWhiteNote =
        noteName[0] + octave;

    const whiteKey =
        whiteKeyElements[precedingWhiteNote];

    const whiteKeyRect =
        whiteKey.getBoundingClientRect();

    const pianoRect =
        piano.getBoundingClientRect();

    const gap = 2;
    const blackKeyWidth = 35;

    const centerOfGap =
        whiteKeyRect.right +
        gap / 2 -
        pianoRect.left;

    const leftPosition =
        centerOfGap -
        blackKeyWidth / 2;

    key.style.left = `${leftPosition}px`;

    key.addEventListener("click", function() {
        handleKeyPress(key);
    });
}

const keyboardMap = {
    a: "C",
    w: "C#",
    s: "D",
    e: "D#",
    d: "E",
    f: "F",
    t: "F#",
    g: "G",
    y: "G#",
    h: "A",
    u: "A#",
    j: "B"
};

let currentOctave = 4;
const currentOctaveDisplay =
    document.getElementById("current-octave");

const octaveDownButton =
    document.getElementById("octave-down");

const octaveUpButton =
    document.getElementById("octave-up");

function changeOctave(direction) {
    const newOctave = currentOctave + direction;

    if (newOctave < 1 || newOctave > 7) {
        return;
    }

    currentOctave = newOctave;

    currentOctaveDisplay.textContent = currentOctave;

    scrollToOctave(currentOctave);
}

function scrollToOctave(octave) {
    const targetKey = keyElements[`C${octave}`];

    if (!targetKey) {
        return;
    }

    targetKey.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
    });
}

octaveDownButton.addEventListener("click", function() {
    changeOctave(-1);
});

octaveUpButton.addEventListener("click", function() {
    changeOctave(1);
});


document.addEventListener("keydown", function(event) {
    if (event.repeat) {
        return;
    }

    const keyPressed = event.key.toLowerCase();

    if (keyPressed === "z") {
        changeOctave(-1);
        return;
    }
    
    if (keyPressed === "x") {
        changeOctave(1);
        return;
    }

    const noteName = keyboardMap[keyPressed];

    if (!noteName) {
        return;
    }

    const note = noteName + currentOctave;
    const key = keyElements[note];

    if (!key) {
        return;
    }

    audioContext.resume();

    playNote(frequencies[note], 0.5);

    key.classList.add("active");
});

document.addEventListener("keyup", function(event) {
    const keyPressed = event.key.toLowerCase();

    const noteName = keyboardMap[keyPressed];

    if (!noteName) {
        return;
    }

    const note = noteName + currentOctave;
    const key = keyElements[note];

    if (!key) {
        return;
    }

    key.classList.remove("active");
});

scrollToOctave(currentOctave);