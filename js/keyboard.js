import {
    changeOctave,
    getCurrentOctave,
    playNoteByName
} from "./piano.js";

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
    j: "B",
    k: "C",
    l: "D"
};

export function initKeyboardControls() {
    const octaveDown =
        document.getElementById(
            "octave-down"
        );

    const octaveUp =
        document.getElementById(
            "octave-up"
        );

    if (octaveDown) {
        octaveDown.addEventListener(
            "click",
            () => {
                changeOctave(-1);
            }
        );
    }

    if (octaveUp) {
        octaveUp.addEventListener(
            "click",
            () => {
                changeOctave(1);
            }
        );
    }

    document.addEventListener(
        "keydown",
        async event => {
            if (event.repeat) {
                return;
            }

            const key =
                event.key.toLowerCase();

            if (key === "z") {
                event.preventDefault();
                changeOctave(-1);
                return;
            }

            if (key === "x") {
                event.preventDefault();
                changeOctave(1);
                return;
            }

            const noteName =
                keyboardMap[key];

            if (!noteName) {
                return;
            }

            event.preventDefault();

            const octave =
                getCurrentOctave();

            let targetOctave =
                octave;

            if (
                key === "k" ||
                key === "l"
            ) {
                targetOctave =
                    octave + 1;
            }

            const note =
                `${noteName}${targetOctave}`;

            await playNoteByName(
                note,
                0.5
            );
        }
    );
}