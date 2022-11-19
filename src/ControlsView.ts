import { Model, Controller, View } from './Types';
import { eq_freq } from './frequencies';

const d3 = require('d3');

export class ControlsView implements View {

	constructor(
		private readonly model: Model
	) {
	}

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
			.on("input", (e) => controller.set_q(Math.pow(10, e.currentTarget.value / 10)));
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
			.on("input", (e, { i }) => controller.set_gain(i, e.currentTarget.value))
			;
		bars.append("span")
			.attr("class", "control-value eq")
			.text("")
			;
	}

	update() {
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
