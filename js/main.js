import { initPiano } from "./piano.js";
import { initKeyboardControls } from "./keyboard.js";
import {
    startCamera,
    stopCamera
} from "./camera.js";

const modeButtons =
    document.querySelectorAll(
        "[data-mode]"
    );

const modePanels =
    document.querySelectorAll(
        "[data-mode-panel]"
    );

const pianoArea =
    document.querySelector(
        "[data-piano-area]"
    );

let cameraStarted = false;

function showMode(mode) {

    modeButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );

    });

    modePanels.forEach(panel => {

        panel.hidden =
            panel.dataset.modePanel !== mode;

    });

    if (pianoArea) {

        pianoArea.hidden =
            mode === "camera";

    }

    if (mode === "camera") {

        startCamera().then(success => {

            cameraStarted =
                success === true;

        });

        return;
    }

    if (cameraStarted) {

        stopCamera();

        cameraStarted = false;

    }
}

initPiano();

initKeyboardControls();

modeButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showMode(
                button.dataset.mode
            );

        }
    );

});

showMode("keyboard");