<script>
	import HelperText from "@smui/textfield/helper-text"
	import Textfield from "@smui/textfield"
	import { formatToNumberType, writeAnglesAndPathsFakearr } from "../core/core.js"
	import { Radius, FakeChartItems } from "../store.js"

	function writeOuterRadius(e) {
		let value = parseInt(e.target.value)
		let nextRadius

		Radius.update((radius) => {
			let r = formatOuterRadius(radius.inner, value)
			nextRadius = { ...radius, inner: r.ir, outer: r.or }
			return nextRadius
		})

		FakeChartItems.update((items) =>
			writeAnglesAndPathsFakearr(items, nextRadius),
		)
	}

	function formatOuterRadius(innerRadiusValue, outerRadiusValue) {
		let or = outerRadiusValue
		let ir = innerRadiusValue
		switch (true) {
			case isNaN(or):
				or = 1
				break
			case or < ir:
				if (or < 1) or = 1
				ir = or - 1
				break
			case or > 150:
				or = 150
				break
			case or <= 0:
				or = 1
				break
			case or == ir:
				ir = ir - 1
				break
			default:
				break
		}

		return { or: or, ir: ir }
	}
</script>

<div class="settings-input">
	<Textfield
		class="settings-input__outer-radius"
		label="Outer radius"
		onchange={(e) => writeOuterRadius(e)}
		oninput={(e) => formatToNumberType(e)}
		value={$Radius.outer}
		input$aria-controls="helper-text-outer-radius"
		input$aria-describedby="helper-text-outer-radius"
	>
	</Textfield>
	<HelperText id="helper-text-outer-radius" persistent>1-150</HelperText>
</div>
