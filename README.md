# Virtual Piano

A browser-based virtual piano that can be played using the mouse, computer keyboard, songs, and an experimental camera-based hand-control system.

## Live Demo

**Live:**  
https://virtual-piano-eta.vercel.app/

## Features

- Full 88-key virtual piano
- Mouse controls
- Computer keyboard controls
- Octave controls
- Piano sound generated with the Web Audio API
- Song playback
- Experimental camera mode
- Hand tracking with MediaPipe
- Finger-to-note mapping using pinch gestures
- Responsive interface

## Songs

Currently included:

- Happy Birthday
- Ode to Joy
- Minuet in G
- Prelude in C Major
- Turkish March

## Camera Piano

Camera mode uses hand tracking to detect finger movements and pinch gestures.

### White Keys

| Finger | Note |
|---|---|
| Left pinky | C |
| Left ring | D |
| Left middle | E |
| Left index | F |
| Right index | G |
| Right middle | A |
| Right ring | B |
| Right pinky | C |

### Black Keys

| Finger | Note |
|---|---|
| Left pinky | C# |
| Left ring | D# |
| Left index | F# |
| Right index | G# |
| Right middle | A# |

## Technologies

- HTML5
- CSS3
- JavaScript
- Web Audio API
- MediaPipe Tasks Vision
- Node.js
- npm

## Project Structure

```text
virtual-piano/
├── index.html
├── piano.html
├── instructions.html
├── style.css
│
├── js/
│   ├── main.js
│   ├── audio.js
│   ├── piano.js
│   ├── keyboard.js
│   ├── camera.js
│   └── songs.js
│
├── models/
│   └── hand_landmarker.task
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore