# Usage Guide - Destructive Interference Demo

## Quick Start

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Grant microphone permissions when prompted
3. Click "🎙 Record" to start recording
4. Speak into your microphone (up to 15 seconds)
5. Click "⏹ Stop" to stop recording
6. Click "▶ Play" to hear your recording
7. Toggle the "ANC Mode" checkbox during playback to hear the phase-inverted version

## Features

### Recording
- Maximum duration: 15 seconds
- Real-time duration display
- Auto-stop when limit is reached
- Status updates during recording

### Playback
- **Normal Mode**: Plays your recording as-is
- **ANC Mode**: Plays the phase-inverted version (demonstrates destructive interference)
- Toggle ANC mode in real-time during playback to hear the difference

### Visualization
- **📈 Waveform**: Shows the time-domain representation of your audio
- **📊 Spectrum**: Shows the frequency-domain representation (FFT analysis)
- Visual changes when ANC mode is enabled (red color indicates inverted phase)

## What You'll Notice

When ANC mode is enabled:
- The visualization changes color from cyan/blue to red
- The audio signal is phase-inverted (multiplied by -1)
- If played alongside the original, the sounds would cancel out (destructive interference)
- The "ANC Mode" status indicator shows "On" in red

## Browser Compatibility

Requires a browser with support for:
- Web Audio API
- MediaRecorder API
- getUserMedia API

Tested on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Troubleshooting

**Microphone access denied:**
- Check browser permissions
- Ensure you're on HTTPS or localhost
- Try a different browser

**No audio playback:**
- Ensure you recorded something first
- Check your system volume
- Try refreshing the page

**Visualization not updating:**
- Ensure audio is playing
- Try toggling between Waveform and Spectrum views
- Refresh the page if needed

## Educational Value

This demo illustrates the fundamental principle behind Active Noise Cancellation (ANC):
- When two identical sound waves are combined in opposite phase, they cancel out
- ANC headphones use this principle in real-time to cancel ambient noise
- The phase inversion is achieved by multiplying the signal by -1

Mathematical representation:
```
Original signal: A(t)
Inverted signal: -A(t)
Combined: A(t) + (-A(t)) = 0
```

This is a simplified demonstration - real ANC systems also include:
- Real-time processing with minimal latency
- Adaptive filtering to match the noise characteristics
- Multiple microphones for better noise detection
- Sophisticated DSP algorithms
