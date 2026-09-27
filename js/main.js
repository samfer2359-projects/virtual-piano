import { initPiano } from "./piano.js";
import { initKeyboardControls } from "./keyboard.js";

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
let cameraModule = null;

async function loadCameraModule() {

    if (cameraModule) {
        return cameraModule;
    }

    cameraModule =
        await import("./camera.js");

    return cameraModule;
}

async function showMode(mode) {

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

        try {

            const camera =
                await loadCameraModule();

            const success =
                await camera.startCamera();

            cameraStarted =
                success === true;

        } catch (error) {

            console.error(
                "Camera failed to load:",
                error
            );

            const status =
                document.getElementById(
                    "camera-status"
                );

            if (status) {

                status.textContent =
                    "Camera could not start.";

            }

        }

        return;
    }

    if (cameraStarted) {

        try {

            const camera =
                await loadCameraModule();

            camera.stopCamera();

        } catch (error) {

            console.error(
                "Camera could not stop:",
                error
            );

        }

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