const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public' directory
app.use(express.static('public'));

// Helper to format date for folder name: yyyymmdd-hh-mm-ss
function getTimestampName() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}-${hh}-${mm}-${ss}`;
}

io.on('connection', (socket) => {
    console.log('Client connected');
    let currentDir = null;
    let streams = {}; // Store write streams

    // 1. Initialize Recording Session
    socket.on('start-recording', () => {
        const folderName = getTimestampName();
        
        // CHANGED: Save under /recording/ folder
        const recordingRoot = path.join(__dirname, 'recording');
        if (!fs.existsSync(recordingRoot)){
            fs.mkdirSync(recordingRoot);
        }
        currentDir = path.join(recordingRoot, folderName);

        // Create directory
        if (!fs.existsSync(currentDir)){
            fs.mkdirSync(currentDir);
            console.log(`Created directory: ${currentDir}`);
        }

        // Initialize transcript file
        streams['transcript'] = fs.createWriteStream(path.join(currentDir, 'transcript.txt'), { flags: 'a' });
        
        // Notify client ready
        socket.emit('recording-started', { folderName });
    });

    // 2. Handle Video Data Chunks
    // type: 'screen' or 'camera'
    socket.on('video-chunk', ({ type, data }) => {
        if (!currentDir) return;

        // Create write stream if it doesn't exist for this type
        if (!streams[type]) {
            // Note: Browsers usually stream WebM. We name it .webm for compatibility.
            // Converting to strict MP4 requires ffmpeg on the server, which is complex to set up.
            // WebM plays in Chrome/VLC.
            const fileName = `${type}_recording.webm`; 
            streams[type] = fs.createWriteStream(path.join(currentDir, fileName), { flags: 'a' });
        }

        streams[type].write(data);
    });

    // 3. Handle Transcript Data
    socket.on('transcript-data', ({ text, timestamp }) => {
        if (streams['transcript']) {
            streams['transcript'].write(`[${timestamp}] ${text}\n`);
        }
    });

    // 4. Stop Recording
    socket.on('stop-recording', () => {
        console.log('Recording stopped');
        // Close all streams
        Object.values(streams).forEach(stream => stream.end());
        streams = {};
        currentDir = null;
    });

    socket.on('disconnect', () => {
        // Cleanup if disconnected unexpectedly
        Object.values(streams).forEach(stream => stream.end());
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});