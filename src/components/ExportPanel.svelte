<script>
  import { Anchor } from '@smui/menu-surface';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list';
  import Snackbar, { Actions } from '@smui/snackbar';
  import Button, { Label } from "@smui/button"
  import { Icon as CommonIcon } from '@smui/common';
  import copy from "copy-to-clipboard"
  import FileSave from "file-saver"
  import Canvg, { presets } from "canvg"

  let anchor, menu, snackbar

  async function saveAsPNG() {
    let parent = document.querySelector(".app__chart-canvas")
    let canvas = document.createElement("canvas")
    parent.appendChild(canvas)
    const ctx = canvas.getContext("2d")
    let chartImage = await Canvg.from(ctx, document.querySelector("#code-copy").innerHTML)
    chartImage.start()
    canvas.toBlob((blob) => {
      FileSave.saveAs(blob, "donut-chart.png")
      chartImage.stop()
      canvas.parentNode.removeChild(canvas)
    })
  }

  function saveAsSVG() {
    let blobSVG = new Blob([document.querySelector("#code-copy").innerHTML], { type: "image/svg+xml;charset=utf-8" })
    FileSave.saveAs(blobSVG, "donut-chart.svg")
  }

  function copyToClipboard() {
    snackbar.open()
    setTimeout(() => snackbar.close(), 800)
    copy(document.querySelector("#code-copy").innerHTML)
  }
</script>

<Button class="app__chart-clipboard app__chart-clipboard--params" on:click="{(e) => copyToClipboard(e)}">
  <CommonIcon class="material-icons">file_copy</CommonIcon>
  <Label>Copy to clipboard</Label>
</Button>
<div class="app__chart-saveas app__chart-saveas--params" use:Anchor bind:this={anchor}>
  <Button on:click={()=> menu.setOpen(true)}><CommonIcon class="material-icons">save</CommonIcon>Save As...</Button>
  <Menu bind:this={menu} anchor={false} bind:anchorElement={anchor} anchorCorner="BOTTOM_LEFT">
    <List twoLine>
      <Item on:SMUI:action={saveAsSVG}>
        <Text>
          <PrimaryText>SVG</PrimaryText>
          <SecondaryText>Save chart as SVG file</SecondaryText>
        </Text>
      </Item>
      <Item on:SMUI:action={saveAsPNG}>
        <Text>
          <PrimaryText>PNG</PrimaryText>
          <SecondaryText>Save chart as PNG file</SecondaryText>
        </Text>
      </Item>
    </List>
  </Menu>
</div>
<Snackbar bind:this={snackbar}>
  <Label>Copied to clipboard.</Label>
</Snackbar>