<script>
	import HelperText from "@smui/textfield/helper-text";
	import Textfield from "@smui/textfield";
	//import Icon from "@smui/textfield/icon/index";
	import Icon from "@smui/textfield/icon";
	import { writeAnglesAndPathsFakearr } from "../../core/core.js";
	import { Radius, FakeChartItems } from "../../store.js";

	export let uid, fill;

	let invalid = false;
	let colorValue = fill;

	function changeItemColor(e) {
		let validation = validateHEX(e.target.value);
		colorValue = validation.result;
		invalid = !validation.valid;

		if (!validation.valid) return;

		FakeChartItems.update((items) =>
			writeAnglesAndPathsFakearr(
				items.map((item) =>
					item.uid === uid ? { ...item, fill: validation.result } : item,
				),
				$Radius,
			),
		);
	}

	function validateHEX(value) {
		let regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		let result = value.trim();

		return {
			valid: regex.test(result),
			result,
		};
	}

	function validateColorInput(e) {
		colorValue = e.target.value;
		invalid = !validateHEX(colorValue).valid;
	}
</script>

<div class="settings-input">
	<Textfield
		withLeadingIcon
		label="Color"
		invalid={invalid}
		value={colorValue}
		onchange={(e) => changeItemColor(e)}
		oninput={(e) => validateColorInput(e)}
		input$aria-controls="helper-text-color-hex"
		input$aria-describedby="helper-text-color-hex"
	>
		<Icon class="material-icons">color_lens</Icon>
	</Textfield>
	<HelperText id="helper-text-color-hex" validationMsg>Invalid HEX</HelperText
	>
</div>
