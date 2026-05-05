<script>
	import HelperText from "@smui/textfield/helper-text";
	import Textfield from "@smui/textfield";
	import { writeAnglesAndPathsFakearr } from "../../core/core.js";
	import { Radius, FakeChartItems } from "../../store.js";

	export let uid, fill;

	let invalid = false;
	let colorValue = fill;

	function updateItemColor(fill) {
		FakeChartItems.update((items) =>
			writeAnglesAndPathsFakearr(
				items.map((item) =>
					item.uid === uid ? { ...item, fill } : item,
				),
				$Radius,
			),
		);
	}

	function changeItemColor(e) {
		let validation = validateHEX(e.target.value);
		colorValue = validation.result;
		invalid = !validation.valid;

		if (!validation.valid) return;

		updateItemColor(validation.result);
	}

	function changePickerColor(e) {
		colorValue = e.target.value;
		invalid = false;
		updateItemColor(colorValue);
	}

	function validateHEX(value) {
		let regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		let result = typeof value === "string" ? value.trim() : "";

		return {
			valid: regex.test(result),
			result,
		};
	}

	function validateColorInput(e) {
		colorValue = e.target.value;
		invalid = !validateHEX(colorValue).valid;
	}

	function colorPickerValue(value) {
		let validation = validateHEX(value);
		if (!validation.valid) return "#000000";

		let hex = validation.result;
		if (hex.length === 4) {
			return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
		}

		return hex;
	}
</script>

<div class="settings-input settings-input--color">
	<div class="settings-input__color-row">
		<Textfield
			label="Color"
			invalid={invalid}
			value={colorValue}
			onchange={(e) => changeItemColor(e)}
			oninput={(e) => validateColorInput(e)}
			input$aria-controls="helper-text-color-hex"
			input$aria-describedby="helper-text-color-hex"
		/>
		<input
			class="settings-input__color-picker"
			type="color"
			aria-label="Choose color"
			value={colorPickerValue(colorValue)}
			oninput={(e) => changePickerColor(e)}
		/>
	</div>
	<HelperText id="helper-text-color-hex" validationMsg>Invalid HEX</HelperText
	>
</div>

<style>
	.settings-input--color {
		width: 100%;
	}

	.settings-input__color-row {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}

	.settings-input__color-row :global(.mdc-text-field) {
		min-width: 0;
	}

	.settings-input__color-picker {
		width: 48px;
		height: 56px;
		flex: 0 0 48px;
		padding: 4px;
		border: 1px solid rgba(0, 0, 0, 0.38);
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
	}
</style>
