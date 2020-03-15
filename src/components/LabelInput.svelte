<script>
	export let placeholder, labelName
</script>

<div class="labeled-input-box">
	<div class="label">{labelName}</div>
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
	}
	.labeled-input {
		border-radius: 2px;
		color: B8B8B8;
	}
</style>
