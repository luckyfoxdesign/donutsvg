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
	let intInputValue = parseInt(val)
	let intInnerRadius = parseInt(innerRad)
	switch (true) {
		case intInputValue < intInnerRadius:
			if((intInputValue - 1) <= 0) {
				console.log('val-1 <= 0')
				innerInput = innerRad = 1
				this.value = radius = 2
			} else {
				console.log('val < inner and > 0')
				radius = val
				innerInput = innerRad = intInputValue - 1
			}
			break
		case val == innerRad:
			console.log('val = inner')
			radius = val
			innerInput = intInnerRadius - 1
			break;
		case parseInt(val) > 220:
			console.log('val > 220')
			this.value = radius = 220
			break;
		default:
			radius = this.value
			outerInput = radius
	}
}

function setInnerRadius() {
	let val = this.value
	//console.log(`val: ${typeof val} and rad: ${typeof radius}`)
	switch (true) {
		case parseInt(val) > 219:
			console.log('val > 219')
			radius = 220
			outerInput = radius
			this.value = 219
			innerRad = 219
			innerInput = innerRad
			break;
		case parseInt(val) > parseInt(radius):
			console.log('val > outer')
			radius = parseInt(val) + 1
			outerInput = radius
			innerInput = val
			break;
		case val == radius:
			console.log('val = outer')
			radius = parseInt(radius) + 1
			outerInput = radius
			innerInput = val
			break;
		case parseInt(val) <= 0:
			console.log('val <= 0')
			innerRad = 1
			innerInput = innerRad
		default:
			innerRad = val
			innerInput = val
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
