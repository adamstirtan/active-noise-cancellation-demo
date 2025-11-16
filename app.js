/* Destructive Interference (ANC) Demo */

// UI drawer and modal setup (unchanged from template)
(function setupDrawer() {
  const sidebar = document.getElementById("sidebar");
  const openBtn = document.getElementById("menu-toggle");
  const backdrop = document.getElementById("backdrop");
  const mq = window.matchMedia("(max-width: 900px)");
  function closeDrawer() {
    sidebar && sidebar.classList.remove("open");
    backdrop && backdrop.classList.remove("show");
  }
  function openDrawer() {
    sidebar && sidebar.classList.add("open");
    backdrop && backdrop.classList.add("show");
  }
  openBtn &&
    openBtn.addEventListener("click", () => {
      if (sidebar.classList.contains("open")) closeDrawer();
      else openDrawer();
    });
  backdrop && backdrop.addEventListener("click", closeDrawer);
  window.addEventListener("resize", () => {
    if (!mq.matches) closeDrawer();
  });
})();

(function setupModal() {
  const modal = document.getElementById("template-modal");
  const backdrop = document.getElementById("template-modal-backdrop");
  const titleEl = document.getElementById("template-modal-title");
  const contentEl = document.getElementById("template-modal-content");
  const closeBtn = document.getElementById("template-modal-close");
  const infoBtn = document.getElementById("template-info-btn");
  function open(opts = {}) {
    if (!modal || !backdrop) return;
    if (opts.title && titleEl) titleEl.textContent = opts.title;
    if (opts.html && contentEl) contentEl.innerHTML = opts.html;
    modal.classList.add("show");
    backdrop.classList.add("show");
  }
  function close() {
    modal && modal.classList.remove("show");
    backdrop && backdrop.classList.remove("show");
  }
  window.TemplateUI = window.TemplateUI || {};
  window.TemplateUI.openModal = open;
  window.TemplateUI.closeModal = close;
  closeBtn && closeBtn.addEventListener("click", close);
  backdrop && backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  infoBtn && infoBtn.addEventListener("click", () => open());
})();

// Main ANC Demo Application
class ANCDemoApp {
  constructor() {
    // Canvas setup
    this.containerEl = document.getElementById("canvas-container");
    this.canvas = document.getElementById("simCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Status displays
    this.durationDisplay = document.getElementById("recording-duration");
    this.statusDisplay = document.getElementById("recording-status");
    this.ancStatusDisplay = document.getElementById("anc-status");

    // Control buttons
    this.recordButton = document.getElementById("recordButton");
    this.stopRecordButton = document.getElementById("stopRecordButton");
    this.playButton = document.getElementById("playButton");
    this.pauseButton = document.getElementById("pauseButton");
    this.waveformButton = document.getElementById("waveformButton");
    this.spectrumButton = document.getElementById("spectrumButton");
    this.ancToggle = document.getElementById("anc-toggle");

    // Audio state
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordedAudioBuffer = null;
    this.sourceNode = null;
    this.analyser = null;
    this.gainNode = null;
    this.isRecording = false;
    this.isPlaying = false;
    this.recordingStartTime = 0;
    this.recordingDuration = 0;
    this.maxRecordingTime = 15; // 15 seconds max
    this.ancMode = false;
    this.visualizationMode = "waveform"; // "waveform" or "spectrum"

    // Animation
    this.animationId = null;

    this.init();
  }

  async init() {
    this.resizeCanvasToContainer();
    window.addEventListener("resize", () => this.resizeCanvasToContainer());
    this.attachEvents();
    this.clearCanvas();
    this.updateStatus("Ready to record");
  }

  attachEvents() {
    this.recordButton?.addEventListener("click", () => this.startRecording());
    this.stopRecordButton?.addEventListener("click", () =>
      this.stopRecording()
    );
    this.playButton?.addEventListener("click", () => this.playAudio());
    this.pauseButton?.addEventListener("click", () => this.pauseAudio());
    this.waveformButton?.addEventListener("click", () => {
      this.visualizationMode = "waveform";
    });
    this.spectrumButton?.addEventListener("click", () => {
      this.visualizationMode = "spectrum";
    });
    this.ancToggle?.addEventListener("change", (e) => {
      this.ancMode = e.target.checked;
      this.updateANCStatus();
      if (this.isPlaying && this.gainNode) {
        // Update gain in real-time during playback
        this.gainNode.gain.value = this.ancMode ? -1 : 1;
      }
    });
  }

  async startRecording() {
    try {
      // Safari has issues with empty audio constraints objects
      // Use the simplest possible form: just 'true'
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (firstError) {
        // If that fails, try with an empty object (some browsers prefer this)
        console.log(
          "First attempt failed, trying alternate constraint format..."
        );
        stream = await navigator.mediaDevices.getUserMedia({ audio: {} });
      }

      // Initialize AudioContext if not already done
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const arrayBuffer = await audioBlob.arrayBuffer();
        this.recordedAudioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        this.updateStatus("Recording complete");
        this.playButton.disabled = false;
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.recordButton.disabled = true;
      this.stopRecordButton.disabled = false;
      this.playButton.disabled = true;
      this.updateStatus("Recording...");

      // Update duration display
      this.updateRecordingDuration();

      // Auto-stop after max time
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.maxRecordingTime * 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      if (error.constraint) {
        console.error("Failed constraint:", error.constraint);
      }

      // Provide specific error messages
      let message = "Microphone access failed";
      if (error.name === "NotAllowedError") {
        message =
          "Microphone permission denied - please allow access in browser settings";
      } else if (error.name === "NotFoundError") {
        message = "No microphone found on this device";
      } else if (error.name === "OverconstrainedError") {
        message = "Browser constraint error - please try a different browser";
      }

      this.updateStatus(message);
    }
  }

  updateRecordingDuration() {
    if (!this.isRecording) return;

    const elapsed = (Date.now() - this.recordingStartTime) / 1000;
    this.recordingDuration = elapsed;
    this.durationDisplay.textContent = elapsed.toFixed(1) + "s";

    if (elapsed < this.maxRecordingTime) {
      requestAnimationFrame(() => this.updateRecordingDuration());
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.recordButton.disabled = false;
      this.stopRecordButton.disabled = true;
    }
  }

  playAudio() {
    if (!this.recordedAudioBuffer) return;

    // Stop any currently playing audio
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }

    // Create audio nodes
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.recordedAudioBuffer;

    // Create gain node for phase inversion
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.ancMode ? -1 : 1;

    // Create analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Connect nodes: source -> gain -> analyser -> destination
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Handle playback end
    this.sourceNode.onended = () => {
      this.isPlaying = false;
      this.playButton.disabled = false;
      this.pauseButton.disabled = true;
      this.updateStatus("Playback complete");
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    };

    this.sourceNode.start();
    this.isPlaying = true;
    this.playButton.disabled = true;
    this.pauseButton.disabled = false;
    this.updateStatus("Playing...");

    // Start visualization
    this.visualize();
  }

