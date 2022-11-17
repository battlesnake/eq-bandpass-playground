import { Model, Controller, View } from './Types';
import { eq_freq } from './frequencies';

const d3 = require('d3');

export class ControlsView implements View {

	init(controller: Controller) {
		const q = d3.select("aside")
			.selectAll("label.control.eq.q")
			.data([1])
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
			.on("input", (e) => controller.set_q(Math.pow(10, e.currentTarget.value / 10)));
			;
		q.append("span")
			.attr("class", "control-value")
			.text("")
			;
		const bars = d3.select("aside")
			.selectAll("label.control.eq.g")
			.data(eq_freq.map((x, i) => ({ x, i })))
			.enter()
				.append("label")
				.attr("class", "control eq g")
				;
		bars.append("span")
			.attr("class", "control-name")
			.text(({ x }) => x < 1000 ? `${x}` : `${x / 1000}k`)
			;
		bars.append("input")
			.attr("class", "slider")
			.attr("type", "range")
			.attr("min", "-32")
			.attr("max", "32")
			.attr("value", 0)
			.on("input", (e, { i }) => controller.set_g(i, e.currentTarget.value))
			;
		bars.append("span")
			.attr("class", "control-value")
			.text("")
			;
	}

	update(model: Model) {
		const q = d3.select("aside")
			.selectAll("label.control.eq.q")
			.data([model.q])
			;
		q.select(".slider")
			.attr("value", x => Math.round(Math.log10(model.q) * 10))
			;
		q.select(".control-value")
			.text(x => x.toFixed(1))
			;
		const controls = d3.select("aside")
			.selectAll("label.control.eq")
			.data(model.eq)
			;
		controls
			.select(".slider")
			.attr("value", x => x.g)
			;
		controls
			.select(".control-value")
			.text(x => `${x.g}dB`)
			;
	}

}
