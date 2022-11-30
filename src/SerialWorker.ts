import { Config, EqBand } from './Types';
import { Mapping } from './Mapping';
import { Equaliser } from './Equaliser';
import { SignalFactory } from './SignalFactory';
import { SerialRequest, SerialInitRequest, SerialJobRequest, SerialResponse, SerialJobResponse } from './SerialTypes';

const signal_periods = 6;
const skip_periods = 4;

class SerialWorker {

	private readonly sine: Float32Array;
	private readonly cosine: Float32Array;
	private readonly period: number;

	constructor(
		private readonly config: Config,
		private readonly freq: number
	) {
		const { rate } = config;
		const period = rate / freq;
		const size = period * signal_periods;
		this.sine = new SignalFactory({ size, rate }).generate_sine(freq);
		this.cosine = new SignalFactory({ size, rate }).generate_cosine(freq);
		this.period = period;
	}

	private normalised_inner_product(a: Float32Array, b: Float32Array): number {
		if (a.length < b.length) {
			throw new Error('Domain error');
		}
		let sum = 0;
		for (let i = 0, n = b.length; i < n; ++i) {
			sum += a[i] * b[i];
		}
		return sum * 2 / b.length;
	}

	private analyse_signal(b: Float32Array) {
		const sn = this.normalised_inner_product(this.sine, b);
		const cs = this.normalised_inner_product(this.cosine, b);
		return {
			magnitude: Math.hypot(cs, sn),
			// phase: Math.atan2(cs, sn),
		};
	}

	calculate(bands: ReadonlyArray<EqBand>): Record<'freq' | 'db', number> {
		const mapping = new Mapping(this.config);
		const signal = new Float32Array(this.sine);
		const eq = new Equaliser(this.config, bands);
		eq.apply(signal);
		const filtered = signal.subarray(this.period * skip_periods);
		const { magnitude /*, phase*/ } = this.analyse_signal(filtered);
		const freq = this.freq;
		const db = mapping.level_to_db(magnitude);
		return { freq, db };
	}

}

let worker: SerialWorker;

function send(message: SerialResponse) {
	self.postMessage(message);
}

function worker_oninit(data: SerialInitRequest) {
	const { config, freq } = data;
	worker = new SerialWorker(config, freq);
}

function worker_onjob(data: SerialJobRequest): SerialJobResponse {
	const { id, bands } = data;
	const { freq, db } = worker.calculate(bands);
	return { type: 'result', id, freq, db };
}

function worker_onmessage({ data }: MessageEvent<SerialRequest>) {
	if (data.type === 'init') {
		return worker_oninit(data);
	}
	if (data.type === 'job') {
		send(worker_onjob(data));
	}
}

self.onmessage = worker_onmessage;
