<script>
	import HelperText from "@smui/textfield/helper-text/index"
	import Textfield, { Input, Textarea } from "@smui/textfield"
	import Icon from "@smui/textfield/icon/index"
	import { writeAnglesAndPathsFakearr } from "../../core/core.js"
	import { Radius, ChartItems, FakeChartItems } from "../../store.js"

	function changeItemColor(e) {
		validateHEX(e).then((r) => {
			if (r.bool) {
				$FakeChartItems.find((el) => el.id == e.target.parentNode.parentNode.parentNode.id).fill = r.result
				writeAnglesAndPathsFakearr($FakeChartItems, $Radius)
				$ChartItems = $FakeChartItems
			}
		})
	}

	function validateHEX(e) {
		let regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
		let value = e.target.value.trim()
		return new Promise((res, rej) => {
			if (regex.test(value)) res({ bool: true, result: value })
		})
	}

	export let fill
</script>

<div class="settings-input">
	<Textfield
		withLeadingIcon
		label="Color"
		value="{fill}"
		on:change="{(e) => changeItemColor(e)}"
		input$aria-controls="helper-text-color-hex"
		input$aria-describedby="helper-text-color-hex"
	>
		<Icon class="material-icons">color_lens</Icon>
	</Textfield>
	<HelperText id="helper-text-color-hex" validationMsg>Invalid HEX</HelperText>
</div>
