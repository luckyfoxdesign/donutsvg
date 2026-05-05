<script>
  import HelperText from "@smui/textfield/helper-text";
  import Textfield from "@smui/textfield";
  import {
    formatToNumberType,
    writeAnglesAndPathsFakearr,
  } from "../core/core.js";
  import { Radius, ChartItems, FakeChartItems } from "../store.js";

  function changeItemsGap(e) {
    if ($ChartItems.length > 1) {
      let gap = parseInt(e.target.value);
      let nextRadius;

      Radius.update((radius) => {
        nextRadius = { ...radius, gap: formatGap(gap) };
        return nextRadius;
      });

      FakeChartItems.update((items) =>
        writeAnglesAndPathsFakearr(items, nextRadius),
      );
    } else e.target.value = 0;
  }

  function formatGap(value) {
    let gap = value;

    switch (true) {
      case gap < 0:
        gap = 0;
        break;
      case gap > 12:
        gap = 12;
        break;
      case isNaN(gap):
        gap = 0;
        break;
      default:
        break;
    }

    return gap;
  }

  export let disabled;
</script>

<div class="settings-input">
  {#if !disabled}
    <Textfield
      class="settings-input__gap"
      label="Gap"
      onchange={(e) => changeItemsGap(e)}
      oninput={(e) => formatToNumberType(e)}
      value={$Radius.gap}
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
