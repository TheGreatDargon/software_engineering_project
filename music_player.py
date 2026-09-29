import os
# os.environ["PYGAME_HIDE_SUPPORT_PROMPT"]
import pygame #type: ignore

def main():
    try:
        pygame.mixer.init()
    except pygame.error as er:
        print("Audio File initialization failed", er)
        return

    folder = "music_files"

    if not os.path.isdir(folder):
        print(f"Folder '{folder}' not found")
        return()

    mp3_files = [file for file in os.listdir(folder) if file.endswith(".mp3" )]

    if not mp3_files:
        print("No .mp3 files were found")
    else:
        print(mp3_files)

    #text decoration part
    print(" ***** MP3 PLAYER *****")
    print("My song list: ")

    for index, song in enumerate(mp3_files, start = 1):
        print(f"{index}. {song}")


main()
 
# read in mp3 files and feed it to a network, end goal is to detect if a song is made wth ai or not.
# make a similarity score for tracks imported to help with sampling and/or mashups