#tutorial taken from here: https://www.geeksforgeeks.org/numpy/numpy-for-fast-fourier-transform-fft-analysis/
#tutorial taken from here: https://librosa.org/doc/main/auto_tutorials/01-intro/01-load.html
import numpy as np
import matplotlib.pyplot as plt
import librosa

#limbrosa testing
signal, sample_rate = librosa.load('music_files/The Sun Is Shining 4 copy.mp3')
print(f"Sample Rate: {sample_rate} Hz")
print(f"Signal Shape: {signal.shape}")

# Construct a figure and axes object:
fig, ax = plt.subplots()

# Plot on the axes:
librosa.display.waveshow(signal, sr=sample_rate, ax=ax)

# Set the title for the figure
ax.set(title="Trumpet example")

#FFT stuff
fft_values = np.fft.fft(signal)
N = len(signal)
T = 1/sample_rate

freq = np.fft.fftfreq(N,T)
magnitude = np.abs(fft_values)


plt.subplots()
plt.stem(freq[:N//2], magnitude[:N//2])
plt.title('Frequency Domain (Magnitude Spectrum)')
plt.xlabel('Frequency [Hz]')
plt.ylabel('Magnitude')
plt.tight_layout()
plt.show()