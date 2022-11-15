import { Config, SignalType, Signal, Signals } from './Types';

export class SignalFactory {

	constructor(private readonly config: Config) {
	}

	generate_all(): Signals {
		return {
			noise: this.generate_noise(),
			pure: this.generate_sine(this.config.rate / 4),
		}
	}

	generate_noise(): Signal {
		const { size } = this.config;
		const signal = new Float32Array(size);
		for (let i = 0; i < size; ++i) {
			signal[i] = (2 * Math.random() - 1) * Math.sqrt(size);
		}
		return signal;
	}

	generate_sine(f: number): Signal {
		const { size, rate } = this.config;
		const signal = new Float32Array(size);
		for (let i = 0; i < size; ++i) {
			signal[i] = Math.sin(2 * Math.PI * f * i / rate)
		}
		return signal;
	}

};
