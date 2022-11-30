import { Model, Controller, View } from './Types';
import { eq_freq } from './frequencies';

const _ = require('lodash');
const d3 = require('d3');

const max_updates_per_second = 20;

function debounce(fn) {
	return _.debounce(fn, 1000 / max_updates_per_second, { leading: false, trailing: true });
}

export class ControlsView implements View {

	constructor(
		private readonly model: Model
	) {
	}

	private set_q(controller: Controller, value: number) {
		controller.set_q(Math.pow(10, value / 10))
			.catch(console.error);
	}

	private set_gain(controller: Controller, index: number, value: number) {
		controller.set_gain(index, value)
			.catch(console.error);
	}

	private readonly debounced_set_q = debounce(this.set_q);
	private readonly debounced_set_gain = debounce(this.set_gain);

	bind(controller: Controller) {
		/* Bandwidth */
		const q = d3.select("aside")
			.selectAll("label.control.q")
			.data([1])
			.enter()
				.append("label")
				.attr("class", "control q")
				;
		q.append("span")
			.attr("class", "control-name q")
			.text("q")
			;
		q.append("input")
			.attr("class", "slider q")
			.attr("type", "range")
			.attr("min", "-10")
			.attr("max", "10")
			.attr("value", 0)
			.on("input", (e) => this.debounced_set_q(controller, e.currentTarget.value));
			;
		q.append("span")
			.attr("class", "control-value q")
			.text("")
			;
		/* Gain */
		const bars = d3.select("aside")
			.selectAll("label.control.eq.g")
			.data(eq_freq.map((x, i) => ({ x, i })))
			.enter()
				.append("label")
				.attr("class", "control eq g")
				;
		bars.append("span")
			.attr("class", "control-name eq")
			.text(({ x }) => x < 1000 ? `${x}` : `${x / 1000}k`)
			;
		bars.append("input")
			.attr("class", "slider eq")
			.attr("type", "range")
			.attr("min", "-32")
			.attr("max", "32")
			.attr("value", 0)
			.on("input", (e, { i }) => this.debounced_set_gain(controller, i, e.currentTarget.value))
			;
		bars.append("span")
			.attr("class", "control-value eq")
			.text("")
			;
	}

	async update() {
		const model = this.model;
		/* Bandwidth */
		const q = d3.select("aside")
			.selectAll("label.control.q")
			.data([model.q])
			;
		q.select(".slider.q")
			.attr("value", x => Math.round(Math.log10(model.q) * 10))
			;
		q.select(".control-value.q")
			.text(x => x.toFixed(1))
			;
		/* Gain */
		const controls = d3.select("aside")
			.selectAll("label.control.eq")
			.data(model.eq)
			;
		controls
			.select(".slider.eq")
			.attr("value", x => x.g)
			;
		controls
			.select(".control-value.eq")
			.text(x => `${x.g}dB`)
			;
	}

}
