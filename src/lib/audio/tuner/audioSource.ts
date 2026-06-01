export class AudioSource {
  private analyser: AnalyserNode;
  private dataArray: Float32Array<ArrayBuffer>;
  private rafId: number | null = null;

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
    this.analyser.fftSize = 2048;
    this.dataArray = new Float32Array(this.analyser.fftSize);
  }

  private getVolume(buffer: Float32Array): number {
    let sum = 0;

    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i];
      sum += v * v;
    }

    return Math.sqrt(sum / buffer.length);
  }

  start(callback: (frequency: number) => void) {
    const tick = () => {
      this.analyser.getFloatTimeDomainData(this.dataArray);

      const volume = this.getVolume(this.dataArray);
      if (volume < 0.01) {
        this.rafId = requestAnimationFrame(tick);
        return;
      }

      const frequency = this.estimateFrequency(this.dataArray);
      if (frequency > 20 && frequency < 5000) {
        callback(frequency);
      }

      this.rafId = requestAnimationFrame(tick);
    };

    tick();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
  private estimateFrequency(buffer: Float32Array): number {
    const sampleRate = this.analyser.context.sampleRate;

    // 1. RMS check (reject silence / noise floor)
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i];
      rms += v * v;
    }
    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) return 0;

    // 2. Normalise signal (helps stability)
    const size = buffer.length;
    const norm = new Float32Array(size);

    let mean = 0;
    for (let i = 0; i < size; i++) mean += buffer[i];
    mean /= size;

    for (let i = 0; i < size; i++) {
      norm[i] = buffer[i] - mean;
    }

    // 3. Autocorrelation
    const correlations = new Float32Array(size);

    for (let lag = 0; lag < size; lag++) {
      let sum = 0;

      for (let i = 0; i < size - lag; i++) {
        sum += norm[i] * norm[i + lag];
      }

      correlations[lag] = sum;
    }

    // 4. Find best peak AFTER minimum lag (avoid high-frequency noise)
    const minFreq = 60; // low guitar limit (E2 ~82Hz, allow slack)
    const maxFreq = 1000;

    const minLag = Math.floor(sampleRate / maxFreq);
    const maxLag = Math.floor(sampleRate / minFreq);

    let bestLag = -1;
    let bestVal = 0;

    for (let lag = minLag; lag < maxLag; lag++) {
      if (correlations[lag] > bestVal) {
        bestVal = correlations[lag];
        bestLag = lag;
      }
    }

    if (bestLag <= 0) return 0;

    // 5. Convert lag → frequency
    return sampleRate / bestLag;
  }
}
