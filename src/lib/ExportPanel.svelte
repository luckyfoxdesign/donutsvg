<script>
  import { Anchor } from "@smui/menu-surface";
  import Menu from "@smui/menu";
  import List, { Item, Text, PrimaryText, SecondaryText } from "@smui/list";
  import Snackbar from "@smui/snackbar";
  import Button, { Label } from "@smui/button";
  import copy from "copy-to-clipboard";
  import FileSave from "file-saver";
  import { Canvg } from "canvg";
  import { trackEvent } from "./appEvents.js";
  import IconGlyph from "./IconGlyph.svelte";

  let anchor, menu, snackbar;

  async function saveAsPNG() {
    trackEvent('export_chart', { format: 'png' });
    let parent = document.querySelector(".app__chart-canvas");
    let canvas = document.createElement("canvas");
    parent.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let chartImage = await Canvg.from(
      ctx,
      document.querySelector("#code-copy").innerHTML
    );
    chartImage.start();
    canvas.toBlob((blob) => {
      FileSave.saveAs(blob, "donut-chart.png");
      chartImage.stop();
      canvas.parentNode.removeChild(canvas);
    });
  }

  function saveAsSVG() {
    trackEvent('export_chart', { format: 'svg' });
    let blobSVG = new Blob([document.querySelector("#code-copy").innerHTML], {
      type: "image/svg+xml;charset=utf-8",
    });
    FileSave.saveAs(blobSVG, "donut-chart.svg");
  }

  function copyToClipboard() {
    trackEvent('copy_to_clipboard');
    snackbar.open();
    setTimeout(() => snackbar.close(), 800);
    copy(document.querySelector("#code-copy").innerHTML);
  }
</script>

<Button
  class="app__chart-clipboard app__chart-clipboard--params"
  onclick={(e) => copyToClipboard(e)}
>
  <IconGlyph name="copy" />
  <Label>Copy to clipboard</Label>
</Button>
<div
  class="app__chart-saveas app__chart-saveas--params"
  use:Anchor
  bind:this={anchor}
>
  <Button onclick={() => menu.setOpen(true)}
    ><IconGlyph name="save" />Save As...</Button
  >
  <Menu
    bind:this={menu}
    anchor={false}
    bind:anchorElement={anchor}
    anchorCorner="BOTTOM_LEFT"
  >
    <List twoLine>
      <Item onSMUIAction={saveAsSVG}>
        <Text>
          <PrimaryText>SVG</PrimaryText>
          <SecondaryText>Save chart as SVG file</SecondaryText>
        </Text>
      </Item>
      <Item onSMUIAction={saveAsPNG}>
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
