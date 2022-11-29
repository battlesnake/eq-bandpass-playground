import { Config, EqBand } from './Types';

export interface SerialInitRequest {
	type: 'init';
	config: Config;
	freq: number;
}

export interface SerialJobRequest {
	type: 'job';
	id: number;
	bands: ReadonlyArray<EqBand>;
}

export interface SerialJobResponse {
	type: 'result';
	id: number;
	freq: number;
	db: number;
}

export type SerialRequest = SerialInitRequest | SerialJobRequest;
export type SerialResponse = SerialJobResponse;
