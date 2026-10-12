CREATE DATABASE IF NOT EXISTS music_suggester;

USE music_suggester;

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
    youtube_url VARCHAR(500)
);