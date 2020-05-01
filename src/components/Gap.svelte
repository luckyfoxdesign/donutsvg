<script>
  import HelperText from "@smui/textfield/helper-text/index"
  import Textfield, { Input, Textarea } from "@smui/textfield"
  import { computeChartArc, formatToNumberType, writeAnglesAndPathsFakearr } from "../core/core.js"
  import { Radius, ChartItems, FakeChartItems } from "../store.js"

  function changeItemsGap(e) {
    if ($ChartItems.length > 1) {
      let gap = parseInt(e.target.value)
      formatGap(gap).then((r) => {
        $Radius.gap = r
        writeAnglesAndPathsFakearr($FakeChartItems, $Radius)
        $ChartItems = $FakeChartItems
      })
    } else e.target.value = 0
  }

  function formatGap(value) {
    let gap = value
    return new Promise((res, rej) => {
      switch (true) {
        case gap < 0:
          console.log("gap<0")
          gap = 0
          res(gap)
          break
        case gap > 12:
          console.log("gap>10")
          gap = 12
          res(gap)
          break
        case isNaN(gap):
          console.log("gp=")
          gap = 0
          res(gap)
          break
        default:
          res(gap)
          break
      }
    })
  }

  export let disabled
</script>

<div class="settings-input">
  {#if !disabled}
    <Textfield
    class="settings-input__gap"
    label="Gap"
    on:change="{(e) => changeItemsGap(e)}"
    on:input="{(e) => formatToNumberType(e)}"
    value="{$Radius.gap}"
    input$aria-controls="helper-text-outer-radius"
    input$aria-describedby="helper-text-outer-radius"
  />
  <HelperText id="helper-text-items-gap" persistent>0-12</HelperText>
  {:else}
    <Textfield
    class="settings-input__gap"
    label="Gap"
    value="0"
    disabled
    input$aria-controls="helper-text-disabled-outer-radius"
    input$aria-describedby="helper-text-disabled-outer-radius"
  />
  <HelperText id="helper-text-disabled-items-gap" persistent>0-12</HelperText>
  {/if}
</div>