  pauseAudio() {
    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop();
      this.sourceNode = null;
      this.isPlaying = false;
      this.playButton.disabled = false;
      this.pauseButton.disabled = true;
      this.updateStatus("Paused");
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  visualize() {
    if (!this.analyser || !this.isPlaying) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!this.isPlaying) return;

      this.animationId = requestAnimationFrame(draw);

      if (this.visualizationMode === "waveform") {
        this.analyser.getByteTimeDomainData(dataArray);
        this.drawWaveform(dataArray, bufferLength);
      } else {
        this.analyser.getByteFrequencyData(dataArray);
        this.drawSpectrum(dataArray, bufferLength);
      }
    };

    draw();
  }

  drawWaveform(dataArray, bufferLength) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = this.ancMode ? "#ff6b6b" : "#5cf2c7";
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = "rgba(231,237,246,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = "#e7edf6";
    ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText(
      this.ancMode ? "Waveform (ANC Mode - Inverted)" : "Waveform (Normal)",
      16,
      24
    );
  }

  drawSpectrum(dataArray, bufferLength) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;

      const gradient = ctx.createLinearGradient(
        0,
        height - barHeight,
        0,
        height
      );
      if (this.ancMode) {
        gradient.addColorStop(0, "#ff6b6b");
        gradient.addColorStop(1, "#ff9999");
      } else {
        gradient.addColorStop(0, "#5cf2c7");
        gradient.addColorStop(1, "#57a6ff");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    // Draw label
    ctx.fillStyle = "#e7edf6";
    ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText(
      this.ancMode
        ? "Frequency Spectrum (ANC Mode)"
        : "Frequency Spectrum (Normal)",
      16,
      24
    );
  }

  resizeCanvasToContainer() {
    if (!this.containerEl || !this.canvas) return;
    const w = this.containerEl.clientWidth;
    const h = this.containerEl.clientHeight;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.clearCanvas();
    }
  }

  clearCanvas() {
    const w = this.canvas.width || 300;
    const h = this.canvas.height || 300;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, w, h);

    // Draw initial message
    this.ctx.fillStyle = "#a7b1c2";
    this.ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Click 'Record' to start", w / 2, h / 2);
    this.ctx.textAlign = "left";
  }

  updateStatus(msg) {
    if (this.statusDisplay) this.statusDisplay.textContent = msg;
  }

  updateANCStatus() {
    if (this.ancStatusDisplay) {
      this.ancStatusDisplay.textContent = this.ancMode ? "On" : "Off";
      this.ancStatusDisplay.style.color = this.ancMode ? "#ff6b6b" : "#4ecdc4";
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new ANCDemoApp();
});
