import { derived, writable } from "svelte/store"
import { computeChartArc } from "./core/core.js"

let nextItemUid = 0

export function createItemUid() {
	nextItemUid += 1
	return `item-${nextItemUid}`
}

export function createChartItem(overrides = {}) {
	return {
		uid: createItemUid(),
		id: 0,
		fill: "#cccccc",
		value: 50,
		start: 0,
		end: 0,
		d: "",
		...overrides,
	}
}

export const Radius = writable({ outer: 90, inner: 60, gap: 0 })
export const FakeChartItems = writable([
	createChartItem({
		fill: "#cccccc",
		value: 50,
		start: 0,
		end: 359.99,
		d: computeChartArc(0, 359.99, 90, 60),
	}),
])
export const ChartItems = derived(FakeChartItems, ($FakeChartItems) => $FakeChartItems)
