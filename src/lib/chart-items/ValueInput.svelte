<script>
	import HelperText from "@smui/textfield/helper-text";
	import Textfield from "@smui/textfield";
	import {
		writeAnglesAndPathsFakearr,
		formatToNumberType,
	} from "../../core/core.js";
	import { Radius, FakeChartItems } from "../../store.js";

	function writeNewValue(o) {
		let intResult = formatValue(o.target.value);

		FakeChartItems.update((items) => {
			let nextItems = items.map((item) =>
				item.uid === uid
					? {
							...item,
							value: items.length < 2 && intResult == 0 ? 1 : intResult,
						}
					: item,
			);

			return writeAnglesAndPathsFakearr(nextItems, $Radius);
		});
	}

	function formatValue(value) {
		let numberValue = parseInt(value);

		switch (true) {
			case numberValue < 0:
				return 1;
			case isNaN(numberValue):
				return 1;
			case value == "":
				return 1;
			default:
				return numberValue;
		}
	}

	export let uid, value, id;
</script>

<div class="settings-input">
	<Textfield
		label="Arc {id} value"
		{value}
		onchange={(e) => writeNewValue(e)}
		oninput={(e) => formatToNumberType(e)}
		input$aria-controls="helper-text-value-numbers"
		input$aria-describedby="helper-text-value-numbers"
	/>
	<HelperText id="helper-text-value-numbers" validationMsg
		>Only number</HelperText
	>
</div>
