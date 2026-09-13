const title = document.getElementById("piano-title");

title.textContent = "My Virtual Piano";


const audioContext = new AudioContext();


const notes = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    "C5", "D5", "E5", "F5", "G5", "A5", "B5"
];

const blackNotes = [
    "C#4", "D#4", "F#4", "G#4", "A#4",
    "C#5", "D#5", "F#5", "G#5", "A#5"
];

const blackKeyPositions = {
    "C#4": 63,
    "D#4": 125,
    "F#4": 249,
    "G#4": 311,
    "A#4": 373,

    "C#5": 497,
    "D#5": 559,
    "F#5": 683,
    "G#5": 745,
    "A#5": 807
};

const frequencies = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,

    C5: 523.26,
    D5: 587.32,
    E5: 659.26,
    F5: 698.46,
    G5: 784.00,
    A5: 880.00,
    B5: 987.76,

    "C#4": 277.18,
    "D#4": 311.13,
    "F#4": 369.99,
    "G#4": 415.30,
    "A#4": 466.16,

    "C#5": 554.37,
    "D#5": 622.25,
    "F#5": 739.99,
    "G#5": 830.61,
    "A#5": 932.33
};

const harmonics = [
    { multiplier: 2, volume: 0.15 },
    { multiplier: 3, volume: 0.08 }
];


const piano = document.querySelector(".piano");

function playNote(frequency, velocity) {
    const peakVolume = 0.3 * velocity;

    const now = audioContext.currentTime;



        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "triangle";
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

            harmonicGain.gain.linearRampToValueAtTime(
                0,
                now + 1.5
            );

            harmonicOscillator.connect(harmonicGain);
            harmonicGain.connect(audioContext.destination);

            harmonicOscillator.start();
            harmonicOscillator.stop(now + 1.5);
        }

}

function handleKeyPress(key) {
    audioContext.resume();

    const frequency = frequencies[key.dataset.note];
    const velocity = 0.5;

    playNote(frequency, velocity);

    key.classList.add("active");

    setTimeout(function () {
        key.classList.remove("active");
    }, 150);
}

for (const note of notes) {
    const key = document.createElement("div");

    key.textContent = note;
    key.classList.add("key");
    key.dataset.note = note;

    piano.appendChild(key);


    key.addEventListener("click", function () {
        handleKeyPress(key);
    });
}

for (const note of blackNotes) {
    const key = document.createElement("div");

    key.textContent = note;
    key.classList.add("black-key");
    key.dataset.note = note;

    piano.appendChild(key);

    const position = blackKeyPositions[note];
    key.style.left = position + "px";

    key.addEventListener("click", function () {
        handleKeyPress(key);
    });
    
}