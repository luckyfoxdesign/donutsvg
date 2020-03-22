<script>
	export let placeholder, labelName, onInput, max, value
</script>

<div class="labeled-input-box">
	<label for="labeled-input" class="input-label">{labelName}</label>
	<input
		class="labeled-input"
		type="number"
		name=""
		min="0"
		max="{max}"
		placeholder="{placeholder}"
		on:input="{onInput}"
		value="{value}"
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
		width: 100px;
		border: none;
		padding: 7px 8px 8px 8px;
		font-size: 14px;
		line-height: 17px;
		color: #333333;
	}
	.labeled-input::placeholder {
		color: #bababa;
	}
	.input-label {
		font-size: 12px;
		line-height: 14px;
		margin-bottom: 4px;
		color: #ffffff;
	}
</style>
