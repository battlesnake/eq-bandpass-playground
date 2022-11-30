import { AnalysisStrategy, Config, Model, Signals, EqBand } from './Types';
import { Mapping } from './Mapping';
import { Equaliser } from './Equaliser';
import { SignalFactory } from './SignalFactory';
import { SerialRequest, SerialInitRequest, SerialJobRequest, SerialResponse, SerialJobResponse } from './SerialTypes';

type JobSerial = number;

const worker_request_timeout_ms = 10000;

const points_per_decade = 20;

export class SerialStrategy implements AnalysisStrategy {

	private readonly workers: ReadonlyArray<Worker>;
	private job_serial: JobSerial = 1;
	private callbacks: Map<JobSerial, (result: SerialJobResponse) => void> = new Map();

	constructor(
		private readonly config: Config,
	) {
		const { rate } = this.config;
		const mapping = new Mapping(this.config);
		const lmin = Math.log10(mapping.fmin);
		const lmax = Math.log10(mapping.fmax);
		const pts = points_per_decade * (lmax - lmin);
		this.workers = new Array(Math.ceil(pts) + 1).fill(0).map((_, i) => {
			const lm = i / points_per_decade + lmin;
			const freq = Math.pow(10, lm);
			const worker = new Worker(new URL('./SerialWorker', import.meta.url));
			worker.onmessage = ({ data }: MessageEvent<SerialResponse>) => {
				const id = data.id;
				this.callbacks.get(id)?.(data);
			};
			worker.postMessage(<SerialInitRequest> { type: 'init', config, freq });
			return worker;
		});
	}

	private submit_job(worker: Worker, bands: ReadonlyArray<EqBand>): Promise<SerialJobResponse> {
		return new Promise<SerialJobResponse>((resolve, reject) => {
			const id = this.job_serial++;
			const timeout = setTimeout(() => {
				this.callbacks.delete(id);
				reject(new Error('Worker timed out'));
			}, worker_request_timeout_ms);
			this.callbacks.set(id, (value) => {
				this.callbacks.delete(id);
				clearTimeout(timeout);
				resolve(value);
			});
			worker.postMessage(<SerialJobRequest> { type: 'job', id, bands });
		});
	}

	async calculate(bands: ReadonlyArray<EqBand>): Promise<Float32Array> {
		const worker_results = await Promise.all(
			this.workers.map(
				worker => this.submit_job(worker, bands)
			)
		);
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
