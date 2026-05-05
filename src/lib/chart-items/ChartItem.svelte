<script>
	import ColorInput from "./ColorInput.svelte";
	import ValueInput from "./ValueInput.svelte";
	import IconButton from "@smui/icon-button";
	import IconGlyph from "../IconGlyph.svelte";
	import { Radius, ChartItems, FakeChartItems } from "../../store.js";
	import { writeAnglesAndPathsFakearr } from "../../core/core.js";

	function removeChartItem() {
		if ($ChartItems.length > 1) {
			FakeChartItems.update((items) =>
				writeAnglesAndPathsFakearr(
					items.filter((item) => item.uid !== uid),
					$Radius,
				),
			);
		}
	}

	export let uid, id, value, fill;
</script>

<div {id} data-uid={uid} class="app__data-item app__data-item--{id}">
	<ValueInput {uid} {id} {value} />
	<ColorInput {uid} {fill} />
	{#if $ChartItems.length > 1}
		<IconButton onclick={removeChartItem} aria-label="Delete item">
			<IconGlyph name="delete" />
		</IconButton>
	{/if}
</div>
