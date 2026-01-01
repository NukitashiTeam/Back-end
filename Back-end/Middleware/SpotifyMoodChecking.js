// @ts-nocheck
const axios = require('axios');
const qs = require('qs');

// 2. SỬA LẠI TÊN BIẾN MÔI TRƯỜNG (Bỏ chữ YOUR_ đi nếu file .env của bạn không có)
const CLIENT_ID = process.env.YOUR_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUR_SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ CHẾT RỒI: Chưa đọc được Key trong file .env. Kiểm tra lại ngay!");
}

let _token = null;
let _tokenExpiresAt = 0; // Tên biến chuẩn

async function _getToken() {
    if (_token && Date.now() < _tokenExpiresAt) return _token;

    try {
        console.log("🔄 Đang xin Token mới từ Spotify...");
        const url = 'https://accounts.spotify.com/api/token';

        const res = await axios.post(url, 
            qs.stringify({ grant_type: 'client_credentials' }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
            }
        });

        _token = res.data.access_token;
        // Sửa lại tên biến gán
        _tokenExpiresAt = Date.now() + (res.data.expires_in * 1000) - 60000;
        return _token;
    } catch (e) {
        console.error('❌ Lỗi Auth Spotify:', e.response ? e.response.data : e.message);
        return null;
    }
}

async function getAudioFeatures(title, artist, number, durationSec) {
    const token = await _getToken();
    if (!token) return null;

    console.log('token có dạng: ', token);
    
    try {
        const cleanTitle = title.split('(')[0].trim();
        const query = `track:${cleanTitle} artist:${artist}`;

        console.log('Query tìm kiếm Spotify:', query);

        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

        const searchRes = await axios.get(searchUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        searchRes.data.tracks.items.forEach((item, index) => {
            console.log(`--- Track #${index + 1} ---`);
            console.log({
                id: item.id,
                name: item.name,
                artist: item.artists.map(a => a.name).join(', '),
                duration_ms: item.duration_ms,
                preview_url: item.preview_url
            });
        });
        
        
        const tracks = searchRes.data.tracks.items;
        if (!tracks.length) return null;

        // B. Đối chiếu thời lượng (Nới lỏng lên 10s để dễ bắt bài hát hơn)
        const targetMs = durationSec * 1000;
        console.log("Thời lượng mục tiêu (ms):", targetMs);
        const bestMatch = tracks.find(t => Math.abs(t.duration_ms - targetMs) < 10000);

        if (!bestMatch) {
            console.log('Không tìm được bài hát phù hợp về thời lượng.');
            // console.log(`⚠️ Lệch thời gian quá nhiều (iTunes: ${durationSec}s).`);
            return null;
        }

        const featureUrl = `https://api.spotify.com/v1/audio-features/${bestMatch.id}`;

        const featRes = await axios.get(featureUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Kết quả mapping audio nhạc:', featRes.data);

        return {
            spotify_id: bestMatch.id,
            valence: featRes.data.valence,
            energy: featRes.data.energy,
            danceability: featRes.data.danceability,
            acousticness: featRes.data.acousticness,
            instrumentalness: featRes.data.instrumentalness,
            tempo: featRes.data.tempo
        };

    } catch (e) {
        console.error('❌ Lỗi API Spotify:', e.response ? e.response.status : e.message);
        return null;
    }
}

module.exports = { getAudioFeatures };