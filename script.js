const title = document.getElementById("piano-title");

title.textContent = "My Virtual Piano";


const audioContext = new AudioContext();


const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];


const frequencies = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88
};


const harmonics = [
    { multiplier: 2, volume: 0.05 },
    { multiplier: 3, volume: 0.02 }
];


const piano = document.querySelector(".piano");


for (const note of notes) {
    const key = document.createElement("div");

    key.textContent = note;
    key.classList.add("key");
    key.dataset.note = note;

    piano.appendChild(key);


    key.addEventListener("click", function () {

        audioContext.resume();


        const frequency = frequencies[key.dataset.note];
        const now = audioContext.currentTime;


        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gainNode.gain.value = 0;

        gainNode.gain.linearRampToValueAtTime(
            0.3,
            now + 0.05
        );

        gainNode.gain.linearRampToValueAtTime(
            0,
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


        
        key.classList.add("active");

        setTimeout(function () {
            key.classList.remove("active");
        }, 150);
    });
}