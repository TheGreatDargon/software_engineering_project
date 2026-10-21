# Python flie to describe the song of a mp3 file
from tinytag import TinyTag
import urllib.request
from coverpy import CoverPy, NoResultsException
from PIL import Image

class Song:
    def __init__(self, file_path):
        self.file_path = file_path
        self.tag = TinyTag.get(file_path)
        self.title = self.tag.title
        self.artist = self.tag.artist
        self.album = self.tag.album
        self.release_date = self.tag.year
        self.genre = self.tag.genre
        self.bpm = None # Placeholder for BPM
        self.duration = self.tag.duration
        self.musical_key = None # Placeholder for musical key
        self.youtube_link = None # Placeholder for YouTube link
        self.cover_art_url = self.fetch_cover_art()
        self.cover_art_path = self.download_cover_art(f"./.cover_art/{self.artist} - {self.title}.jpg") if self.cover_art_url else None

    def get_metadata(self):
        metadata = {
            'title': self.tag.title,
            'artist': self.tag.artist,
            'album': self.tag.album,
            'release_date': self.tag.year,
            'genre': self.tag.genre,
            'duration': self.tag.duration,
        }
        return metadata

    def fetch_cover_art(self):
        client = CoverPy()
        search_query = f"{self.tag.artist} {self.tag.title}"

        try:
            result = client.get_cover(search_query, limit=1)
            self.cover_art_url = result.artwork(1200)
            return self.cover_art_url
        except NoResultsException:
            print("No album artwork found for this query.")
            return None

    def download_cover_art(self, output_filename):
        if self.cover_art_url:
            urllib.request.urlretrieve(self.cover_art_url, output_filename)
            return output_filename
        else:
            print("Cover art URL is not available. Please fetch cover art first.")

song = Song('./.music_files/shinzo/11 MIRROR.mp3') 

print(song.artist, song.title)
print(song.cover_art_path)
img = Image.open(f"{song.cover_art_path}")
img.show()