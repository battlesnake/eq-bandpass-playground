import { SpectrumStrategy, Config, Model, Signals } from './Types';
import { Mapping } from './Mapping';
import { SignalFactory } from './SignalFactory';
import { Equaliser } from './Equaliser';

import FFT from 'fft.js';

export class FourierStrategy implements SpectrumStrategy {

	private readonly fft: typeof FFT;
	private readonly signals: Signals;

	constructor(
		private readonly config: Config,
		private readonly model: Model,
	) {
		this.fft = new (FFT as any)(config.size);
		this.signals = new SignalFactory(config).generate_all();
	}

	calculate(): Float32Array {
		const { size, rate } = this.config;
		const signal = new Float32Array(this.signals[this.model.signal]);
		const eq = new Equaliser(this.config, this.model.eq);
		eq.apply(signal);
		const transform = new Float32Array(size * 2);
		(this.fft as any).realTransform(transform, [...signal]);
		const mapping = new Mapping(this.config, 0, 0);
		const result = new Float32Array(size);
		for (let i = 0; i < size; i += 2) {
			const level = Math.hypot(transform[i], transform[i + 1]) / Math.sqrt(signal.length) / 128;
			result[i] = mapping.i_to_f(i / 2);
			result[i + 1] = mapping.level_to_db(level);
		}
		return result;
	}

}
