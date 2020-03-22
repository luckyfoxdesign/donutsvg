<script>
	import Svgbox from "./components/Svgbox.svelte"
	import Svgarc from "./components/Svgarc.svelte"
	import DataItems from "./components/DataItems.svelte"
	import SVGSettings from "./components/SVGSettings.svelte"
	import LabelInput from "./components/LabelInput.svelte"
	import DonutHeader from "./components/DonutHeader.svelte"
	//

	let outerInput = "", innerInput = ""
	let radius = "90"
	$: viewBox = `0 0 ${parseInt(radius) * 2} ${parseInt(radius) * 2}`
	let fill = '#333333'
	$: outerRad = parseInt(radius)
	let innerRad = 60
	$: ar = arc(180, 359, outerRad, innerRad)
	let cb = 'cb'

// A x-radius, y-radius x-axis-rotation large-arc-flag sweep-flag x-end-point y-end-point

function arc(startAngle, endAngle, outerRadius, innerRadius = 0) {
	startAngle = startAngle * Math.PI/180
	endAngle = endAngle * Math.PI/180
  const sinAlpha = Math.sin(startAngle);
  const cosAlpha = Math.cos(startAngle);
  const sinBeta = Math.sin(endAngle);
  const cosBeta = Math.cos(endAngle);

  const largeArc = endAngle - startAngle > Math.PI;

  const P = {
    x: outerRadius + (outerRadius * sinAlpha),
    y: outerRadius - (outerRadius * cosAlpha)
  };

  const Q = {
    x: outerRadius + (outerRadius * sinBeta),
    y: outerRadius - (outerRadius * cosBeta)
  };

  const R = {
    x: outerRadius + (innerRadius * sinBeta),
    y: outerRadius - (innerRadius * cosBeta)
  };

  const S = {
    x: outerRadius + (innerRadius * sinAlpha),
    y: outerRadius - (innerRadius* cosAlpha)
  }

  return `M${P.x},${P.y} A${outerRadius},${outerRadius} 0 ${largeArc ? '1' : '0'} 1 ${Q.x},${Q.y} L${R.x},${R.y} A${innerRadius},${innerRadius} 0 ${largeArc ? '1' : '0'} 0 ${S.x},${S.y} Z`;
}

function setOuterRadius() {
	let val = this.value
	let intInputVal = parseInt(val)
	let intInnerRadius = parseInt(innerRad)
	switch (true) {
		case intInputVal < intInnerRadius:
			if((val - 1) <= 0) {
				console.log('val-1 <= 0')
				innerInput = innerRad = 1 
				outerInput = radius = 2
			} else {
				console.log('val < inner and > 0')
				innerRad = parseInt(val) - 1
				outerInput = radius = val
				innerInput = innerRad
			}
			break
		case intInputVal == intInnerRadius:
			console.log('val = inner')
			routerInput = radius = intInnerRadius + 1
			break;
		case intInputVal > 220:
			console.log('val > 220')
			outerInput = radius = 220
			this.value = 220
			break;
		default:
			outerInput = radius = this.value
	}
}

function setInnerRadius() {
	let val = this.value
	let intInputVal = parseInt(val)
	let intInnerRadius = parseInt(innerRad)
	switch (true) {
		case intInputVal > 219:
			console.log('val > 219')
			outerInput = radius = 220
			this.value = 219
			innerInput = innerRad = 219
			break;
		case intInputVal > parseInt(radius):
			console.log('val > outer')
			outerInput = radius = intInputVal + 1
			innerInput = val
			break;
		case outerInput == parseInt(radius):
			console.log('val = outer')
			outerInput = radius = parseInt(radius) + 1
			innerInput = val
			break;
		case intInputVal <= 0:
			console.log('val <= 0')
			innerInput = innerRad = 1
		default:
			innerInput = innerRad = val
			break;
	}
}

</script>

<main>
	<div class="wrapper">
		<DonutHeader/>
		<div class="content">
			<Svgbox svgId={cb} width={parseInt(radius*2)} height={parseInt(radius*2)} {viewBox}>
				<Svgarc arcFill={fill} arcWidth={0} arcData={ar}/>
			</Svgbox>
			<div class="settings">
				<SVGSettings>
					<LabelInput labelName="Inner Radius" bind:placeholder="{innerRad}" max="{219}" onInput="{setInnerRadius}" value={innerInput}/>
					<LabelInput labelName="Outer Radius" bind:placeholder="{outerRad}" max="{220}" onInput="{setOuterRadius}" value={outerInput}/>
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
