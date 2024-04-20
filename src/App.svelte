<script>
	import { onMount } from "svelte";
	import Button, { Label } from "@smui/button";
	import Tab from '@smui/tab';
  	import TabBar from '@smui/tab-bar';
	import { Icon } from "@smui/icon-button";
	import Paper, { Content } from '@smui/paper';
	import OuterRadius from "./lib/OuterRadius.svelte";
	import InnerRadius from "./lib/InnerRadius.svelte";
	import ExportPanel from "./lib/ExportPanel.svelte";
	import Gap from "./lib/Gap.svelte";
	import ChartItem from "./lib/chart-items/ChartItem.svelte";
	import { Radius, ChartItems, FakeChartItems } from "./store.js";
	import {
		computeChartArc,
		getHexStringColor,
		writeAnglesAndPathsFakearr,
	} from "./core/core.js";

	let topShadow, bottomShadow, scrollView;

	let options = {
		root: scrollView,
		rootMargin: "0px",
		threshold: 1.0,
	};

	let active = 'Donut/Pie';

	onMount(async () => {
		scrollView = await document.querySelector(".app__data-scroll");
		let zeroItem = await document.querySelector(".app__data-item--0");

		await observeFirstChartItem(zeroItem);
	});

	$: viewBoxSize = $Radius.outer * 2;
	$: viewBox = `0 0 ${viewBoxSize} ${viewBoxSize}`;

	$: $ChartItems = $FakeChartItems;

	function addNewChartItem(e) {
		if ($FakeChartItems.length > 11) {
			return
		} else {
			$FakeChartItems.push({
				id: 0,
				fill: getHexStringColor(),
				// value: Math.floor(Math.random() * (100 - 0 + 1)) + 0,
				value: 50,
				start: 0,
				end: 0,
				d: "",
			})
			writeAnglesAndPathsFakearr($FakeChartItems, $Radius)
			$ChartItems = $FakeChartItems
			setTimeout(() => {
				document.querySelector(`.app__data-item--${$ChartItems.length - 1}`).scrollIntoView({ behavior: 'smooth', block: 'end' });
			}, 50)
		}
		if ($FakeChartItems.length >= 7 && $FakeChartItems.length < 13) observeLastChartItem()
	}

	function observeLastChartItem() {
		setTimeout(() => {
			let observerItem = document.querySelector(
				`.app__data-item--${$FakeChartItems.length - 1}`
			);
			let observer = new IntersectionObserver((entries, observer) => {
				for (let i = 1; i < $FakeChartItems.length - 1; i++) {
					observer.unobserve(
						document.querySelector(`.app__data-item--${i}`)
					);
				}
				handleScrollViewShadows(entries, "bottom", observerItem);
			}, options);
			observer.observe(observerItem);
		}, 50);
	}

	function observeFirstChartItem(item) {
		let observer = new IntersectionObserver((entries, observer) => {
			handleScrollViewShadows(entries, "top", item);
		}, options);
		observer.observe(item);
	}

	function handleScrollViewShadows(entries, position, item) {
		entries.forEach((entry) => {
			if (entry.isIntersecting && entry.intersectionRatio == 1) {
				switch (position) {
					case "top":
						topShadow = false;
						break;
					case "bottom":
						bottomShadow = false;
						break;
					default:
						break;
				}
			} else if ($ChartItems.length > 6)
				(topShadow = true), (bottomShadow = true);
		});
	}

	function resetChart() {
		$Radius.gap = 0;
		$Radius.inner = 60;
		$Radius.outer = 90;
		writeAnglesAndPathsFakearr($FakeChartItems, $Radius);
		$ChartItems = $FakeChartItems;
	}

	function deleteAllItems(e) {
		if ($ChartItems.length > 1) {
			topShadow = false;
			bottomShadow = false;
			$Radius.gap = 0;
			$FakeChartItems.splice(1);
			writeAnglesAndPathsFakearr($FakeChartItems, $Radius);
			$ChartItems = $FakeChartItems;
		}
	}
</script>

