const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

app.post('/api/transcript', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        
        if (!videoUrl) {
            return res.status(400).json({ error: 'Video URL is required' });
        }

        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        console.log(`Fetching transcript for video ID: ${videoId}`);

        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const fullTranscript = transcript.map(item => item.text).join(' ');

        console.log(`Successfully fetched transcript for video ID: ${videoId}`);

        res.json({ transcript: fullTranscript });
    } catch (error) {
        console.error('Error:', error.message);
        if (error.message.includes('Could not retrieve a transcript for the video')) {
            res.status(404).json({ error: 'Transcript not available for this video' });
        } else {
            res.status(500).json({ error: 'Failed to fetch transcript' });
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});