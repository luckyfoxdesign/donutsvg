<script>
	import SmallDonut from './SmallDonut.svelte'
</script>

<div class="logo-box">
	<div class="logo-title">
		<h2>Donut chart</h2>
		<h3>SVG generator</h3>
	</div>
	<img class="main-donut" src="/img/donut.png" alt="" />
	<SmallDonut lf="-22%" tp="43%" w="80"/>
	<SmallDonut lf="-72%" tp="13%" w="160"/>
	<SmallDonut lf="142%" tp="-23%" w="160"/>
	<SmallDonut lf="132%" tp="63%" w="80"/>
</div>

<style>
	h2 {
		margin: 0;
		margin-bottom: 4px;
		line-height: 29px;
		font-size: 24px;
		color: #fc7a90;
		font-weight: 700;
	}
	h3 {
		margin: 0;
		line-height: 17px;
		font-size: 14px;
		color: #f39d3f;
		font-weight: 400;
	}
	.logo-box {
		position: absolute;
		top: 0;
		display: flex;
		justify-content: center;
	}
	.logo-title {
		position: inherit;
		display: flex;
		flex-direction: column;
		align-items: center;
		top: 20%;
		left: 39%;
	}
</style>
