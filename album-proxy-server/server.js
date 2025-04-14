const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3001;

// Allow CORS from your frontend
app.use(cors());

// Image proxy endpoint
app.get('/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send('Image URL is required');
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res
        .status(response.status)
        .send(`Failed to fetch image: ${response.statusText}`);
    }

    // Copy all headers from the fetched image
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    // Pipe the image data directly to the response
    response.body.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Error proxying image');
  }
});

// Last.fm API proxy endpoint
app.get('/lastfm-api', async (req, res) => {
  const apiKey = process.env.LASTFM_API_KEY || req.query.apiKey;
  const method = req.query.method || 'album.search';
  const album = req.query.album;

  if (!album) {
    return res.status(400).send('Album parameter is required');
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=${method}&album=${encodeURIComponent(
        album,
      )}&api_key=${apiKey}&format=json&limit=20`,
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).send('Error proxying API request');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
