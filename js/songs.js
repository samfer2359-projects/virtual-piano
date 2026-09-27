import { playNoteByName } from "./piano.js";
import { ensureAudioReady } from "./audio.js";

const songs = {
    "Happy Birthday": "G4 G4 A4 G4 C5 B4|G4 G4 A4 G4 D5 C5|G4 G4 G5 E5 C5 B4 A4|F5 F5 E5 C5 D5 C5",
    "Ode to Joy": "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4|E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4|D4 D4 E4 C4 D4 E4 F4 E4 C4 D4 E4 F4 E4 D4 C4 D4|E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4",
    "Minuet in G": "D5 G4 A4 B4 C5 D5 G4 G4|E5 C5 D5 E5 F#5 G5 G4 G4|C5 A4 B4 C5 D5 E5 A4 A4|D5 B4 C5 D5 E5 F#5 B4 B4|G5 E5 F#5 G5 A5 B5 E5 E5|A5 F#5 G5 A5 B5 C6 F#5 F#5|G5 E5 F#5 G5 A5 B5 E5 E5|A5 F#5 G5 A5 B5 C6 F#5 F#5",
    "Prelude in C Major": "C4 E4 G4 C5 E5 G5 C5 E5 G5 C5 E5 G5|D4 F4 A4 D5 F5 A5 D5 F5 A5 D5 F5 A5|B3 D4 G4 B4 D5 G5 B4 D5 G5 B4 D5 G5|C4 E4 G4 C5 E5 G5 C5 E5 G5 C5 E5 G5|A3 C4 E4 A4 C5 E5 A4 C5 E5 A4 C5 E5|D4 F4 A4 D5 F5 A5 D5 F5 A5 D5 F5 A5|G3 B3 D4 G4 B4 D5 G4 B4 D5 G4 B4 D5|C4 E4 G4 C5 E5 G5 C5 E5 G5 C5 E5 C5",
    "Turkish March": "B4 A4 G#4 A4 B4 C5 D5|E5 D5 C5 B4 A4 G#4 A4|B4 C5 D5 E5 F#5 E5 D5 C5|B4 A4 G#4 A4 B4 C5 D5|E5 F#5 G#5 A5 G#5 F#5 E5 D5|C5 B4 A4 G#4 A4 B4 C5|D5 E5 F#5 E5 D5 C5 B4 A4|G#4 A4 B4 C5 B4 A4 G#4 G#4"
};

const durations = {
    short: 0.35,
    normal: 0.5,
    long: 0.8
};

let currentSong = null;
let currentButton = null;
let songTimer = null;

function parseSong(text) {
    return text
        .split("|")
        .flatMap(phrase =>
            phrase
                .trim()
                .split(/\s+/)
                .map(note => [note, durations.normal])
        );
}

function stopSong() {
    currentSong = null;

    if (songTimer) {
        clearTimeout(songTimer);
        songTimer = null;
    }

    if (currentButton) {
        currentButton.textContent = "Play";
        currentButton = null;
    }
}

function createSongCard(name) {
    const card = document.createElement("article");
    card.className = "song-card";

    const title = document.createElement("h2");
    title.textContent = name;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Play";

    button.addEventListener("click", async () => {
        if (currentSong === name) {
            stopSong();
            return;
        }

        stopSong();
        await playSong(name, button);
    });

    card.append(title, button);
    return card;
}

async function playSong(name, button) {
    const songText = songs[name];

    if (!songText) {
        return;
    }

    const song = parseSong(songText);

    await ensureAudioReady();

    currentSong = name;
    currentButton = button;
    button.textContent = "Stop";

    let index = 0;

    const playNextNote = async () => {
        if (currentSong !== name) {
            return;
        }

        if (index >= song.length) {
            stopSong();
            return;
        }

        const [note, duration] = song[index];

        await playNoteByName(note, 0.55, duration);

        index++;

        songTimer = setTimeout(
            playNextNote,
            duration * 1000
        );
    };

    playNextNote();
}

function initSongs() {
    const container = document.getElementById("songs-list");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    for (const name of Object.keys(songs)) {
        container.appendChild(
            createSongCard(name)
        );
    }

    const stopButton = document.getElementById("stop-song");

    if (stopButton) {
        stopButton.addEventListener(
            "click",
            stopSong
        );
    }
}

initSongs();

export { stopSong };