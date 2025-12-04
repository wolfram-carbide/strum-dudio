export type DrumKit = '808' | 'rock' | 'jazz' | 'trap' | 'lofi' | 'electro' | 'vintage' | 'house' | 'dnb' | 'techno';
export type DrumType = 'kick' | 'snare' | 'hihat' | 'openhat' | 'clap' | 'tom' | 'rim' | 'cowbell';

export class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private distortionNodes: Map<DrumType, WaveShaperNode>;
  private distortionEnabled: Map<DrumType, boolean>;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.context.destination);
    this.distortionNodes = new Map();
    this.distortionEnabled = new Map();
    this.initializeDistortion();
  }

  private initializeDistortion() {
    const distortableDrums: DrumType[] = ['kick', 'snare', 'clap'];
    distortableDrums.forEach(drum => {
      const distortion = this.context.createWaveShaper();
      distortion.curve = this.makeDistortionCurve(400);
      distortion.oversample = '4x';
      this.distortionNodes.set(drum, distortion);
      this.distortionEnabled.set(drum, false);
    });
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  setDistortion(drum: DrumType, enabled: boolean) {
    if (this.distortionEnabled.has(drum)) {
      this.distortionEnabled.set(drum, enabled);
    }
  }

  resume() {
    return this.context.resume();
  }

  getCurrentTime() {
    return this.context.currentTime;
  }

  playDrum(drum: DrumType, kit: DrumKit, time?: number, velocity: number = 1.0) {
    const startTime = time ?? this.context.currentTime;

    switch (kit) {
      case '808':
        this.play808(drum, startTime, velocity);
        break;
      case 'electro':
        this.playElectro(drum, startTime, velocity);
        break;
      case 'vintage':
        this.playVintage(drum, startTime, velocity);
        break;
      case 'house':
        this.playHouse(drum, startTime, velocity);
        break;
      case 'dnb':
        this.playDnB(drum, startTime, velocity);
        break;
      case 'techno':
        this.playTechno(drum, startTime, velocity);
        break;
      case 'rock':
        this.playRock(drum, startTime, velocity);
        break;
      case 'jazz':
        this.playJazz(drum, startTime, velocity);
        break;
      case 'trap':
        this.playTrap(drum, startTime, velocity);
        break;
      case 'lofi':
        this.playLofi(drum, startTime, velocity);
        break;
    }
  }

  private connectWithDistortion(gain: GainNode, drum: DrumType) {
    if (this.distortionEnabled.get(drum) && this.distortionNodes.has(drum)) {
      const distortion = this.distortionNodes.get(drum)!;
      gain.connect(distortion);
      distortion.connect(this.masterGain);
    } else {
      gain.connect(this.masterGain);
    }
  }

  private createNoiseBuffer(): AudioBuffer {
    const bufferSize = this.context.sampleRate * 0.5;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  private play808(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);
        gain.gain.setValueAtTime(1 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc.start(time);
        osc.stop(time + 0.5);
        break;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.7 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noiseSource.start(time);
        noiseSource.stop(time + 0.2);
        osc.disconnect();
        this.connectWithDistortion(gain, drum);
        return;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 7000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        hihatSource.start(time);
        hihatSource.stop(time + 0.05);
        this.connectWithDistortion(gain, drum);
        return;
      case 'openhat':
        const openNoise = this.createNoiseBuffer();
        const openSource = this.context.createBufferSource();
        openSource.buffer = openNoise;
        const openFilter = this.context.createBiquadFilter();
        openFilter.type = 'highpass';
        openFilter.frequency.value = 7000;
        openSource.connect(openFilter);
        openFilter.connect(gain);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        openSource.start(time);
        openSource.stop(time + 0.3);
        this.connectWithDistortion(gain, drum);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        clapSource.start(time);
        clapSource.stop(time + 0.1);
        this.connectWithDistortion(gain, drum);
        return;
      case 'tom':
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.3);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
        break;
      case 'rim':
        osc.type = 'square';
        osc.frequency.value = 400;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
        osc.start(time);
        osc.stop(time + 0.03);
        break;
      case 'cowbell':
        osc.frequency.value = 540;
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.start(time);
        osc.stop(time + 0.2);
        break;
    }

    osc.connect(gain);
    this.connectWithDistortion(gain, drum);
  }

  private playRock(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.type = 'triangle';
        osc2.type = 'sine';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc2.frequency.value = 80;
        gain.gain.setValueAtTime(1 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc.connect(gain);
        osc2.connect(gain);
        osc.start(time);
        osc.stop(time + 0.5);
        osc2.start(time);
        osc2.stop(time + 0.5);
        this.connectWithDistortion(gain, drum);
        return;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(100, time);
        filter.frequency.linearRampToValueAtTime(1000, time + 0.2);
        noiseSource.connect(filter);
        filter.connect(gain);
        osc.type = 'triangle';
        osc.frequency.value = 100;
        osc.connect(gain);
        gain.gain.setValueAtTime(0.7 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        noiseSource.start(time);
        noiseSource.stop(time + 0.2);
        osc.start(time);
        osc.stop(time + 0.1);
        this.connectWithDistortion(gain, drum);
        return;
      case 'hihat':
        const fundamental = 40;
        const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
        ratios.forEach((ratio) => {
          const oscHat = this.context.createOscillator();
          oscHat.type = 'square';
          oscHat.frequency.value = fundamental * ratio;
          oscHat.connect(gain);
          oscHat.start(time);
          oscHat.stop(time + 0.05);
        });
        const bandpass = this.context.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 10000;
        gain.connect(bandpass);
        bandpass.connect(this.masterGain);
        gain.gain.setValueAtTime(0.00001, time);
        gain.gain.exponentialRampToValueAtTime(1, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        return;
      case 'openhat':
        const fundamental2 = 40;
        const ratios2 = [2, 3, 4.16, 5.43, 6.79, 8.21];
        ratios2.forEach((ratio) => {
          const oscOpen = this.context.createOscillator();
          oscOpen.type = 'square';
          oscOpen.frequency.value = fundamental2 * ratio;
          oscOpen.connect(gain);
          oscOpen.start(time);
          oscOpen.stop(time + 0.3);
        });
        const bandpass2 = this.context.createBiquadFilter();
        bandpass2.type = 'bandpass';
        bandpass2.frequency.value = 10000;
        gain.connect(bandpass2);
        bandpass2.connect(this.masterGain);
        gain.gain.setValueAtTime(0.00001, time);
        gain.gain.exponentialRampToValueAtTime(1, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.3, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        clapSource.start(time);
        clapSource.stop(time + 0.1);
        this.connectWithDistortion(gain, drum);
        return;
      case 'tom':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.4);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        osc.connect(gain);
        osc.start(time);
        osc.stop(time + 0.4);
        this.connectWithDistortion(gain, drum);
        return;
      case 'rim':
        osc.type = 'square';
        osc.frequency.value = 400;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
        osc.connect(gain);
        osc.start(time);
        osc.stop(time + 0.03);
        this.connectWithDistortion(gain, drum);
        return;
      case 'cowbell':
        osc.frequency.value = 540;
        osc2.frequency.value = 800;
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.connect(gain);
        osc2.connect(gain);
        osc.start(time);
        osc.stop(time + 0.2);
        osc2.start(time);
        osc2.stop(time + 0.2);
        this.connectWithDistortion(gain, drum);
        return;
    }
  }

  private playJazz(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.frequency.setValueAtTime(100, time);
        osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.3);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
        break;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.5 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        noiseSource.start(time);
        noiseSource.stop(time + 0.15);
        osc.disconnect();
        this.connectWithDistortion(gain, drum);
        return;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 9000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        hihatSource.start(time);
        hihatSource.stop(time + 0.08);
        this.connectWithDistortion(gain, drum);
        return;
      case 'openhat':
        const openNoise = this.createNoiseBuffer();
        const openSource = this.context.createBufferSource();
        openSource.buffer = openNoise;
        const openFilter = this.context.createBiquadFilter();
        openFilter.type = 'highpass';
        openFilter.frequency.value = 9000;
        openSource.connect(openFilter);
        openFilter.connect(gain);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        openSource.start(time);
        openSource.stop(time + 0.4);
        this.connectWithDistortion(gain, drum);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        clapSource.start(time);
        clapSource.stop(time + 0.1);
        this.connectWithDistortion(gain, drum);
        return;
      case 'tom':
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.35);
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
        osc.start(time);
        osc.stop(time + 0.35);
        break;
      case 'rim':
        osc.type = 'square';
        osc.frequency.value = 320;
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
        osc.start(time);
        osc.stop(time + 0.04);
        break;
      case 'cowbell':
        osc.frequency.value = 480;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        osc.start(time);
        osc.stop(time + 0.25);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  private playTrap(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.frequency.setValueAtTime(160, time);
        osc.frequency.exponentialRampToValueAtTime(20, time + 0.6);
        gain.gain.setValueAtTime(1.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc.start(time);
        osc.stop(time + 0.6);
        break;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.8 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        noiseSource.start(time);
        noiseSource.stop(time + 0.15);
        osc.disconnect();
        this.connectWithDistortion(gain, drum);
        return;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 10000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
        hihatSource.start(time);
        hihatSource.stop(time + 0.04);
        this.connectWithDistortion(gain, drum);
        return;
      case 'openhat':
        const openNoise = this.createNoiseBuffer();
        const openSource = this.context.createBufferSource();
        openSource.buffer = openNoise;
        const openFilter = this.context.createBiquadFilter();
        openFilter.type = 'highpass';
        openFilter.frequency.value = 10000;
        openSource.connect(openFilter);
        openFilter.connect(gain);
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
        openSource.start(time);
        openSource.stop(time + 0.35);
        this.connectWithDistortion(gain, drum);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        clapSource.start(time);
        clapSource.stop(time + 0.08);
        this.connectWithDistortion(gain, drum);
        return;
      case 'tom':
        osc.frequency.setValueAtTime(240, time);
        osc.frequency.exponentialRampToValueAtTime(70, time + 0.25);
        gain.gain.setValueAtTime(0.9, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        osc.start(time);
        osc.stop(time + 0.25);
        break;
      case 'rim':
        osc.type = 'square';
        osc.frequency.value = 450;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);
        osc.start(time);
        osc.stop(time + 0.02);
        break;
      case 'cowbell':
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
        osc.start(time);
        osc.stop(time + 0.18);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  private playLofi(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.frequency.setValueAtTime(110, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.45);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
        osc.start(time);
        osc.stop(time + 0.45);
        break;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.5 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noiseSource.start(time);
        noiseSource.stop(time + 0.2);
        osc.disconnect();
        this.connectWithDistortion(gain, drum);
        return;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 6000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
        hihatSource.start(time);
        hihatSource.stop(time + 0.06);
        this.connectWithDistortion(gain, drum);
        return;
      case 'openhat':
        const openNoise = this.createNoiseBuffer();
        const openSource = this.context.createBufferSource();
        openSource.buffer = openNoise;
        const openFilter = this.context.createBiquadFilter();
        openFilter.type = 'highpass';
        openFilter.frequency.value = 6000;
        openSource.connect(openFilter);
        openFilter.connect(gain);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
        openSource.start(time);
        openSource.stop(time + 0.35);
        this.connectWithDistortion(gain, drum);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        clapSource.start(time);
        clapSource.stop(time + 0.12);
        this.connectWithDistortion(gain, drum);
        return;
      case 'tom':
        osc.frequency.setValueAtTime(190, time);
        osc.frequency.exponentialRampToValueAtTime(65, time + 0.35);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
        osc.start(time);
        osc.stop(time + 0.35);
        break;
      case 'rim':
        osc.type = 'square';
        osc.frequency.value = 350;
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
        osc.start(time);
        osc.stop(time + 0.04);
        break;
      case 'cowbell':
        osc.frequency.value = 500;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.start(time);
        osc.stop(time + 0.2);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  private playElectro(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.4);
        gain.gain.setValueAtTime(1.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        osc.start(time);
        osc.stop(time + 0.4);
        break;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.8 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        noiseSource.start(time);
        noiseSource.stop(time + 0.15);
        osc.disconnect();
        this.connectWithDistortion(gain, drum);
        return;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 11000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
        hihatSource.start(time);
        hihatSource.stop(time + 0.04);
        this.connectWithDistortion(gain, drum);
        return;
      case 'openhat':
        const openNoise = this.createNoiseBuffer();
        const openSource = this.context.createBufferSource();
        openSource.buffer = openNoise;
        const openFilter = this.context.createBiquadFilter();
        openFilter.type = 'highpass';
        openFilter.frequency.value = 11000;
        openSource.connect(openFilter);
        openFilter.connect(gain);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        openSource.start(time);
        openSource.stop(time + 0.25);
        this.connectWithDistortion(gain, drum);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(1.0, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        clapSource.start(time);
        clapSource.stop(time + 0.12);
        this.connectWithDistortion(gain, drum);
        return;
      default:
        osc.type = 'square';
        osc.frequency.value = 300;
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  private playVintage(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.5);
        gain.gain.setValueAtTime(1.0, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc.start(time);
        osc.stop(time + 0.5);
        break;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1500;
        noiseSource.connect(filter);
        filter.connect(gain);
        osc.type = 'triangle';
        osc.frequency.value = 180;
        osc.connect(gain);
        gain.gain.setValueAtTime(0.7 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
        noiseSource.start(time);
        noiseSource.stop(time + 0.18);
        osc.start(time);
        osc.stop(time + 0.18);
        this.connectWithDistortion(gain, drum);
        return;
      default:
        osc.type = 'sine';
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  private playHouse(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.35);
        gain.gain.setValueAtTime(1.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.start(time);
        osc.stop(time + 0.35);
        break;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 12000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
        hihatSource.start(time);
        hihatSource.stop(time + 0.03);
        this.connectWithDistortion(gain, drum);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(0.9, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        clapSource.start(time);
        clapSource.stop(time + 0.1);
        this.connectWithDistortion(gain, drum);
        return;
      default:
        osc.type = 'sine';
        osc.frequency.value = 250;
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  private playDnB(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.25);
        gain.gain.setValueAtTime(1.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        osc.start(time);
        osc.stop(time + 0.25);
        break;
      case 'snare':
        const noise = this.createNoiseBuffer();
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = noise;
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2500;
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(1.0 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        noiseSource.start(time);
        noiseSource.stop(time + 0.12);
        osc.disconnect();
        this.connectWithDistortion(gain, drum);
        return;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 13000;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.45, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);
        hihatSource.start(time);
        hihatSource.stop(time + 0.02);
        this.connectWithDistortion(gain, drum);
        return;
      default:
        osc.type = 'triangle';
        osc.frequency.value = 280;
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        osc.start(time);
        osc.stop(time + 0.08);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }

  private playTechno(drum: DrumType, startTime: number, velocity: number = 1.0) {
    const time = startTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    switch (drum) {
      case 'kick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(170, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.3);
        gain.gain.setValueAtTime(1.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
        break;
      case 'hihat':
        const hihatNoise = this.createNoiseBuffer();
        const hihatSource = this.context.createBufferSource();
        hihatSource.buffer = hihatNoise;
        const hihatFilter = this.context.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 12500;
        hihatSource.connect(hihatFilter);
        hihatFilter.connect(gain);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.025);
        hihatSource.start(time);
        hihatSource.stop(time + 0.025);
        this.connectWithDistortion(gain, drum);
        return;
      case 'clap':
        const clapNoise = this.createNoiseBuffer();
        const clapSource = this.context.createBufferSource();
        clapSource.buffer = clapNoise;
        clapSource.connect(gain);
        gain.gain.setValueAtTime(0.95, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.11);
        clapSource.start(time);
        clapSource.stop(time + 0.11);
        this.connectWithDistortion(gain, drum);
        return;
      default:
        osc.type = 'square';
        osc.frequency.value = 320;
        gain.gain.setValueAtTime(0.65, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.09);
        osc.start(time);
        osc.stop(time + 0.09);
        break;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }
}
