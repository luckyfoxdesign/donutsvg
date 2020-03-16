<script>
	export let placeholder, labelName
</script>

<div class="labeled-input-box">
	<div class="input-label">{labelName}</div>
	<input
		class="labeled-input"
		type="number"
		name=""
		placeholder="{placeholder}"
	/>
</div>

<style>
	.labeled-input-box {
		display: flex;
		align-items: flex-start;
		flex-direction: column;
	}
	.labeled-input {
		border-radius: 2px;
		color: #aaaaaa;
		max-width: 100px;
		border: none;
		padding: 7px 8px 8px 8px;
		font-size: 14px;
		line-height: 17px;
	}
	.input-label {
		font-size: 12px;
		line-height: 14px;
		margin-bottom: 4px;
		color: #ffffff;
	}
</style>
