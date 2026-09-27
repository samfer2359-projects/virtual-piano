import {
    playNote
} from "./audio.js";


let currentOctave = 4;

let pianoInitialized = false;

const pianoInstances = [];


const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
];


const blackNoteNames = [
    "C#",
    "D#",
    "F#",
    "G#",
    "A#"
];


const allNotes = [
    "A0",
    "A#0",
    "B0"
];


for (
    let octave = 1;
    octave <= 7;
    octave++
) {

    for (const noteName of noteNames) {

        allNotes.push(
            `${noteName}${octave}`
        );

    }

}


allNotes.push("C8");


function isBlackKey(note) {

    const noteName =
        note.slice(0, -1);

    return blackNoteNames.includes(
        noteName
    );
}


function createPiano(container) {

    const keyElements = {};

    const whiteKeyElements = {};


    container.innerHTML = "";


    const whiteNotes =
        allNotes.filter(
            note => !isBlackKey(note)
        );


    const blackNotes =
        allNotes.filter(
            note => isBlackKey(note)
        );


    for (const note of whiteNotes) {

        const key =
            document.createElement("div");


        key.className = "key";

        key.dataset.note = note;

        key.textContent = note;


        container.appendChild(key);


        keyElements[note] = key;

        whiteKeyElements[note] = key;


        key.addEventListener(
            "click",
            () => {

                playNoteByName(note);

            }
        );

    }


    for (const note of blackNotes) {

        const key =
            document.createElement("div");


        key.className = "black-key";

        key.dataset.note = note;

        key.textContent = note;


        container.appendChild(key);


        keyElements[note] = key;


        key.addEventListener(
            "click",
            () => {

                playNoteByName(note);

            }
        );

    }


    const instance = {
        container,
        keyElements,
        whiteKeyElements
    };


    positionBlackKeys(instance);


    return instance;
}


function positionBlackKeys(instance) {

    const blackKeyWidth = 35;

    const gap = 2;


    for (const note of Object.keys(
        instance.keyElements
    )) {

        if (!isBlackKey(note)) {
            continue;
        }


        const key =
            instance.keyElements[note];


        const noteName =
            note.slice(0, -1);


        const octave =
            note.slice(-1);


        const precedingWhiteNote =
            `${noteName[0]}${octave}`;


        const whiteKey =
            instance.whiteKeyElements[
                precedingWhiteNote
            ];


        if (!whiteKey) {
            continue;
        }


        const leftPosition =
            whiteKey.offsetLeft +
            whiteKey.offsetWidth +
            gap / 2 -
            blackKeyWidth / 2;


        key.style.left =
            `${leftPosition}px`;

    }

}


function positionAllPianos() {

    for (const instance of pianoInstances) {

        positionBlackKeys(instance);

    }

}


export function initPiano() {

    if (pianoInitialized) {
        return;
    }


    const containers =
        document.querySelectorAll(
            ".piano"
        );


    if (containers.length === 0) {
        return;
    }


    containers.forEach(container => {

        const instance =
            createPiano(container);


        pianoInstances.push(
            instance
        );

    });


    pianoInitialized = true;


    window.addEventListener(
        "resize",
        positionAllPianos
    );


    setTimeout(
        positionAllPianos,
        100
    );


    setTimeout(
        () => {
            scrollToOctave(
                currentOctave
            );
        },
        150
    );

}


export async function playNoteByName(
    note,
    velocity = 0.5
) {

    if (!note) {
        return;
    }


    for (const instance of pianoInstances) {

        const key =
            instance.keyElements[note];


        if (!key) {
            continue;
        }


        key.classList.add(
            "active"
        );


        setTimeout(
            () => {

                key.classList.remove(
                    "active"
                );

            },
            180
        );

    }


    await playNote(
        note,
        velocity
    );

}


export function getCurrentOctave() {

    return currentOctave;

}


export function changeOctave(direction) {

    const newOctave =
        currentOctave +
        direction;


    if (
        newOctave < 1 ||
        newOctave > 7
    ) {

        return;

    }


    currentOctave =
        newOctave;


    const display =
        document.getElementById(
            "current-octave"
        );


    if (display) {

        display.textContent =
            currentOctave;

    }


    scrollToOctave(
        currentOctave
    );

}


export function scrollToOctave(
    octave
) {

    const targetNote =
        `C${octave}`;


    for (const instance of pianoInstances) {

        const targetKey =
            instance.keyElements[
                targetNote
            ];


        if (!targetKey) {
            continue;
        }


        const wrapper =
            instance.container
                .parentElement;


        if (!wrapper) {
            continue;
        }


        const targetPosition =
            targetKey.offsetLeft -
            wrapper.clientWidth / 2 +
            targetKey.offsetWidth / 2;


        wrapper.scrollLeft =
            Math.max(
                0,
                targetPosition
            );

    }

}