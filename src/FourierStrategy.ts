import { AnalysisStrategy, Config, Model, SignalType, EqBand, Signal } from './Types';
import { Mapping } from './Mapping';
import { SignalFactory } from './SignalFactory';
import { Equaliser } from './Equaliser';

import FFT from 'fft.js';

export class FourierStrategy implements AnalysisStrategy {

	private readonly fft: typeof FFT;
	private readonly signal: Signal;
	private readonly baseline: Readonly<Float32Array>;

	private get_spectrum(signal: Readonly<Float32Array>): Float32Array {
		const mapping = new Mapping(this.config);
		const { size } = this.config;
		const transform = new Float32Array(size * 2);
		(this.fft as any).realTransform(transform, [...signal]);
		const result = new Float32Array(size);
		for (let i = 0; i < size; i += 2) {
			const level = Math.hypot(transform[i], transform[i + 1]) / Math.sqrt(signal.length) / 128;
			result[i] = mapping.i_to_f(i / 2);
			result[i + 1] = level;
		}
		return result;
	}

	constructor(
		private readonly config: Config,
	) {
		this.fft = new (FFT as any)(config.size);
		this.signal = new SignalFactory(config).generate_noise();
		this.baseline = this.get_spectrum(this.signal);
	}

	async calculate(bands: ReadonlyArray<EqBand>): Promise<Float32Array> {
		const mapping = new Mapping(this.config);
		const { size } = this.config;
		const signal = new Float32Array(this.signal);
		const eq = new Equaliser(this.config, bands);
		eq.apply(signal);
		const spectrum = this.get_spectrum(signal);
		for (let i = 1; i < spectrum.length; i += 2) {
			spectrum[i] = mapping.level_to_db(spectrum[i] / this.baseline[i]);
		}
		return spectrum;
	}

}
