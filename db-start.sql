-- MySQL database setup

CREATE DATABASE IF NOT EXISTS music_suggester;
USE music_suggester;

-- Users who can log in and save playlists
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Songs from the dataset and songs uploaded by users
CREATE TABLE IF NOT EXISTS songs (
    song_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    release_date DATE,
    genre VARCHAR(100),
    bpm DECIMAL(6,2),
    duration_seconds INT,
    musical_key VARCHAR(10),
    youtube_url VARCHAR(500),
    uploaded_by_user_id INT,

    FOREIGN KEY (uploaded_by_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- Playlists saved by users
CREATE TABLE IF NOT EXISTS playlists (
    playlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    playlist_name VARCHAR(255) NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- Songs in each playlist, including their order
CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INT NOT NULL,
    song_id INT NOT NULL,
    position INT NOT NULL,

    PRIMARY KEY (playlist_id, song_id),
    UNIQUE (playlist_id, position),

    FOREIGN KEY (playlist_id)
        REFERENCES playlists(playlist_id) ON DELETE CASCADE,
    FOREIGN KEY (song_id)
        REFERENCES songs(song_id) ON DELETE CASCADE
);

-- Information about saved audio uploads (MP3, WAV, etc.)
-- Actual audio files are saved by the application, not in MySQL.
CREATE TABLE IF NOT EXISTS song_uploads (
    song_id INT PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    analysis_status VARCHAR(20) NOT NULL DEFAULT 'pending',

    FOREIGN KEY (song_id)
        REFERENCES songs(song_id) ON DELETE CASCADE
);

-- Audio features extracted for song comparisons
-- The application defines the contents of these JSON arrays.
CREATE TABLE IF NOT EXISTS song_audio_features (
    song_id INT PRIMARY KEY,
    waveform_features JSON NOT NULL,
    frequency_features JSON NOT NULL,

    FOREIGN KEY (song_id)
        REFERENCES songs(song_id) ON DELETE CASCADE
);