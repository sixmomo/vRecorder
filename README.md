vRecorder

A Node.js web application to record Screen and Camera on Windows with real-time transcriptions.

Features

Screen Recording: Select specific windows or full screen.

Camera Recording: Capture webcam footage.

Real-time Transcription: Uses Web Speech API (English/Chinese) and embeds text into the video.

File Management: Saves videos automatically to C:\vibecoding\vRecorder\yyyymmdd... folders.

Prerequisites

Node.js installed on your machine.

Google Chrome (required for Web Speech API support).

Installation

Navigate to the project folder:

cd C:\vibecoding\vRecorder


Install dependencies:

npm install


Running the App

Start the server:

npm start


Open Google Chrome and visit:
http://localhost:3000

Usage Instructions

Permissions: When you click "Start Recording", allow Microphone and Camera access.

Screen Selection: A browser popup will appear. Select the Window or Screen you want to record. Ensure "Share system audio" is checked if you want computer sound.

Recording: The app will show a preview. If "Mic" is enabled, speak to see subtitles appear on the video.

Saving: Click "Stop Recording". Files are saved in the project folder under a timestamped directory.

Note on Video Format

The videos are saved as .webm files. This is the native format for web browser recording. You can play them in Chrome, VLC Player, or the Windows "Movies & TV" app (may require codecs).