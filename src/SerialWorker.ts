import { Config, EqBand } from './Types';
import { Mapping } from './Mapping';
import { Equaliser } from './Equaliser';
import { SignalFactory } from './SignalFactory';
import { SerialRequest, SerialInitRequest, SerialResponse, SerialJobResponse } from './SerialTypes';

class SerialWorker {

	private readonly sine: Float32Array;
	private readonly period: number;

	constructor(
		private readonly config: Config,
		private readonly freq: number
	) {
		const { rate } = config;
		const period = rate / freq;
		const size = period * 4;
		this.sine = new SignalFactory({ size, rate }).generate_sine(freq);
		this.period = period;
	}

	calculate(bands: ReadonlyArray<EqBand>): Record<'freq' | 'db', number> {
		const mapping = new Mapping(this.config);
		const signal = new Float32Array(this.sine);
		const eq = new Equaliser(this.config, bands);
		eq.apply(signal);
		const level = signal.subarray(this.period * 3).reduce((a, b) => Math.max(a, Math.abs(b)), 0);
		const freq = this.freq;
		const db = mapping.level_to_db(level);
		return { freq, db };
	}

}

let worker: SerialWorker;

function send(message: SerialResponse) {
	self.postMessage(message);
}

function worker_onmessage({ data }: MessageEvent<SerialRequest>) {
	if (data.type === 'init') {
		const { config, freq } = data;
		worker = new SerialWorker(config, freq);
	}
	if (!worker) {
		return;
	}
	if (data.type === 'job') {
		const { id, bands } = data;
		const { freq, db } = worker.calculate(bands);
		send({ type: 'result', id, freq, db });
	}
}

self.onmessage = worker_onmessage;
