<script>
	import HelperText from "@smui/textfield/helper-text/index"
	import Textfield, { Input, Textarea } from "@smui/textfield"
	import { writeAnglesAndPathsFakearr, formatToNumberType } from "../../core/core.js"
	import { Radius, ChartItems, FakeChartItems } from "../../store.js"

function writeNewValue(o) {
		let target = o.target
		let item = $FakeChartItems.find((e) => e.id == target.parentNode.parentNode.parentNode.id)
		formatValue(target.value).then((r) => {
			let intResult = parseInt(r)
			item.value = $FakeChartItems.length < 2 && intResult == 0 ? 1 : intResult
			writeAnglesAndPathsFakearr($FakeChartItems, $Radius)
			$ChartItems = $FakeChartItems
		})
	}

	function formatValue(value) {
		return new Promise((res, rej) => {
			switch (true) {
				case value < 0:
					console.log("value<=0")
					value = 1
					res(value)
					break
				case isNaN(value):
					console.log("value=")
					value = 1
					res(value)
					break
				case value == "":
					console.log("value=")
					value = 1
					res(value)
					break
				default:
					res(value)
					break
			}
		})
  }
  
  export let value, id
</script>

<div class="settings-input">
  <Textfield
    label="Arc {id} value"
    {value}
    on:change="{(e) => writeNewValue(e)}"
    on:input="{(e) => formatToNumberType(e)}"
    input$aria-controls="helper-text-value-numbers"
    input$aria-describedby="helper-text-value-numbers"
/>
<HelperText id="helper-text-value-numbers" validationMsg>Only number</HelperText>
</div>