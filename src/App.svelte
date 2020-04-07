<script>
	import { onMount } from "svelte"
	import copy from "copy-to-clipboard"
	import "../node_modules/uikit/dist/css/uikit.min.css"
	import UIkit from "uikit"
	import Icons from "uikit/dist/js/uikit-icons"
	import FileSave from "file-saver"
	import Canvg, { presets } from "canvg"

	UIkit.use(Icons)

	let outerRadius = 90,
		innerRadius = 60,
		gap = 0,
		svgCodeParentBlock,
		textArea,
		clr = "#8a54b2",
		chartImage

	onMount(async () => {
		svgCodeParentBlock = await document.querySelector(".svg-box").innerHTML
	})

	$: blobSVG = new Blob([svgCodeParentBlock], { type: "image/svg+xml;charset=utf-8" })
	//$: blobPNG = new Blob([chartImage], { type: "image/png" })

	$: viewBoxSize = outerRadius * 2
	$: viewBox = `0 0 ${viewBoxSize} ${viewBoxSize}`

	let fakeSvgTabsArr = [
		{ title: "SVG Chart", active: "uk-active" },
		{ title: "View Code", active: "" },
	]

	$: svgTabsArr = fakeSvgTabsArr

	let items = [
		{
			id: 0,
			fill: "#cccccc",
			value: 360,
			start: 0,
			end: 359.99,
			d: arc(0, 359.99, outerRadius, innerRadius),
		},
	]

	$: chartItems = items
	$: itemsCount = chartItems.length

	function onMountTextArea() {
		textArea = document.querySelector("#svg-code")
		textArea.focus()
		textArea.select()
	}

	function saveAsSVG() {
		console.log("eedc")
		FileSave.saveAs(blobSVG, "donut-chart.svg")
	}

	async function saveAsPNG() {
		let parent = document.querySelector(".chart-settings")
		let canvas = document.createElement("canvas")
		svgCodeParentBlock = document.querySelector(".svg-box").innerHTML
		parent.appendChild(canvas)
		const ctx = canvas.getContext("2d")
		let chartImage = await Canvg.from(ctx, svgCodeParentBlock)
		chartImage.start()
		canvas.toBlob((blob) => {
			FileSave.saveAs(blob, "donut-chart.png")
			chartImage.stop()
			canvas.parentNode.removeChild(canvas)
		})
	}

	function addNewChartItem() {
		items.push({
			id: 0,
			fill: getHexStringColor(),
			value: 360,
			start: 0,
			end: 0,
			d: "",
		})

		writeAnglesAndPathsFakearr(returnItemsSumm())
		chartItems = items
		svgCodeParentBlock = document.querySelector(".svg-box").innerHTML
		document.getElementById("delete-all").disabled = false
	}

	function getHexStringColor() {
		return "#" + Math.floor(Math.random() * 16777215).toString(16)
	}

	function arc(sa, ea, or, ir) {
		sa = (sa * Math.PI) / 180
		ea = (ea * Math.PI) / 180
		const sinAlpha = Math.sin(sa)
		const cosAlpha = Math.cos(sa)
		const sinBeta = Math.sin(ea)
		const cosBeta = Math.cos(ea)

		const largeArc = ea - sa > Math.PI

		const P = {
			x: or + or * sinAlpha,
			y: or - or * cosAlpha,
		}

		const Q = {
			x: or + or * sinBeta,
			y: or - or * cosBeta,
		}

		const R = {
			x: or + ir * sinBeta,
			y: or - ir * cosBeta,
		}

		const S = {
			x: or + ir * sinAlpha,
			y: or - ir * cosAlpha,
		}

		return `M${P.x}, ${P.y} A${or},${or} 0 ${largeArc ? "1" : "0"} 1 ${Q.x},${Q.y} L${R.x},${R.y} A${ir},${ir} 0 ${
			largeArc ? "1" : "0"
		} 0 ${S.x},${S.y} Z`
	}

	function writeInnerRadius() {
		console.log(this.value)
		innerRadius = parseInt(this.value)
		validateInnerRadius(innerRadius, outerRadius).then((r) => {
			console.log(r)
			innerRadius = r.ir
			outerRadius = r.or
			items.map((e) => {
				e.d = arc(e.start, e.end, outerRadius, innerRadius)
			})
			chartItems = items
		})
	}

	function removeCharFromValue() {
		let regex = /^\d+$/
		let value = this.value
		let onlyNumberStringValue = ""
		value.split("").forEach((char) => {
			if (regex.test(char)) onlyNumberStringValue += char
			else return
		})
		this.value = onlyNumberStringValue
	}

	function validateInnerRadius(innerRadiusValue, outerRadiusValue) {
		let or = outerRadiusValue
		let ir = innerRadiusValue
		return new Promise((res, rej) => {
			switch (true) {
				case isNaN(ir):
					console.log("ir=")
					ir = 0
					res({ or: or, ir: ir })
					break
				case ir > or:
					console.log("ir>or or ir>199")
					if (ir > 199) ir = 199
					or = ir + 1
					res({ or: or, ir: ir })
					break
				case ir < 0:
					console.log("ir < 0")
					ir = 0
					res({ or: or, ir: ir })
					break
				case ir == or:
					console.log("ir==or")
					if (ir > 199) ir = 199
					or = ir + 1
					res({ or: or, ir: ir })
					break
				default:
					res({ or: or, ir: ir })
					break
			}
		})
	}

	function writeOuterRadius() {
		console.log(parseInt(this.value))
		outerRadius = parseInt(this.value)
		validateOuterRadius(innerRadius, outerRadius).then((r) => {
			console.log(r)
			innerRadius = r.ir
			outerRadius = r.or
			items.map((e) => {
				e.d = arc(e.start, e.end, outerRadius, innerRadius)
			})
			chartItems = items
		})
	}

	function validateOuterRadius(innerRadiusValue, outerRadiusValue) {
		let or = outerRadiusValue
		let ir = innerRadiusValue
		return new Promise((res, rej) => {
			switch (true) {
				case isNaN(or):
					console.log("or=")
					or = 1
					res({ or: or, ir: ir })
					break
				case or < ir:
					console.log("or<ir")
					if (or < 1) or = 1
					ir = or - 1
					res({ or: or, ir: ir })
					break
				case or > 200:
					console.log("or>200")
					or = 200
					res({ or: or, ir: ir })
					break
				case or <= 0:
					console.log("or<=0")
					or = 1
					res({ or: or, ir: ir })
					break
				case or == ir:
					console.log("or==ir")
					ir = ir - 1
					res({ or: or, ir: ir })
					break
				default:
					res({ or: or, ir: ir })
					break
			}
		})
	}

	function writeNewValue() {
		items.find((e) => e.id == this.parentNode.id).value = parseInt(this.value)
		writeAnglesAndPathsFakearr(returnItemsSumm())
		chartItems = items
	}

	function returnItemsSumm() {
		return items.reduce((r, s) => {
			return r + s.value
		}, 0)
	}

	//TODO херово считает через геп, получаются косые промежутки
	function writeAnglesAndPathsFakearr(itemsArrSumm, en) {
		let multiplier = !!!en ? 359.99 : 360
		items.map((e, i) => {
			e.id = i
			let part = (e.value / itemsArrSumm) * multiplier
			if (e.id != 0) {
				e.start = items.find((f) => f.id == i - 1).end + gap
				e.end = items.find((f) => f.id == i - 1).end + part
				e.d = arc(e.start, e.end, outerRadius, innerRadius)
			} else {
				e.start = gap == 0 ? 0 : gap / 2
				e.end = gap == 0 ? part : part - gap / 2
				e.d = arc(e.start, e.end, outerRadius, innerRadius)
			}
		})
	}

	function changeItemsGap() {
		gap = parseInt(this.value)
		validateGap(gap).then((r) => {
			gap = r
			writeAnglesAndPathsFakearr(returnItemsSumm())
			chartItems = items
		})
	}

	// обработать у радиусов пустое значение

	function validateGap(value) {
		let gp = value
		return new Promise((res, rej) => {
			switch (true) {
				case gp < 0:
					console.log("gap<0")
					gp = 0
					res(gp)
					break
				case isNaN(gp):
					console.log("gp=")
					gp = 0
					res(gp)
					break
				default:
					res(gp)
					break
			}
		})
	}

	function changeItemColor() {
		items.find((e) => e.id == this.parentNode.id).fill = this.value
		writeAnglesAndPathsFakearr(returnItemsSumm())
		chartItems = items
	}

	function copyToClipboard() {
		copy(svgCodeParentBlock)
	}

	function removeChartItem() {
		if (chartItems.length > 1) {
			items.splice(this.parentNode.id, 1)
			writeAnglesAndPathsFakearr(returnItemsSumm())
			chartItems = items
		}
		if (chartItems.length < 2) {
			document.getElementById("delete-all").disabled = true
		}
	}

	function resetChart() {
		gap = 0
		innerRadius = 60
		outerRadius = 90
		writeAnglesAndPathsFakearr(returnItemsSumm())
		chartItems = items
	}
	function deleteAllItems() {
		if (chartItems.length > 1) {
			items.splice(1)
			writeAnglesAndPathsFakearr(returnItemsSumm())
			chartItems = items
			this.disabled = true
		}
	}
	function changeTab() {
		let tab = fakeSvgTabsArr.find((e) => e.title === this.innerHTML)
		if (tab.active != "uk-active") {
			fakeSvgTabsArr.map((e) => {
				if (e.title === this.innerHTML) e.active = "uk-active"
				else e.active = ""
			})
			svgTabsArr = fakeSvgTabsArr
			if (tab.title === "View Code") svgCodeParentBlock = document.querySelector(".svg-box").innerHTML
		} else return
	}
