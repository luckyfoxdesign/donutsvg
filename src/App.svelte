<script>
	let radius = "75",
		stroke = "30",
		dataoffset,
		it = 0,
		id = 0
	$: dash = 2 * radius * 3.14
	const colors = [
		{ color: "#50aef4" },
		{ color: "#3ab011" },
		{ color: "#ff8e29" },
		{ color: "#890c85" },
		{ color: "#e91e25" },
		{ color: "#ffc83f" }
	]

	$: width = "180"
	$: height = width
	$: vbWidth = parseInt(radius) * 2 + parseInt(stroke)
	$: cx = parseInt(radius) + parseInt(stroke) / 2

	$: vbHeight = vbWidth
	$: cy = cx
	$: viewBox = `0 0 ${vbWidth} ${vbHeight}`
	$: dataitems = []

	function summd() {
		let sum = 0
		dataitems.map(e => (sum = sum + e.data))
		dataitems.map(f => {
			if (f.id === dataitems.length - 1) return
			f.offset = dash - (f.data / sum) * dash * (f.id + 1)
		})
	}

	function onc() {
		console.log("dwdwd")
	}

	function handleReset() {
		width = "180"
		radius = "75"
		stroke = "30"
		it = 0
		id = 0
		dataitems = dataitems.splice(...dataitems, dataitems.length)
	}

	function additem() {
		dataitems = dataitems.concat(
			dataitems.splice(0, 0, {
				id: id,
				data: 100,
				offset: 0,
				color: colors[it].color
			})
		)

		summd()

		++id
		++it
		if (it >= 5) {
			it = 0
		}
	}
</script>

<main>
	<h1>Donut SVG generator</h1>
	<input
		type="number"
		min="0"
		step="1"
		placeholder="radius"
		bind:value="{radius}"
	/>
	<input
		type="number"
		min="0"
		step="1"
		placeholder="stroke"
		bind:value="{stroke}"
	/>
	<input
		type="number"
		min="0"
		step="1"
		max="440"
		placeholder="width"
		bind:value="{width}"
	/>
	<button on:click="{handleReset}" type="submit">Reset</button>
	<button on:click="{ additem}" type="submit">Add item</button>
	{#each dataitems as dataitem}
	<input
		type="number"
		min="0"
		step="1"
		max="440"
		placeholder="{dataitem.data}"
		on:change="{onc}"
	/>
	{/each}
	<div class="ch">
		<svg {width} {height} {viewBox} class="donut" transform="rotate(-90)">
			<circle
				{cx}
				{cy}
				r="{radius}"
				fill="none"
				stroke="#ccc"
				stroke-width="{stroke}"
			></circle>
			{#each dataitems as dataitem}
			<circle
				{cx}
				{cy}
				r="{radius}"
				fill="none"
				stroke="{dataitem.color}"
				stroke-width="{stroke}"
				stroke-dasharray="{dash}"
				stroke-dashoffset="{dataitem.offset}"
			></circle>
			{/each}
		</svg>
	</div>
</main>

<style>
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
</style>
