<script>
	import { onMount } from "svelte";
	import Button, { Label } from "@smui/button";
	import Tab from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	import Paper, { Content } from "@smui/paper";
	import OuterRadius from "./lib/OuterRadius.svelte";
	import InnerRadius from "./lib/InnerRadius.svelte";
	import ExportPanel from "./lib/ExportPanel.svelte";
	import Gap from "./lib/Gap.svelte";
	import ChartItem from "./lib/chart-items/ChartItem.svelte";
	import IconGlyph from "./lib/IconGlyph.svelte";
	import { Radius, ChartItems, FakeChartItems, createChartItem } from "./store.js";
	import {
		getHexStringColor,
		writeAnglesAndPathsFakearr,
	} from "./core/core.js";
	import { initAppEvents, trackEvent } from "./lib/appEvents.js";

	let topShadow, bottomShadow, scrollView;

	let options = {
		root: scrollView,
		rootMargin: "0px",
		threshold: 1.0,
	};

	let active = "Donut/Pie";

	onMount(async () => {
		initAppEvents();

		scrollView = await document.querySelector(".app__data-scroll");
		let zeroItem = await document.querySelector(".app__data-item--0");

		await observeFirstChartItem(zeroItem);
	});

	$: viewBoxSize = $Radius.outer * 2;
	$: viewBox = `0 0 ${viewBoxSize} ${viewBoxSize}`;

	function addNewChartItem(e) {
		trackEvent('add_chart_item', { item_count: $FakeChartItems.length + 1 });
		if ($FakeChartItems.length > 11) {
			return;
		} else {
			let nextItemIndex = $FakeChartItems.length;
			FakeChartItems.update((items) =>
				writeAnglesAndPathsFakearr(
					[
						...items,
						createChartItem({
							fill: getHexStringColor(),
							// value: Math.floor(Math.random() * (100 - 0 + 1)) + 0,
							value: 50,
						}),
					],
					$Radius,
				),
			);
			setTimeout(() => {
				document
					.querySelector(`.app__data-item--${nextItemIndex}`)
					?.scrollIntoView({ behavior: "smooth", block: "end" });
			}, 50);
		}
		if ($FakeChartItems.length >= 7 && $FakeChartItems.length < 13)
			observeLastChartItem();
	}

	function observeLastChartItem() {
		setTimeout(() => {
			let observerItem = document.querySelector(
				`.app__data-item--${$FakeChartItems.length - 1}`,
			);
			let observer = new IntersectionObserver((entries, observer) => {
				for (let i = 1; i < $FakeChartItems.length - 1; i++) {
					observer.unobserve(
						document.querySelector(`.app__data-item--${i}`),
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
		trackEvent('reset_chart');
		let nextRadius = { gap: 0, inner: 60, outer: 90 };
		Radius.update(() => nextRadius);
		FakeChartItems.update((items) =>
			writeAnglesAndPathsFakearr(items, nextRadius),
		);
	}

	function deleteAllItems(e) {
		trackEvent('delete_all_items', { item_count: $ChartItems.length });
		if ($ChartItems.length > 1) {
			topShadow = false;
			bottomShadow = false;
			let nextRadius;
			Radius.update((radius) => {
				nextRadius = { ...radius, gap: 0 };
				return nextRadius;
			});
			FakeChartItems.update((items) =>
				writeAnglesAndPathsFakearr(items.slice(0, 1), nextRadius),
			);
		}
	}
</script>

<main>
	<div class="app app_size">
		<div class="app__container">
			<div class="app__app-title app__app-title--params">
				<div class="mdc-typography--headline4">Piedog</div>
				<div class="app__app-description">
					<div class="mdc-typography--subtitle1">
						Generate pie or donut chart in svg/png
					</div>
					<div class="app__social app__social--params">
						<div class="app__social-icons">
							<a
								class="mdc-typography--subtitle1"
								href="https://luckyfox.design"
								target="_blank"
								rel="noopener noreferrer"
								onclick={() => trackEvent('social_link_click', { platform: 'website' })}>luckyfox.design</a
							>
							<a
								class="mdc-typography--subtitle1"
								href="https://www.linkedin.com/in/luckyfoxdesign/"
								target="_blank"
								rel="noopener noreferrer"
								onclick={() => trackEvent('social_link_click', { platform: 'linkedin' })}>LinkedIn</a
							>
							<a
								class="mdc-typography--subtitle1"
								href="https://github.com/Luckyfoxdesign/donutsvg"
								target="_blank"
								rel="noopener noreferrer"
								onclick={() => trackEvent('social_link_click', { platform: 'github' })}>Github</a
							>
							<a
								class="mdc-typography--subtitle1"
								href="mailto:luckyfoxinthebox@gmail.com"
								onclick={() => trackEvent('social_link_click', { platform: 'email' })}>Email</a
							>
						</div>
					</div>
				</div>
			</div>
			<div
				style="display: flex; flex-direction:row; margin-top: 12px; align-items: center; padding:12px; border: 1px solid #ccc; border-radius: 12px;"
			>
				<div style="display: flex; flex-direction: column;">
					<span>
						Check out a <a
							href="https://makemechart.com/chart/doughnut?old=true"
							target="_blank"
							rel="noopener noreferrer"
							onclick={() => trackEvent('promo_link_click', { label: 'new_version' })}>new version</a
						>
						with additional customization and other charts!
					</span>
					<a
						href="https://forms.gle/SzJRBRn7LDBAW2zd7"
						onclick={() => trackEvent('promo_link_click', { label: 'feedback_form' })}>Write your ideas how can I improve the tools!</a
					>
				</div>
				<span style="margin-left: auto;">
					<a
						class="mdc-typography--subtitle1 app__support-link"
						href="https://www.buymeacoffee.com/luckyfoxdesign"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Buy me a coffee"
						onclick={() => trackEvent('promo_link_click', { label: 'buy_me_coffee' })}
						>Buy me a coffee</a
					>
				</span>
			</div>
			<div class="app__form app__form--params">
				<div class="app__chart app__chart--params">
					<div class="app__chart-canvas pp__chart-canvas--params"></div>
					<div class="app__chart-header app__chart-header--params">
						<h4 class="mdc-typography--headline6">SVG Settings</h4>
						{#if $Radius.gap === 0 && $Radius.inner === 60 && $Radius.outer === 90}
							<Button class="app__chart-reset" disabled>
								<Label>Reset</Label>
							</Button>
						{:else}
							<Button
								class="app__chart-reset"
								onclick={(e) => resetChart(e)}
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
								{#each $ChartItems as { uid, id, fill, d } (uid)}
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
								onclick={(e) => addNewChartItem(e)}
								variant="unelevated"
							>
								<IconGlyph name="add" /><Label
									>Add new item</Label
								>
							</Button>
							{#if $ChartItems.length < 2}
								<Button disabled>
									<Label>Delete all</Label>
								</Button>
							{:else}
								<Button onclick={(e) => deleteAllItems(e)}>
									<Label>Delete all</Label>
								</Button>
							{/if}
						</div>
						<div class="app__data-scroll-withshadows">
							{#if topShadow}
								<div
									class="app__data-scroll-shadowtop app__data-scroll-shadowtop--params"
								></div>
							{/if}
							{#if bottomShadow}
								<div
									class="app__data-scroll-shadowbottom app__data-scroll-shadowbottom--params"
								></div>
							{/if}
							<div
								class="app__data-scroll app__data-scroll--params"
							>
								{#each $ChartItems as { uid, value, fill }, id (uid)}
									<ChartItem {uid} {id} {value} {fill} />
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style></style>
