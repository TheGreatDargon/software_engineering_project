#tutorial taken from here: https://www.geeksforgeeks.org/numpy/numpy-for-fast-fourier-transform-fft-analysis/
#tutorial taken from here: https://librosa.org/doc/main/auto_tutorials/01-intro/01-load.html
import numpy as np
import matplotlib.pyplot as plt
import librosa

#call the function to run a file through FTT analysis
def analyizeFFT(filePath):
    file = filePath
    signal, sample_rate = librosa.load(file, offset = 11.0, duration = 60.0)

    #if we can make sure that N will be the same for any input track it will improve thigns during the 
    #graphing/testing similarity score step
    target_len = 60 * 22050
    if len(signal) < target_len:
        signal = np.pad(signal, (0, target_len - len(signal)))
    else:
        signal = signal[:target_len]


    #FFT stuff
    fft_values = np.fft.fft(signal)
    N = len(signal)
    T = 1/sample_rate

    freq = np.fft.fftfreq(N,T)
    magnitude = np.abs(fft_values)

    #current Similarity score method only needs magnitude, graphing requires all 3 here
    return (freq, magnitude, N)

    

#I always make things harder than they need to be. Librosa has built in tempo check: https://librosa.org/doc-playground/0.7.2/generated/librosa.beat.tempo.html
def analyizeBPM(filePath):
    #grab the audio, throw it into an envelope
    signal, sample_rate = librosa.load(filePath, offset = 11.0, duration = 60.0)
    onset_env = librosa.onset.onset_strength(y=signal, sr=sample_rate)

    #get the tempo (bpm) which will be a float
    tempo = librosa.feature.tempo(onset_envelope=onset_env, sr=sample_rate)
    tempo = int(tempo) #i want it as an int and it works... but it does throw a warning.
    print(f"Beats Per Minute: {tempo}")

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


#initiate input file given by user
file = ".music_files/Doechii - Anxiety (Official Video).mp3"
freq_input, mag_input, track_length1 = analyizeFFT(file)
print(f"your input song is {file}")
analyizeBPM(file) #for 7 nation army, a song thats bpm is 124, im getting 123.04 hits a minute.

#start database track checks
file = ".music_files/Gotye - Somebody That I Used To Know (feat. Kimbra) [Official Music Video] 4.mp3"
freq_DB, mag_DB, track_length2 = analyizeFFT(file)
analyizeBPM(file)

#cosine check on the two magnitudes, IDK if its that good
score = cosine_sim(mag_input, mag_DB) * 100
print(f"Similarity Score = {score}")

file = ".music_files/Labi Siffre - I Got The... (1975) 4.mp3"
freq_DB, mag_DB, track_length2 = analyizeFFT(file)
analyizeBPM(file)
#cosine check on the two magnitudes, IDK if its that good
score = cosine_sim(mag_input, mag_DB) * 100
print(f"Similarity Score = {score}")

file = ".music_files/The White Stripes - Seven Nation Army (Official Music Video) 4.mp3"
freq_DB, mag_DB, track_length2 = analyizeFFT(file)
analyizeBPM(file)
#cosine check on the two magnitudes, IDK if its that good
score = cosine_sim(mag_input, mag_DB) * 100
print(f"Similarity Score = {score}")

#graph the results // extreamly computationally expensive and is just for testing/learning.
#plt.subplots()
#plt.stem(freq_input[:track_length1//2], mag_input[:track_length1//2],linefmt='C0-', markerfmt='C0o', basefmt=' ', label='sig1')
#plt.stem(freq_DB[:track_length1//2], mag_DB[:track_length1//2], linefmt='C1-', markerfmt='C1o', basefmt=' ', label='sig2')
#plt.title(f"{file}(Magnitude Spectrum)")
#plt.xlabel('Frequency [Hz]')
#plt.ylabel('Magnitude')
#plt.tight_layout()

#curnt = plt.gca()
#curnt.set_xlim([0,5000])


plt.show()

