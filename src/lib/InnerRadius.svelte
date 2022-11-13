<script>
	import HelperText from "@smui/textfield/helper-text"
	import Textfield from "@smui/textfield"
	import { computeChartArc, formatToNumberType } from "../core/core.js"
	import { Radius, ChartItems, FakeChartItems } from "../store.js"

	function writeInnerRadius(e) {
		let value = parseInt(e.target.value)
		formatInnerRadius(value, $Radius.outer).then((r) => {
			$Radius.inner = r.ir
			$Radius.outer = r.or
			$FakeChartItems.map((e) => {
				e.d = computeChartArc(e.start, e.end, r.or, r.ir)
			})
			$ChartItems = $FakeChartItems
		})
	}

	function formatInnerRadius(innerRadiusValue, outerRadiusValue) {
		let or = outerRadiusValue
		let ir = innerRadiusValue
		return new Promise((res, rej) => {
			switch (true) {
				case isNaN(ir):
					//console.log("ir=")
					ir = 0
					res({ or: or, ir: ir })
					break
				case ir > or:
					//console.log("ir>or or ir>149")
					if (ir > 149) {
						ir = 149
					}
					or = ir + 1
					res({ or: or, ir: ir })
					break
				case ir < 0:
					//console.log("ir < 0")
					ir = 0
					res({ or: or, ir: ir })
					break
				case ir == or:
					//console.log("ir==or")
					if (ir > 149) {
						ir = 149
					}
					or = ir + 1
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
	class="settings-input__inner-radius" 
	label="Inner radius" 
	on:change="{(e) => writeInnerRadius(e)}" 
	on:input="{(e) => formatToNumberType(e)}" 
	value="{$Radius.inner}" 
	input$aria-controls="helper-text-outer-radius" 
	input$aria-describedby="helper-text-outer-radius" 
	/>
	<HelperText id="helper-text-inner-radius" persistent>0-149</HelperText>
</div>