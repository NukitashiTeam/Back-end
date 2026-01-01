// @ts-nocheck
/**
 * Phân tích mood chuyên sâu dựa trên 5 chỉ số của Spotify
 * @param {Object} audioFeatures - Object chứa { valence, energy, danceability, acousticness, instrumentalness }
 */
function calculateAdvancedMood(features) {
    const { valence, energy, danceability, acousticness, instrumentalness } = features;
    
    let moods = [];
    
    // 1. Nhạc không lời / Tập trung (Instrumental)
    if (instrumentalness > 0.5) {
        moods.push('focused');
        if (energy < 0.3) moods.push('calm', 'meditative');
        else if (energy > 0.7) moods.push('cinematic', 'intense');
    }

    // --- NHÓM 2: PHÂN TÍCH THEO QUADRANT (Góc phần tư) ---

    // === GÓC 1: HIGH ENERGY + HIGH VALENCE (Vui vẻ, Sôi động) ===
    if (valence >= 0.6 && energy >= 0.6) {
        moods.push('happy');
        
        if (danceability >= 0.7) {
            moods.push('uplifting', 'energetic'); // Nhạc quẩy, Disco, Pop
        } else if (energy >= 0.8) {
            moods.push('powerful', 'confident'); // Rock vui, Anime opening
        } else {
            moods.push('cheerful');
        }
    }

    // === GÓC 2: HIGH ENERGY + LOW VALENCE (Giận dữ, Mạnh mẽ) ===
    else if (valence <= 0.45 && energy >= 0.7) {
        moods.push('powerful');
        
        if (energy >= 0.85) {
            moods.push('angry', 'rebellious'); // Metal, Punk
        } else if (danceability >= 0.6) {
            moods.push('focused', 'hypnotic'); // Techno, Dark House
        } else {
            moods.push('intense', 'edgy');
        }
    }

    // === GÓC 3: LOW ENERGY + HIGH VALENCE (Thư giãn, Lãng mạn) ===
    else if (valence >= 0.55 && energy <= 0.55) {
        moods.push('calm');
        
        if (acousticness >= 0.7) {
            moods.push('peaceful', 'intimate'); // Acoustic, Folk vui
        } else if (danceability >= 0.6) {
            moods.push('romantic', 'soulful'); // R&B, Soul
        } else if (features.tempo < 100) {
            moods.push('relaxed', 'easygoing'); // Reggae
        }
    }

    // === GÓC 4: LOW ENERGY + LOW VALENCE (Buồn, Suy tư) ===
    else if (valence <= 0.45 && energy <= 0.5) {
        moods.push('sad');
        
        if (acousticness >= 0.6) {
            moods.push('melancholic', 'nostalgic'); // Ballad, Folk buồn
        } else {
            moods.push('reflective', 'lonely');
        }
        
        if (instrumentalness > 0.2) moods.push('cinematic'); // Nhạc phim buồn
    }

    // === VÙNG TRUNG TÍNH (Neutral / Mixed) ===
    else {
        // Vùng giữa, khó xác định rõ ràng
        if (danceability >= 0.7) moods.push('groouvy', 'feel-good');
        else if (acousticness >= 0.5) moods.push('mellow', 'sentimental');
        else moods.push('hopeful', 'diverse');
    }

    // --- NHÓM 3: BỔ SUNG CÁC TAG PHỤ (Modifier) ---
    // Thêm gia vị cho chính xác hơn
    
    // Nếu nhạc rất "mộc" -> Thêm sentimental/intimate
    if (acousticness > 0.8 && !moods.includes('intimate')) {
        moods.push('intimate');
    }

    // Nếu nhạc cực kỳ mạnh -> Thêm explosive
    if (energy > 0.9) {
        moods.push('explosive');
    }

    // Lọc trùng lặp (nếu có) và trả về tối đa 3 mood quan trọng nhất
    return [...new Set(moods)].slice(0, 3);
}

module.exports = { calculateAdvancedMood };