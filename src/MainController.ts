import { Signals, Cursor, Config, Model, Controller, View } from './Types';
import { Biquad } from './Biquad';
import { SignalFactory } from './SignalFactory';

import FFT from 'fft.js';

export class MainController implements Controller {

	private readonly fft: typeof FFT;
	private readonly signals: Signals;

	constructor(
		private readonly config: Readonly<Config>,
		private readonly model: Model,
		private readonly views: ReadonlyArray<View>
	) {
		this.fft = new (FFT as any)(config.size);
		this.signals = new SignalFactory(config).generate_all();
		for (const view of this.views) {
			view.init(this);
		}
		this.recalculate();
		this.update();
	}

	update() {
		for (const view of this.views) {
			view.update(this.model);
		}
	}

	set_q(value: number) {
		this.model.q = value
		this.recalculate();
		this.update();
	}

	set_g(index: number, value: number) {
		this.model.eq[index].g = value;
		this.recalculate();
		this.update();
	}

	set_cursor(cursor: Cursor) {
		this.model.cursor = cursor;
		this.update();
	}

	recalculate() {
		const { size, rate } = this.config;
		const model = this.model;
		const signal = new Float32Array(this.signals[this.model.signal]);
		for (const eq of model.eq) {
			const filter = Biquad.create_bandpass(eq.f, eq.g, model.q, rate);
			filter.apply(signal);
		}
		const spectrum = new Float32Array(size * 2);
		(this.fft as any).realTransform(spectrum, [...signal]);
		const reduced_spectrum = new Float32Array(size / 2);
		for (let i = 0; i < size / 2; i++) {
			const abs = Math.hypot(spectrum[i*2], spectrum[i*2 + 1]) / Math.sqrt(signal.length) / 128;
			reduced_spectrum[i] = Math.max(reduced_spectrum[i], abs);
		}
		this.model.spectrum = reduced_spectrum;
	}

}
