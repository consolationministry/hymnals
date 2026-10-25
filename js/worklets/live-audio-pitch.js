class LiveAudioPitchProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.bufferSize = 8192;
    this.baseDelay = 3072;
    this.depth = 2048;
    this.buffers = [];
    this.writeIndex = 0;
    this.phase = 0;
    this.semitones = 0;
    this.port.onmessage = event => {
      if (event.data && Number.isFinite(Number(event.data.semitones))) {
        this.semitones = Math.max(-4, Math.min(4, Number(event.data.semitones)));
      }
    };
    const channels = options.processorOptions && options.processorOptions.numberOfChannels || 1;
    for (let channel = 0; channel < channels; channel += 1) this.buffers.push(new Float32Array(this.bufferSize));
  }

  read(channel, delay) {
    const buffer = this.buffers[channel] || this.buffers[0];
    const position = (this.writeIndex - delay + this.bufferSize) % this.bufferSize;
    const before = Math.floor(position);
    const after = (before + 1) % this.bufferSize;
    const amount = position - before;
    return buffer[before] * (1 - amount) + buffer[after] * amount;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input.length || !output || !output.length) return true;
    const ratio = Math.pow(2, this.semitones / 12);
    for (let index = 0; index < output[0].length; index += 1) {
      for (let channel = 0; channel < output.length; channel += 1) {
        const source = input[channel] || input[0];
        const value = source ? source[index] || 0 : 0;
        const ring = this.buffers[channel] || this.buffers[0];
        ring[this.writeIndex] = value;
        if (Math.abs(this.semitones) < 0.01) {
          output[channel][index] = value;
          continue;
        }
        const phaseA = (this.phase + 1) % 1;
        const phaseB = (phaseA + 0.5) % 1;
        const delayA = this.baseDelay + phaseA * this.depth;
        const delayB = this.baseDelay + phaseB * this.depth;
        const weightA = 0.5 - 0.5 * Math.cos(phaseA * Math.PI * 2);
        output[channel][index] = this.read(channel, delayA) * weightA +
          this.read(channel, delayB) * (1 - weightA);
      }
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      this.phase = (this.phase + (1 - ratio) / this.depth + 1) % 1;
    }
    return true;
  }
}

registerProcessor("live-audio-pitch", LiveAudioPitchProcessor);
