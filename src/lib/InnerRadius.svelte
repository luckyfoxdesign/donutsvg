<script>
	import HelperText from "@smui/textfield/helper-text"
	import Textfield from "@smui/textfield"
	import { formatToNumberType, writeAnglesAndPathsFakearr } from "../core/core.js"
	import { Radius, FakeChartItems } from "../store.js"

	function writeInnerRadius(e) {
		let value = parseInt(e.target.value)
		let nextRadius

		Radius.update((radius) => {
			let r = formatInnerRadius(value, radius.outer)
			nextRadius = { ...radius, inner: r.ir, outer: r.or }
			return nextRadius
		})

		FakeChartItems.update((items) =>
			writeAnglesAndPathsFakearr(items, nextRadius),
		)
	}

	function formatInnerRadius(innerRadiusValue, outerRadiusValue) {
		let or = outerRadiusValue
		let ir = innerRadiusValue
		switch (true) {
			case isNaN(ir):
				ir = 0
				break
			case ir > or:
				if (ir > 149) {
					ir = 149
				}
				or = ir + 1
				break
			case ir < 0:
				ir = 0
				break
			case ir == or:
				if (ir > 149) {
					ir = 149
				}
				or = ir + 1
				break
			default:
				break
		}

		return { or: or, ir: ir }
	}
</script>

<div class="settings-input">
	<Textfield 
	class="settings-input__inner-radius" 
	label="Inner radius" 
	onchange={(e) => writeInnerRadius(e)} 
	oninput={(e) => formatToNumberType(e)} 
	value={$Radius.inner} 
	input$aria-controls="helper-text-inner-radius" 
	input$aria-describedby="helper-text-inner-radius" 
	/>
	<HelperText id="helper-text-inner-radius" persistent>0-149</HelperText>
</div>
