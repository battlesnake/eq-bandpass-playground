import { Model, Controller, View } from "./Types";

const d3 = require("d3");

export class CursorView implements View {

	private readonly node: d3.Selection<HTMLElement, {}, HTMLElement, any>;

	constructor(
		private readonly model: Model
	) {
		this.node = d3.select(".cursor");
	}

	bind(controller: Controller) {
		this.node
			.append("span")
			.attr("class", "cursor-x")
			;
		this.node
			.append("span")
			.attr("class", "cursor-y")
			;
		this.node
			.append("span")
			.attr("class", "cursor-v")
			;
	}

	async update() {
		const { cursor_f, cursor_db, value_db } = this.model.cursor;
		this.node.select(".cursor-x")
			.text(`x: ${cursor_f.toFixed(0)} Hz`)
			;
		this.node.select(".cursor-y")
			.text(`y: ${cursor_db.toFixed(2)} dB`)
			;
		this.node.select(".cursor-v")
			.text(`value: ${value_db?.toFixed(2) ?? "-"} dB`)
			;
	}

}
