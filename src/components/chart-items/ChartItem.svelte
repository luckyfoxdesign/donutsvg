<script>
  import ColorInput from "./ColorInput.svelte";
  import ValueInput from "./ValueInput.svelte";
  import { Icon as CommonIcon } from '@smui/common';
  import IconButton from '@smui/icon-button';
  import { Radius, ChartItems, FakeChartItems } from "../../store.js"
  import { writeAnglesAndPathsFakearr } from "../../core/core.js"

  function removeChartItem(e) {
    if ($ChartItems.length > 1) {
      $FakeChartItems.splice(e.target.parentNode.id, 1)
      writeAnglesAndPathsFakearr($FakeChartItems, $Radius)
      $ChartItems = $FakeChartItems
    }
  }

  export let id, value, fill
</script>

<div {id} class="app__data-item app__data-item--{id}">
  <ValueInput {id} {value}/>
  <ColorInput {fill} />
  {#if $ChartItems.length > 1}
    <IconButton class="material-icons" on:click="{(e) => removeChartItem(e)}">delete_forever</IconButton>
  {/if}
</div>