import { AnalysisStrategy, Config, Model, Signals, EqBand } from './Types';
import { Mapping } from './Mapping';
import { Equaliser } from './Equaliser';
import { SignalFactory } from './SignalFactory';
import { SerialRequest, SerialInitRequest, SerialJobRequest, SerialResponse, SerialJobResponse } from './SerialTypes';

type JobSerial = number;

export class SerialStrategy implements AnalysisStrategy {

	private readonly workers: Array<Worker> = [];
	private job_serial: JobSerial = 0;
	private callbacks: Map<JobSerial, (result: SerialJobResponse) => void> = new Map();

	private submit_job(worker: Worker, bands: ReadonlyArray<EqBand>): Promise<SerialJobResponse> {
		const id = this.job_serial++;
		const result = new Promise<SerialJobResponse>((resolve, reject) => {
			this.callbacks.set(id, resolve);
			worker.postMessage(<SerialJobRequest> { type: 'job', id, bands });
		});
		return result;
	}

	constructor(
		private readonly config: Config,
	) {
		const { rate } = this.config;
		const mapping = new Mapping(this.config);
		const lmin = Math.log10(mapping.fmin);
		const lmax = Math.log10(mapping.fmax);
		const res = 18;
		const pts = res * (lmax - lmin);
		for (let i = 0; i <= pts; ++i) {
			const lm = i / res + lmin;
			const freq = Math.pow(10, lm);
			const worker = new Worker(new URL('./SerialWorker', import.meta.url));
			worker.onmessage = ({ data }: MessageEvent<SerialResponse>) => {
				const id = data.id;
				const callback = this.callbacks.get(id)!;
				this.callbacks.delete(id);
				callback(data);
			};
			worker.postMessage(<SerialInitRequest> { type: 'init', config, freq });
			this.workers.push(worker);
		}
	}

	async calculate(bands: ReadonlyArray<EqBand>): Promise<Float32Array> {
		const worker_results = await Promise.all(this.workers.map(worker => this.submit_job(worker, bands)));
		const mapping = new Mapping(this.config);
		const result = new Float32Array(worker_results.length * 2);
		let out_it = 0;
		for (const { freq, db } of worker_results) {
			result[out_it++] = freq;
			result[out_it++] = db;
		}
		return result;
	}

}
