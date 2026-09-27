import {
    FilesetResolver,
    HandLandmarker
} from "@mediapipe/tasks-vision";

import {
    getCurrentOctave,
    playNoteByName
} from "./piano.js";

let handLandmarker = null;
let camera = null;
let canvas = null;
let context = null;
let stream = null;
let animationFrame = null;
let running = false;
let noteFeedback = null;
let feedbackTimer = null;

const fingerTips = {
    index: 8,
    middle: 12,
    ring: 16,
    pinky: 20
};

const fingerIds = {
    index: 1,
    middle: 2,
    ring: 3,
    pinky: 4
};

const whiteMapping = {
    Left: {
        4: "C",
        3: "D",
        2: "E",
        1: "F"
    },
    Right: {
        1: "G",
        2: "A",
        3: "B",
        4: "C"
    }
};

const blackMapping = {
    Left: {
        4: "C#",
        3: "D#",
        1: "F#"
    },
    Right: {
        1: "G#",
        2: "A#"
    }
};

const handStates = {
    Left: {},
    Right: {}
};

for (const hand of ["Left", "Right"]) {
    for (const finger of [1, 2, 3, 4]) {
        handStates[hand][finger] = {
            pinching: false,
            pinchFrames: 0,
            releaseFrames: 0
        };
    }
}

const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [5, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [9, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    [13, 17],
    [17, 18],
    [18, 19],
    [19, 20],
    [0, 17]
];

function distance(pointA, pointB) {
    const x =
        pointA.x -
        pointB.x;

    const y =
        pointA.y -
        pointB.y;

    return Math.sqrt(
        x * x +
        y * y
    );
}

function getHandName(result, index) {
    const detectedName =
        result.handednesses?.[index]?.[0]?.categoryName;

    if (detectedName === "Left") {
        return "Right";
    }

    if (detectedName === "Right") {
        return "Left";
    }

    return null;
}

function getNoteForFinger(
    hand,
    fingerId,
    y
) {
    const octave =
        getCurrentOctave();

    const blackRegion =
        y < 0.25;

    if (blackRegion) {
        const noteName =
            blackMapping[hand]?.[fingerId];

        if (!noteName) {
            return null;
        }

        return `${noteName}${octave}`;
    }

    const noteName =
        whiteMapping[hand]?.[fingerId];

    if (!noteName) {
        return null;
    }

    if (
        hand === "Right" &&
        fingerId === 4
    ) {
        return `${noteName}${octave + 1}`;
    }

    return `${noteName}${octave}`;
}

function createNoteFeedback() {
    if (noteFeedback) {
        return;
    }

    const cameraMode =
        document.querySelector(
            '[data-mode-panel="camera"]'
        );

    if (!cameraMode) {
        return;
    }

    noteFeedback =
        document.createElement("div");

    noteFeedback.className =
        "camera-note-feedback";

    noteFeedback.setAttribute(
        "aria-live",
        "polite"
    );

    noteFeedback.hidden = true;

    cameraMode.appendChild(
        noteFeedback
    );
}

function showNoteFeedback(note) {
    createNoteFeedback();

    if (!noteFeedback) {
        return;
    }

    noteFeedback.textContent =
        `🎵 ${note}`;

    noteFeedback.hidden = false;

    noteFeedback.classList.remove(
        "show"
    );

    void noteFeedback.offsetWidth;

    noteFeedback.classList.add(
        "show"
    );

    clearTimeout(
        feedbackTimer
    );

    feedbackTimer =
        setTimeout(() => {
            noteFeedback.classList.remove(
                "show"
            );

            setTimeout(() => {
                if (
                    !noteFeedback.classList.contains(
                        "show"
                    )
                ) {
                    noteFeedback.hidden = true;
                }
            }, 180);
        }, 850);
}

function notifyCameraNote(note) {
    document.dispatchEvent(
        new CustomEvent(
            "camera-note-played",
            {
                detail: {
                    note
                }
            }
        )
    );
}

function drawInterface() {
    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const boundary =
        canvas.height * 0.25;

    context.beginPath();

    context.moveTo(
        0,
        boundary
    );

    context.lineTo(
        canvas.width,
        boundary
    );

    context.strokeStyle =
        "rgba(71, 120, 155, 0.85)";

    context.lineWidth = 2;

    context.stroke();

    context.fillStyle =
        "rgba(71, 120, 155, 0.9)";

    context.font =
        "14px Arial";

    context.textAlign =
        "left";

    context.fillText(
        "BLACK KEYS",
        14,
        20
    );

    context.fillStyle =
        "rgba(82, 97, 109, 0.9)";

    context.fillText(
        "WHITE KEYS",
        14,
        boundary + 24
    );
}

function drawHands(result) {
    for (
        let handIndex = 0;
        handIndex < result.landmarks.length;
        handIndex++
    ) {
        const landmarks =
            result.landmarks[handIndex];

        const handName =
            getHandName(
                result,
                handIndex
            );

        if (!handName) {
            continue;
        }

        for (const connection of connections) {
            const start =
                landmarks[connection[0]];

            const end =
                landmarks[connection[1]];

            const startX =
                (1 - start.x) *
                canvas.width;

            const startY =
                start.y *
                canvas.height;

            const endX =
                (1 - end.x) *
                canvas.width;

            const endY =
                end.y *
                canvas.height;

            context.beginPath();

            context.moveTo(
                startX,
                startY
            );

            context.lineTo(
                endX,
                endY
            );

            context.strokeStyle =
                "rgba(71, 120, 155, 0.85)";

            context.lineWidth = 3;

            context.stroke();
        }

        for (const landmark of landmarks) {
            const x =
                (1 - landmark.x) *
                canvas.width;

            const y =
                landmark.y *
                canvas.height;

            context.beginPath();

            context.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            context.fillStyle =
                "rgba(24, 50, 74, 0.95)";

            context.fill();
        }

        const wrist =
            landmarks[0];

        const middleBase =
            landmarks[9];

        const handScale =
            distance(
                wrist,
                middleBase
            );

        if (handScale === 0) {
            continue;
        }

        for (
            const [fingerName, tipIndex]
            of Object.entries(fingerTips)
        ) {
            const fingerId =
                fingerIds[fingerName];

            const tip =
                landmarks[tipIndex];

            const thumb =
                landmarks[4];

            const pinchDistance =
                distance(
                    tip,
                    thumb
                );

            const pinchRatio =
                pinchDistance /
                handScale;

            const isPinching =
                pinchRatio < 0.45;

            const state =
                handStates
                    [handName]
                    [fingerId];

            if (isPinching) {
                state.pinchFrames++;
                state.releaseFrames = 0;
            } else {
                state.releaseFrames++;
                state.pinchFrames = 0;
            }

            const note =
                getNoteForFinger(
                    handName,
                    fingerId,
                    tip.y
                );

            if (
                state.pinchFrames >= 2 &&
                !state.pinching
            ) {
                state.pinching = true;

                if (note) {
                    playCameraNote(
                        note
                    );
                }
            }

            if (
                state.releaseFrames >= 2
            ) {
                state.pinching = false;
            }

            if (note) {
                const x =
                    (1 - tip.x) *
                    canvas.width;

                const y =
                    tip.y *
                    canvas.height;

                context.fillStyle =
                    state.pinching
                        ? "rgba(79, 139, 112, 1)"
                        : "rgba(24, 50, 74, 0.9)";

                context.font =
                    "14px Arial";

                context.textAlign =
                    "center";

                context.fillText(
                    note,
                    x,
                    y - 12
                );
            }
        }
    }
}

async function playCameraNote(note) {
    showNoteFeedback(
        note
    );

    notifyCameraNote(
        note
    );

    await playNoteByName(
        note,
        0.6
    );
}

async function createHandLandmarker() {
    const vision =
        await FilesetResolver.forVisionTasks(
            "/node_modules/@mediapipe/tasks-vision/wasm"
        );

    handLandmarker =
        await HandLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    modelAssetPath:
                        "/models/hand_landmarker.task"
                },
                runningMode: "VIDEO",
                numHands: 2
            }
        );
}

