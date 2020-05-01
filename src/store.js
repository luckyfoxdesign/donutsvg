import { writable } from "svelte/store"
import { computeChartArc } from "./core/core.js"

export const Radius = writable({ outer: 90, inner: 60, gap: 0 })
export const ChartItems = writable([{}])
export const FakeChartItems = writable([
	{
		id: 0,
		fill: "#cccccc",
		value: 34,
		start: 0,
		end: 359.99,
		d: computeChartArc(0, 359.99, 90, 60),
	},
])
