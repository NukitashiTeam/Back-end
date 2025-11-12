const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
app.use(cors()); 

require('dotenv').config();

const connectDB = require('./database');
const Music = require('./Model/MusicSchema');
const musicRouter = require('./Router/MusicRouter');

connectDB();

app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/music', async (req, res) => {
  const music = await Music.find(); // Lấy tất cả music
  res.json(music);
});

app.get('/itunes', async (req, res) => {
  try {
    const keyword = String(req.query.keyword || '').trim();

    if (!keyword) {
      return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm (keyword)' });
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=musicTrack&limit=10`;
    const response = await axios.get(url);
    const results = response.data.results;

    // Ghi dữ liệu ra file JSON
    const filePath = path.join(__dirname, 'itunes_data.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2), 'utf-8');

    // Trả về kết quả cho client
    res.json({ message: 'OK', data: results });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.use('/api/music', musicRouter);

app.use(cors({
  origin: [
    'https://mymusic.vercel.app',
    'https://mymusic.netlify.app',
    'https://mymusic.com',
    'http://localhost:3000', 
    'http://localhost:8080'
  ],
  credentials: true
}));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

