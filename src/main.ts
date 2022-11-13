const Biquad = require('./Biquad.ts').default;

const d3 = require('d3');
const FFT = require('fft.js');

const eq_freq = [
	25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200,
	250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000,
	2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
];

const eq_g = 0;

const eq_q = 1;

const state = {
	q: eq_q,
	eq: eq_freq.map((f, i) => ({
		i,
		f,
		g: eq_g,
	}))
};

const db_min = -60;
const db_max = +60;

class Main {

	private signal: Float32Array;
	private spectrum: Float32Array = new Float32Array(0);

	private fft: typeof FFT;

	private cursor_i: number = 0;
	private cursor_f: number = 0;
	private cursor_db: number = 0;

	constructor(
		public readonly rate: number,
		public readonly size: number
	) {
		this.fft = new FFT(size);
		this.signal = this.generate_noise();
		this.init();
		this.update();
	}

	init() {
		this.init_controls();
		this.init_cursor();
		this.init_viewer();
	}

	generate_noise() {
		const signal = new Float32Array(this.size);
		for (let i = 0; i < this.size; ++i) {
			signal[i] = (2 * Math.random() - 1) * Math.sqrt(this.size);
		}
		return signal;
	}

	generate_sine(f) {
		const signal = new Float32Array(this.size);
		for (let i = 0; i < this.size; ++i) {
			signal[i] = Math.sin(2 * Math.PI * f * i / this.rate)
		}
		return signal;
	}

	init_controls() {
		const q = d3.select("aside section.q")
			.selectAll("label.control.eq.q")
			.data([state.q])
			.enter()
				.append("label")
				.attr("class", "control eq q")
				;
		q.append("span")
			.attr("class", "control-name")
			.text("q")
			;
		q.append("input")
			.attr("class", "slider")
			.attr("class", "slider")
			.attr("type", "range")
			.attr("min", "-10")
			.attr("max", "10")
			.attr("value", 0)
			.on("input", (e) => this.set_q(Math.pow(10, e.currentTarget.value / 10)));
			;
		q.append("span")
			.attr("class", "control-value")
			.text("")
			;
		const bars = d3.select("aside section.eq")
			.selectAll("label.control.eq.g")
			.data(state.eq)
			.enter()
				.append("label")
				.attr("class", "control eq g")
				;
		bars.append("span")
			.attr("class", "control-name")
			.text(x => x.f < 1000 ? `${x.f} Hz` : `${x.f / 1000} kHz`)
			;
		bars.append("input")
			.attr("class", "slider")
			.attr("type", "range")
			.attr("min", "-32")
			.attr("max", "32")
			.attr("value", 0)
			.on("input", (e, d) => this.set_g(d.i, e.currentTarget.value))
			;
		bars.append("span")
			.attr("class", "control-value")
			.text("")
			;
	}

	update() {
		this.recalculate();
		this.update_controls();
		this.update_cursor();
		this.update_viewer();
	}

	update_controls() {
		const q = d3.select("aside section.q")
			.selectAll("label.control.eq.q")
			.data([state.q])
			;
		q.select(".slider")
			.attr("value", x => Math.round(Math.log10(state.q) * 10))
			;
		q.select(".control-value")
			.text(x => x.toFixed(1))
			;
		const controls = d3.select("aside section.eq")
			.selectAll("label.control.eq")
			.data(state.eq)
			;
		controls
			.select(".slider")
			.attr("value", x => x.g)
			;
		controls
			.select(".control-value")
			.text(x => `${x.g} dB`)
			;
	}

	init_viewer() {
		const viewer = d3.select(".viewer").node();
		const observer = new ResizeObserver(() => {
			viewer.width = Math.round(viewer.clientWidth * devicePixelRatio);
			viewer.height = Math.round(viewer.clientHeight * devicePixelRatio);
			this.update_viewer();
		});
		observer.observe(viewer);
		viewer.addEventListener('click', (e) => this.viewer_onclick(e));
	}

