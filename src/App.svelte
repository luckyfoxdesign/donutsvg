<script>
	import Svgbox from "./components/Svgbox.svelte"
	import Svgarc from "./components/Svgarc.svelte"
	import DataItems from "./components/DataItems.svelte"
	import SVGSettings from "./components/SVGSettings.svelte"
	import LabelInput from "./components/LabelInput.svelte"
	import DonutHeader from "./components/DonutHeader.svelte"

	let radius = 200

	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

	let width = "300",
			height = "300",
			viewBox = `0 0 ${width} ${height}`,
			color = "#333333",
			strokeWidth = "20"
	let r = parseInt(width)/2 - parseInt(strokeWidth) + parseInt(strokeWidth)/2
	let cx = parseInt(width)/2
	let cy = parseInt(height)/2
</script>

<main>
	<div class="wrapper">
		<DonutHeader/>
		<div class="content">
			<Svgbox {width} {height} {viewBox}>
				<Svgarc arcFill={color} arcWidth={20} arcData={describeArc(cx, cy, r, 0, 270)}/>
			</Svgbox>
			<div class="settings">
				<SVGSettings>
					<LabelInput labelName="Radius" placeholder="wdwddw"/>
					<LabelInput labelName="Stroke-width" placeholder="wdwddw"/>
					<LabelInput labelName="SVG Size" placeholder="wdwddw"/>
				</SVGSettings>
				<DataItems>

				</DataItems>
			</div>
		</div>
	</div>
</main>


<style>
	.wrapper {
		width: 100vw;
		height: 100vh;
		display: flex;
		/* align-items: center; */
		justify-content: center;
		position: relative;
	}
	.content {
		display: flex;
		flex-direction: row;
		position: absolute;
		left: 50;
		top: 200;
		margin-top: 210px;
		z-index: 2;
	}
	.settings {
		padding: 24px;
		background-color: #FF8BA3;
	}
</style>
