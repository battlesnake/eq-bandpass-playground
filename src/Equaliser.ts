import { Config, EqBand } from './Types';
import { Biquad } from './Biquad';

export class Equaliser {

	private readonly filters: Array<Biquad>;

	constructor(config: Pick<Config, "rate">, bands: Array<EqBand>) {
		const { rate } = config;
		this.filters = bands.map(({ f, g, q }) => Biquad.create_bandpass(f, g, q, rate));
	}

	apply(signal: Float32Array) {
		for (const filter of this.filters) {
			filter.apply(signal);
		}
	}

}