<main>
	<div class="app app_size">
		<div class="app__container">
			<div class="app__app-title app__app-title--params">
				<div class="mdc-typography--headline4">Piedog <a href="https://forms.gle/6owsZ9sS5Rf7Baw28" style="color: red; font-weight: 700;" target="_blank">Participate in Our Quick Survey to Enhance the Tool!</a> </div>
				<div class="app__app-description">
					<div class="mdc-typography--subtitle1">
						Generate pie or donut chart in svg/png
					</div>
					<div class="app__social app__social--params">
						<div class="app__social-icons">
							<a
								class="mdc-typography--subtitle1"
								href="https://twitter.com/luckyfoxdesign"
								target="_blank"
								rel="noopener noreferrer">Twitter</a
							>
							<a
								class="mdc-typography--subtitle1"
								href="https://www.linkedin.com/in/maksim-sovenkov-b53770155/"
								target="_blank"
								rel="noopener noreferrer">LinkedIn</a
							>
							<a
								class="mdc-typography--subtitle1"
								href="https://www.behance.net/luckyfoxdesign"
								target="_blank"
								rel="noopener noreferrer">Behance</a
							>
							<a
								class="mdc-typography--subtitle1"
								href="https://github.com/Luckyfoxdesign/donutsvg"
								target="_blank"
								rel="noopener noreferrer">Github</a
							>
							<a
								class="mdc-typography--subtitle1"
								href="mailto:luckyfoxdesign@yandex.ru">Email</a
							>
						</div>
					</div>
				</div>
			</div>
			<div>
				<TabBar tabs={['Donut/Pie', 'Line', 'Bar']} let:tab bind:active>
					<!-- Note: the `tab` property is required! -->
					<Tab {tab}>
					  <Label>{tab}</Label>
					</Tab>
				  </TabBar>
			</div>
			{#if active === 'Donut/Pie'}
			<Paper variant="unelevated">
			<Content>
				<div class="app__form app__form--params">
					<div class="app__chart app__chart--params">
						<div class="app__chart-canvas pp__chart-canvas--params" />
						<div class="app__chart-header app__chart-header--params">
							<h4 class="mdc-typography--headline6">SVG Settings</h4>
							{#if $Radius.gap === 0 && $Radius.inner === 60 && $Radius.outer === 90}
								<Button class="app__chart-reset" disabled>
									<Label>Reset</Label>
								</Button>
							{:else}
								<Button
									class="app__chart-reset"
									on:click={(e) => resetChart(e)}
								>
									<Label>Reset</Label>
								</Button>
							{/if}
						</div>
						<div class="app__chart-settings">
							<OuterRadius />
							<InnerRadius />
							{#if $FakeChartItems.length > 1}
								<Gap />
							{:else}
								<Gap disabled />
							{/if}
						</div>
						<div class="app__chart-svg app__chart-svg--params">
							<div id="code-copy">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									id="sv"
									width={viewBoxSize}
									height={viewBoxSize}
									{viewBox}
								>
									{#each $ChartItems as { id, fill, d }}
										<path {id} {fill} {d} />
									{/each}
								</svg>
							</div>
						</div>
						<div class="app__chart-export app__chart-export--params">
							<ExportPanel />
						</div>
					</div>
					<div class="app__data app__data--params">
						<div class="app__data-header">
							<h4
								class="mdc-typography--headline6 mdc-typography--itemsheadline"
							>
								<!-- <span>Chart Items ({$ChartItems.length})</span> -->
							</h4>
							<div
								class="app__data-buttons app__data-buttons--params"
							>
								<Button
									class=""
									type="submit"
									on:click={(e) => addNewChartItem(e)}
									variant="unelevated"
								>
									<Icon class="material-icons">add</Icon><Label
										>Add new item</Label
									>
								</Button>
								{#if $ChartItems.length < 2}
									<Button disabled>
										<Label>Delete all</Label>
									</Button>
								{:else}
									<Button on:click={(e) => deleteAllItems(e)}>
										<Label>Delete all</Label>
									</Button>
								{/if}
							</div>
							<div class="app__data-scroll-withshadows">
								{#if topShadow}
									<div
										class="app__data-scroll-shadowtop app__data-scroll-shadowtop--params"
									/>
								{/if}
								{#if bottomShadow}
									<div
										class="app__data-scroll-shadowbottom app__data-scroll-shadowbottom--params"
									/>
								{/if}
								<div
									class="app__data-scroll app__data-scroll--params"
								>
									{#each $ChartItems as { id, value, fill }}
										<ChartItem {id} {value} {fill} />
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Content>
			</Paper>
		{:else if active === 'Line'}
			<Paper variant="unelevated">
			<Content>
				In progress
			</Content>
			</Paper>
		{:else if active === 'Bar'}
			<Paper variant="unelevated">
			<Content>
				In progress
			</Content>
			</Paper>
		{/if}
		</div>
	</div>
</main>

<style></style>