</script>

<main>
	<div class="app">
		<div class="app-container">
			<div class="svg-container" style="--main-color: {clr}">
				<div class="svg-tabs">
					<ul uk-tab>
						{#each svgTabsArr as {active, title}}
						<li class="{active}">
							<a href="" on:click="{changeTab}">{title}</a>
						</li>
						{/each}
					</ul>
				</div>
				<div class="svg-chart">
					{#if svgTabsArr[0].active === "uk-active"}
					<div id="code-copy" class="svg-box">
						<svg xmlns="http://www.w3.org/2000/svg" id="sv" width="{viewBoxSize}" height="{viewBoxSize}" {viewBox}>
							{#each chartItems as { id, fill, d}}
							<path {id} {fill} {d} />
							{/each}
						</svg>
					</div>
					{:else if svgTabsArr[1].active === "uk-active"}
					<textarea use:onMountTextArea id="svg-code" class="uk-textarea" readonly>{svgCodeParentBlock}</textarea>
					{/if}
				</div>
				<div class="save-buttons">
					<button class="uk-button uk-button-default" type="submit" on:click="{copyToClipboard}">
						To clipboard
					</button>
					<button class="uk-button uk-button-default" type="submit" on:click="{saveAsPNG}">
						Save as PNG
					</button>
					<button class="uk-button uk-button-default" type="submit" on:click="{saveAsSVG}">
						Save as SVG
					</button>
				</div>
			</div>
			<div class="chart-settings">
				{#if svgTabsArr[1].active === "uk-active"}
				<div class="chart-settings-overlay"></div>
				{/if}
				<div class="settings-container">
					<h4 class="uk-heading-line header-set"><span>SVG Settings</span></h4>
					<div class="svg-settings">
						<input
							class="uk-input input-outer-radius"
							type="text"
							placeholder="Outer Radius"
							on:change="{writeOuterRadius}"
							on:input="{removeCharFromValue}"
							value="{outerRadius}"
						/>
						<input
							class="uk-input"
							type="text"
							placeholder="Inner Radius"
							on:change="{writeInnerRadius}"
							on:input="{removeCharFromValue}"
							value="{innerRadius}"
						/>
						<input
							class="uk-input"
							type="text"
							placeholder="Items Gap"
							on:change="{changeItemsGap}"
							on:input="{removeCharFromValue}"
							value="{gap}"
						/>
						<button class="uk-button uk-button-secondary" type="submit" on:click="{resetChart}">
							Reset
						</button>
					</div>
					<div class="chart-items">
						<h4 class="uk-heading-line header-set">
							<span>Chart Items ({itemsCount})</span>
						</h4>
						<div class="chart-items-setting-buttons">
							<button class="uk-button uk-button-primary" type="submit" on:click="{addNewChartItem}">
								Add item
							</button>
							<button
								id="delete-all"
								class="uk-button uk-button-danger"
								type="submit"
								on:click="{deleteAllItems}"
								disabled
							>
								Delete all
							</button>
						</div>
						<div class="scroll-chart-items">
							{#each chartItems as { id, value, fill }}
							<div {id} class="chart-item">
								<input
									class="uk-input"
									type="number"
									name=""
									placeholder="{value}"
									on:change="{writeNewValue}"
									on:input="{removeCharFromValue}"
								/>
								<input
									class="uk-input color-input"
									type="color"
									name="col"
									value="{fill}"
									on:change="{changeItemColor}"
								/>
								<button
									class="uk-button uk-button-secondary"
									uk-icon="trash"
									type="submit"
									on:click="{removeChartItem}"
								></button>
							</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.uk-textarea {
		resize: none;
	}
	.app {
		display: flex;
		justify-content: center;
		width: 100vw;
		height: 100vh;
	}
	.app-container {
		display: flex;
		flex-direction: row;
		padding-top: 200px;
	}
	.chart-settings {
		display: flex;
		flex-direction: column;
		position: relative;
		width: 300px;
		height: 490px;
		padding: 24px;
		background-color: #8a54b2;
	}
	.svg-settings {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		column-gap: 16px;
		row-gap: 16px;
		padding-bottom: 24px;
	}
	.svg-chart {
		display: flex;
		justify-content: center;
		position: relative;
		padding: 0 24px;
		padding-bottom: 24px;
		width: 440px;
		height: 466px;
	}
	.svg-tabs {
		margin-top: 20px;
	}
	.scroll-chart-items {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		height: 220px;
		margin-top: 16px;
	}
	.svg-container {
		display: flex;
		justify-content: flex-start;
		flex-direction: column;
		width: 488px;
		height: 536px;
		border: 1px solid var(--main-color);
		background-color: #ffffff;
	}
	.chart-items {
		display: flex;
		flex-direction: column;
	}
	.chart-item {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		column-gap: 4px;
	}
	.svg-box {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.chart-item:not(:first-child) {
		margin-top: 16px;
	}
	.header-set {
		color: #ffffff;
	}
	.chart-items-setting-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 12px;
	}
	.save-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}
	.chart-settings-overlay {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: #8a54b2;
		opacity: 85%;
		z-index: 999;
	}
	canvas {
		position: absolute;
	}
</style>
