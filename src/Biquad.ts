export default class Biquad {

	private xz1: number = 0;
	private xz2: number = 0;

	private yz1: number = 0;
	private yz2: number = 0;

	constructor (
		public readonly a1: number = 0,
		public readonly a2: number = 0,
		public readonly b0: number = 0,
		public readonly b1: number = 0,
		public readonly b2: number = 0
	) {
	}

	public static create_bandpass(freq: number, gain: number, q: number, rate: number): Biquad {
		const A = Math.pow(10, gain / 40);
		const w = 2 * Math.PI * freq / rate;
		const sn = Math.sin(w);
		const cs = Math.cos(w);
		const a = sn / (2 * q);
		const a0 = 1 + a / A;
		const a1 = -2 * cs;
		const a2 = 1 - a / A;
		const b0 = 1 + a * A;
		const b1 = -2 * cs;
		const b2 = 1 - a * A;
		return new Biquad(a1 / a0, a2 / a0, b0 / a0, b1 / a0, b2 / a0);
	}

	public reset() {
		this.xz1 = 0;
		this.xz2 = 0;
		this.yz1 = 0;
		this.yz2 = 0;
	}

	public apply(signal: Float32Array) {
		const a1 = this.a1;
		const a2 = this.a2;
		const b0 = this.b0;
		const b1 = this.b1;
		const b2 = this.b2;
		let xz1 = this.xz1;
		let xz2 = this.xz1;
		let yz1 = this.yz1;
		let yz2 = this.yz2;
		const N = signal.length;
		const ys = new Float32Array(N);
		for (let i = 0; i < N; ++i) {
			const x = signal[i];
			const y = x * b0 + xz1 * b1 + xz2 * b2 - yz1 * a1 - yz2 * a2
			signal[i] = y;
			xz2 = xz1;
			xz1 = x;
			yz2 = yz1;
			yz1 = y;
		}
		this.xz1 = xz1;
		this.xz2 = xz1;
		this.yz1 = yz1;
		this.yz2 = yz2;
	}

}
