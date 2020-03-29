<script>
	let outerRadius = 90,
		innerRadius = 60,
		gap = 0

	$: viewBoxSize = outerRadius * 2
	$: viewBox = `0 0 ${viewBoxSize} ${viewBoxSize}`

	let items = [
		{
			id: 0,
			fill: "#333333",
			value: 360,
			start: 0,
			end: 359.99,
			d: arc(0, 359.99, outerRadius, innerRadius)
		}
	]
	let chartItems = [
		{
			id: 0,
			fill: "#333333",
			value: 360,
			start: 0,
			end: 359.99,
			d: arc(0, 359.99, outerRadius, innerRadius)
		}
	]

	function addNewChartItem() {
		items.push({
			id: 0,
			fill: getHexStringColor(),
			value: 360,
			start: 0,
			end: 0,
			d: ""
		})

		mapItems(returnItemsSumm())

		chartItems = items
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

		return `M${P.x}, ${P.y} A${or},${or} 0 ${largeArc ? "1" : "0"} 1 ${Q.x},${
			Q.y
		} L${R.x},${R.y} A${ir},${ir} 0 ${largeArc ? "1" : "0"} 0 ${S.x},${S.y} Z`
	}

	function writeInnerRadius() {
		innerRadius = parseInt(this.value)
		items.map(e => {
			e.d = arc(e.start, e.end, outerRadius, innerRadius)
		})
		chartItems = items
	}

	function writeOuterRadius() {
		outerRadius = parseInt(this.value)
		items.map(e => {
			e.d = arc(e.start, e.end, outerRadius, innerRadius)
		})
		chartItems = items
	}

	function writeNewValue() {
		items.find(e => e.id == this.id).value = parseInt(this.value)

		mapItems(returnItemsSumm())

		chartItems = items
	}

	function returnItemsSumm() {
		return items.reduce((r, s) => {
			return r + s.value
		}, 0)
	}

	//TODO херово считает через геп, получаются косые промежутки
	//переделать map с gap в одну функцию, две здесь нахер не нужны
	function mapItems(itemsArrSumm) {
		if (gap == 0) {
			items.map((e, i) => {
				e.id = i
				let part = (e.value / itemsArrSumm) * 360
				if (e.id != 0) {
					e.start = items.find(f => f.id == i - 1).end
					e.end = items.find(f => f.id == i - 1).end + part
					e.d = arc(e.start, e.end, outerRadius, innerRadius)
				} else {
					e.start = 0
					e.end = part
					e.d = arc(e.start, e.end, outerRadius, innerRadius)
				}
			})
		} else {
			items.map((e, i) => {
				e.id = i
				let part = (e.value / itemsArrSumm) * 360
				if (e.id != 0) {
					e.start = items.find(f => f.id == i - 1).end + gap
					e.end = items.find(f => f.id == i - 1).end + part
					e.d = arc(e.start, e.end, outerRadius, innerRadius)
				} else {
					e.start = gap
					e.end = part
					e.d = arc(e.start, e.end, outerRadius, innerRadius)
				}
			})
		}
	}

	function changeItemsGap() {
		console.log("dwdw")
		gap = parseInt(this.value)
		mapItems(returnItemsSumm())
		chartItems = items
	}

	function changeItemColor() {
		items.find(e => e.id == this.id).fill = this.value

		mapItems(returnItemsSumm())

		chartItems = items
	}
</script>

<main>
	<svg width="{viewBoxSize}" height="{viewBoxSize}" {viewBox}>
		{#if items == 0} //
		<path id="0" fill="#333333" d="{arc(0, 359.99, 90, 60)}" />
		{:else} {#each chartItems as { id, fill, d}}
		<path {id} {fill} {d} />
		{/each} {/if}
	</svg>
	<button type="submit" on:click="{addNewChartItem}">Add new chart item</button>
	<button type="submit">
		Copy to clipboard
	</button>
	<input
		id=""
		type="number"
		name="or"
		placeholder="outer"
		on:change="{writeOuterRadius}"
	/>
	<input
		id=""
		type="number"
		name="ir"
		placeholder="inner"
		on:change="{writeInnerRadius}"
	/>
	<input
		id=""
		type="number"
		name="gap"
		placeholder="gap"
		on:change="{changeItemsGap}"
	/>
	{#each chartItems as { id, value, fill }}
	<input
		type="number"
		name=""
		id="{id}"
		placeholder="{value}"
		on:change="{writeNewValue}"
	/>
	<input
		type="color"
		name="col"
		id="{id}"
		value="{fill}"
		on:change="{changeItemColor}"
	/>
	{/each}
</main>

<style></style>
