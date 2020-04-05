<script>
	import { onMount } from "svelte"
	import copy from "copy-to-clipboard"
	import "../node_modules/uikit/dist/css/uikit.min.css"
	import UIkit from "uikit"
	import Icons from "uikit/dist/js/uikit-icons"
	import validateValue from "./utils/utils"

	let clr = "#8a54b2"

	UIkit.use(Icons)

	let outerRadius = 90,
		innerRadius = 60,
		gap = 0
	let cc

	$: svgCode = cc

	onMount(async () => {
		cc = await document.getElementById("code-copy").innerHTML
	})

	$: viewBoxSize = outerRadius * 2
	$: viewBox = `0 0 ${viewBoxSize} ${viewBoxSize}`

	let fakeSvgTabsArr = [
		{ title: "SVG Chart", active: "uk-active" },
		{ title: "View Code", active: "" }
	]

	$: svgTabsArr = fakeSvgTabsArr

	let items = [
		{
			id: 0,
			fill: "#cccccc",
			value: 360,
			start: 0,
			end: 359.99,
			d: arc(0, 359.99, outerRadius, innerRadius)
		}
	]
	$: chartItems = items

	$: itemsCount = chartItems.length

	function addNewChartItem() {
		items.push({
			id: 0,
			fill: getHexStringColor(),
			value: 360,
			start: 0,
			end: 0,
			d: ""
		})

		writeAnglesAndPathsFakearr(returnItemsSumm())
		chartItems = items
		cc = document.getElementById("code-copy").innerHTML
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
			y: or - or * cosAlpha
		}

		const Q = {
			x: or + or * sinBeta,
			y: or - or * cosBeta
		}

		const R = {
			x: or + ir * sinBeta,
			y: or - ir * cosBeta
		}

		const S = {
			x: or + ir * sinAlpha,
			y: or - ir * cosAlpha
		}

		return `M${P.x}, ${P.y} A${or},${or} 0 ${largeArc ? "1" : "0"} 1 ${Q.x},${Q.y} L${R.x},${R.y} A${ir},${ir} 0 ${largeArc ? "1" : "0"} 0 ${S.x},${S.y} Z`
	}

	function writeInnerRadius() {
		innerRadius = parseInt(this.value)
		items.map(e => {
			e.d = arc(e.start, e.end, outerRadius, innerRadius)
		})
		chartItems = items
		validateValue(true).then(console.log(this.value))
	}

	function writeOuterRadius() {
		outerRadius = parseInt(this.value)
		items.map(e => {
			e.d = arc(e.start, e.end, outerRadius, innerRadius)
		})
		chartItems = items
	}

	function writeNewValue() {
		items.find(e => e.id == this.parentNode.id).value = parseInt(this.value)
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
				e.start = items.find(f => f.id == i - 1).end + gap
				e.end = items.find(f => f.id == i - 1).end + part
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
		writeAnglesAndPathsFakearr(returnItemsSumm())
		chartItems = items
	}

	function changeItemColor() {
		items.find(e => e.id == this.parentNode.id).fill = this.value
		writeAnglesAndPathsFakearr(returnItemsSumm())
		chartItems = items
	}

	function copyToClipboard() {
		copy(svgCode)
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
		let tab = fakeSvgTabsArr.find(e => e.title === this.innerHTML)
		if (tab.active != "uk-active") {
			fakeSvgTabsArr.map(e => {
				if (e.title === this.innerHTML) e.active = "uk-active"
				else e.active = ""
			})
			svgTabsArr = fakeSvgTabsArr
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
						<li class="{active}"><a href="" on:click="{changeTab}">{title}</a></li>
						{/each}
					</ul>
				</div>
				<div class="svg-chart">
					{#if svgTabsArr[0].active === "uk-active"}
					<div id="code-copy" class="svg-box">
						<svg width="{viewBoxSize}" height="{viewBoxSize}" {viewBox}>
							{#each chartItems as { id, fill, d}}
							<path {id} {fill} {d} />
							{/each}
						</svg>
					</div>
					{:else if fakeSvgTabsArr[1].active === "uk-active"}
					<textarea name="" id="svg-code" class="uk-textarea" cols="30" rows="10">{svgCode}</textarea>
					{/if}
				</div>
				<button class="uk-button uk-button-default" type="submit" on:click="{copyToClipboard}">Copy to clipboard</button>
			</div>
			<div class="chart-settings">
				<div class="settings-container">
					<h4 class="uk-heading-line header-set"><span>SVG Settings</span></h4>
					<div class="svg-settings">
						<input class="uk-input" type="number" placeholder="Outer Radius" on:change="{writeOuterRadius}" />
						<input class="uk-input" type="number" placeholder="Inner Radius" on:change="{writeInnerRadius}" />
						<input class="uk-input" type="number" placeholder="Items Gap" on:change="{changeItemsGap}" />
						<button class="uk-button uk-button-secondary" type="submit" on:click="{resetChart}">Reset</button>
					</div>
					<div class="chart-items">
						<h4 class="uk-heading-line header-set"><span>Chart Items ({itemsCount})</span></h4>
						<div class="chart-items-setting-buttons">
							<button class="uk-button uk-button-primary" type="submit" on:click="{addNewChartItem}">Add item</button>
							<button id="delete-all" class="uk-button uk-button-danger" type="submit" on:click="{deleteAllItems}" disabled>Delete all</button>
						</div>
						<div class="scroll-chart-items">
							{#each chartItems as { id, value, fill }}
							<div {id} class="chart-item">
								<input class="uk-input" type="number" name="" placeholder="{value}" on:change="{writeNewValue}" />
								<input class="uk-input color-input" type="color" name="col" value="{fill}" on:change="{changeItemColor}" />
								<button class="uk-button uk-button-secondary" uk-icon="trash" type="submit" on:click="{removeChartItem}"></button>
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
</style>