	update_viewer() {
		const viewer = d3.select(".viewer");
		const node = viewer.node();
		const ctx = node.getContext('2d');
		const width = node.width;
		const height = node.height;
		ctx.clearRect(0, 0, width, height);
		const project = (x, y) => [(0.1 + x) * width / 1.2, (0.1 + y) * height / 1.2];
		const level_to_db = (level) => Math.min(db_max, Math.max(db_min, 20 * Math.log10(level)));
		const i_to_f = (i) => i * this.rate / this.size;
		const proj_x = (x, xmax) => Math.log(x) / Math.log(xmax);
		const proj_f = (f) => proj_x(f, this.rate / 2);
		const proj_i = (i) => proj_f(i_to_f(i))
		const proj_db = db => (db_max - db) / (db_max - db_min);
		const proj_level = (level) => proj_db(level_to_db(level));
		ctx.globalCompositeOperation = "lighter";
		{
			/* Spectrum */
			ctx.lineWidth = 1;
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.moveTo(...project(proj_f(1), proj_db(0)));
			this.spectrum.forEach((d, i) => {
				if (i_to_f(i) < 1) {
					return;
				}
				ctx.lineTo(...project(proj_i(i), proj_level(d)));
			});
			ctx.stroke();
		}
		{
			/* Frequency gridlines */
			for (let f = 1; f < this.rate / 2; f *= 10) {
				for (let d = 1; d < 10 && f * d < this.rate / 2; d++) {
					ctx.lineWidth = d == 1 ? 4 : 2;
					ctx.strokeStyle = d == 1 ? "blue" : "green";
					ctx.beginPath();
					ctx.moveTo(...project(proj_f(f * d), 0));
					ctx.lineTo(...project(proj_f(f * d), 1));
					ctx.stroke();
				}
			}
		}
		{
			/* Level gridlines */
			for (let g = Math.ceil(db_min / 6) * 6; g <= db_max; g += 6) {
				ctx.lineWidth = g == 0 ? 4 : 2;
				ctx.strokeStyle = g == 0 ? "blue" : "green";
				ctx.beginPath();
				ctx.moveTo(...project(0, proj_db(g)));
				ctx.lineTo(...project(1, proj_db(g)));
				ctx.stroke();
			}
		}
		{
			/* Bounds */
			ctx.lineWidth = 4;
			ctx.strokeStyle = "silver";
			ctx.beginPath();
			ctx.moveTo(...project(0, 0));
			ctx.lineTo(...project(1, 0));
			ctx.lineTo(...project(1, 1));
			ctx.lineTo(...project(0, 1));
			ctx.lineTo(...project(0, 0));
			ctx.stroke();
		}
	}

	set_q(value: number) {
		state.q = value
		this.update();
	}

	set_g(index: number, value: number) {
		state.eq[index].g = value;
		this.update();
	}

	recalculate() {
		const signal = new Float32Array(this.signal);
		for (const eq of state.eq) {
			const filter = Biquad.create_bandpass(eq.f, eq.g, state.q, this.rate);
			filter.apply(signal);
		}
		const spectrum = new Float32Array(this.size * 2);
		this.fft.realTransform(spectrum, [...signal]);
		const decimation = 1;
		this.spectrum = new Float32Array(this.size / 2 / decimation);
		for (let i = 0; i < this.size / 2; i++) {
			const abs = Math.hypot(spectrum[i*2], spectrum[i*2 + 1]) / Math.sqrt(signal.length) / 128;
			const idx = Math.floor(i / decimation);
			this.spectrum[idx] = Math.max(this.spectrum[idx], abs);
		}
	}

	init_cursor() {
	}

	update_cursor() {
		const node = d3.select(".cursor");
		const value_db = 20 * Math.log10(this.spectrum[this.cursor_i]);
		node.text(`x: ${this.cursor_f.toFixed(0)} Hz\ny: ${this.cursor_db.toFixed(2)} dB\nvalue: ${value_db.toFixed(2)} dB`);
	}

	viewer_onclick(e: MouseEvent) {
		const viewer = d3.select(".viewer");
		const node = viewer.node();
		const width = node.width;
		const height = node.height;
		const px = 1.2 * e.offsetX / width - 0.1;
		const py = 1.2 * e.offsetY / height - 0.1;
		const pf = Math.exp(px * Math.log(this.rate / 2));
		const db = db_max - (py * (db_max - db_min));
		const i = Math.min(this.size / 2 - 1, Math.max(0, Math.round(pf * this.size / this.rate)));
		const f = i * this.rate / this.size;
		this.cursor_i = i;
		this.cursor_f = f;
		this.cursor_db = db;
		this.update_cursor();
	}

}

const main = new Main(65536, 65536);
