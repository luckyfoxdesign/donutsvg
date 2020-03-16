<div class="svg-settings">
	<h4>SETTINGS</h4>
	<div class="settings-controls">
		<slot></slot>
	</div>
</div>

<style>
	h4 {
		margin-top: 0;
		margin-bottom: 16px;
		color: #ffffff;
		font-weight: 400;
	}
	.settings-controls {
		display: grid;
		grid-template-rows: auto;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 20px;
		grid-row-gap: 16px;
		padding-bottom: 24px;
		border-bottom: 1px solid #ffffff;
	}
</style>
