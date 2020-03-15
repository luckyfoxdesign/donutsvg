<script>
	export let width, height, viewBox
</script>

<div class="chart-box">
	<svg {width} {height} {viewBox}>
		<slot></slot>
	</svg>
</div>

<style>
	.chart-box {
		width: 440px;
		height: 440px;
		border: 1px solid #ff8ba3;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