async function detectHands() {
    if (
        !running ||
        !handLandmarker
    ) {
        return;
    }

    if (
        !camera ||
        camera.readyState < 2
    ) {
        animationFrame =
            requestAnimationFrame(
                detectHands
            );

        return;
    }

    if (
        canvas.width !==
            camera.videoWidth ||
        canvas.height !==
            camera.videoHeight
    ) {
        canvas.width =
            camera.videoWidth;

        canvas.height =
            camera.videoHeight;
    }

    drawInterface();

    const result =
        handLandmarker.detectForVideo(
            camera,
            performance.now()
        );

    if (
        result.landmarks &&
        result.landmarks.length > 0
    ) {
        drawHands(
            result
        );
    }

    animationFrame =
        requestAnimationFrame(
            detectHands
        );
}

function resetHandStates() {
    for (
        const hand
        of ["Left", "Right"]
    ) {
        for (
            const finger
            of [1, 2, 3, 4]
        ) {
            handStates[hand][finger] = {
                pinching: false,
                pinchFrames: 0,
                releaseFrames: 0
            };
        }
    }
}

export async function startCamera() {
    camera =
        document.getElementById(
            "camera"
        );

    canvas =
        document.getElementById(
            "hand-canvas"
        );

    if (
        !camera ||
        !canvas
    ) {
        return false;
    }

    context =
        canvas.getContext(
            "2d"
        );

    const status =
        document.getElementById(
            "camera-status"
        );

    createNoteFeedback();

    try {
        if (!handLandmarker) {
            if (status) {
                status.textContent =
                    "Loading hand tracking...";
            }

            await createHandLandmarker();
        }

        if (stream) {
            stream
                .getTracks()
                .forEach(track => {
                    track.stop();
                });
        }

        stream =
            await navigator
                .mediaDevices
                .getUserMedia({
                    video: {
                        facingMode: "user"
                    },
                    audio: false
                });

        camera.srcObject =
            stream;

        await camera.play();

        running = true;

        resetHandStates();

        if (status) {
            status.textContent =
                "Camera ready. Pinch a finger with your thumb to play.";
        }

        detectHands();

        return true;

    } catch (error) {
        console.error(
            "Camera error:",
            error
        );

        if (status) {
            status.textContent =
                "Camera could not be started. Check camera permission.";
        }

        return false;
    }
}

export function stopCamera() {
    running = false;

    if (animationFrame) {
        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;
    }

    if (stream) {
        stream
            .getTracks()
            .forEach(track => {
                track.stop();
            });

        stream = null;
    }

    if (camera) {
        camera.srcObject = null;
    }

    resetHandStates();

    if (feedbackTimer) {
        clearTimeout(
            feedbackTimer
        );

        feedbackTimer = null;
    }

    if (noteFeedback) {
        noteFeedback.classList.remove(
            "show"
        );

        noteFeedback.hidden = true;
    }

    if (
        context &&
        canvas
    ) {
        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }
}