<script>
	import HelperText from "@smui/textfield/helper-text"
	import Textfield from "@smui/textfield"
	import { computeChartArc, formatToNumberType } from "../core/core.js"
	import { Radius, ChartItems, FakeChartItems } from "../store.js"

	function writeOuterRadius(e) {
		let value = parseInt(e.target.value)
		formatOuterRadius($Radius.inner, value).then((r) => {
			//console.log(r)
			$Radius.inner = r.ir
			$Radius.outer = r.or
			$FakeChartItems.map((e) => {
				e.d = computeChartArc(e.start, e.end, r.or, r.ir)
			})
			$ChartItems = $FakeChartItems
		})
	}

	function formatOuterRadius(innerRadiusValue, outerRadiusValue) {
		let or = outerRadiusValue
		let ir = innerRadiusValue
		return new Promise((res, rej) => {
			switch (true) {
				case isNaN(or):
					//console.log("or=")
					or = 1
					res({ or: or, ir: ir })
					break
				case or < ir:
					//console.log("or<ir")
					if (or < 1) or = 1
					ir = or - 1
					res({ or: or, ir: ir })
					break
				case or > 150:
					//console.log("or>150")
					or = 150
					res({ or: or, ir: ir })
					break
				case or <= 0:
					//console.log("or<=0")
					or = 1
					res({ or: or, ir: ir })
					break
				case or == ir:
					//console.log("or==ir")
					ir = ir - 1
					res({ or: or, ir: ir })
					break
				default:
					res({ or: or, ir: ir })
					break
			}
		})
	}
</script>

<div class="settings-input">
	<Textfield
		class="settings-input__outer-radius"
		label="Outer radius"
		on:change="{(e) => writeOuterRadius(e)}"
		on:input="{(e) => formatToNumberType(e)}"
		value="{$Radius.outer}"
		input$aria-controls="helper-text-outer-radius"
		input$aria-describedby="helper-text-outer-radius"
	>
	</Textfield>
	<HelperText id="helper-text-outer-radius" persistent>1-150</HelperText>
</div>
