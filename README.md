# 🎧 Destructive Interference Demo

**Explore how Active Noise Cancellation (ANC) works — by turning sound waves against themselves.**

This interactive demo lets you **record your own voice** (up to 15 seconds), then **play it back** while toggling a simulated ANC mode.  
When ANC mode is enabled, the playback signal is **phase-inverted**, demonstrating the concept of **destructive interference** — the principle behind modern noise-cancelling headphones.

---

## 🧠 Concept Overview

In sound, **waves add together** — amplifying or canceling one another depending on their **phase**.

When two identical waves meet in **opposite phase** (one is the mirror image of the other), their amplitudes cancel out:

Wave A:     ~~~~~~~~
Wave B:     —–– (inverse)
Sum:        (cancelled)

Mathematically:
\[
A(t) + (-A(t)) = 0
\]

That’s **destructive interference** — the idea that if you play an inverted copy of a sound, it can neutralize the original.  
True **active noise cancellation** uses this principle in real time with microphones and fast digital signal processing to generate the opposite wave before the noise reaches your ears.

This demo simulates that concept by allowing you to record and replay sound with phase inversion applied.

## 🧩 Features

- 🎙️ **Record** audio directly from your microphone (up to 15 seconds)
- ▶️ **Playback** your recording normally or with ANC simulation enabled
- 🔄 **Toggle ANC mode live** during playback to hear the difference
- 📊 **Visualize** the waveform or frequency spectrum in real time
- 🧭 Integrated into the standard demo layout:
  - Sidebar for controls
  - Titlebar for experiment info
  - Main visualization area

## ⚙️ How It Works

1. **Recording**  
   Uses the browser’s `MediaRecorder` API to capture microphone audio into a `Float32Array`.

2. **Playback**  
   Audio is played through the Web Audio API’s `AudioBufferSourceNode`.

3. **ANC Simulation**  
   When ANC is toggled on, the waveform samples are multiplied by `-1`, producing a phase-inverted signal:
   ```js
   inverted[i] = -original[i];
   ```
This creates destructive interference when played alongside or alternating with the original.

4.	**Visualization**
The waveform (time domain) and optional frequency spectrum (via AnalyserNode FFT) are rendered to the main canvas area using requestAnimationFrame.

🧱 Technical Details
	•	Tech stack: Vanilla JavaScript + Web Audio API
	•	APIs used:
	•	navigator.mediaDevices.getUserMedia()
	•	AudioContext, MediaRecorder, AnalyserNode, AudioBufferSourceNode
	•	Max recording length: 15 seconds
	•	Playback control: Pause, play, ANC toggle
