<script>
import {onMount} from "svelte";
import sleep from "../utils/sleep";
import inlineStyle from "../utils/dom/inlineStyle";
import bodyClick from "../utils/dom/bodyClick";

export let css = null;

let box;
let showing = false;
let teardown;

export async function show() {
	showing = true;
	
	await sleep();
	
	teardown = bodyClick.on(hide, [box]);
}

export function hide() {
	showing = false;
	
	teardown();
	
	teardown = null;
}

function keyup({key}) {
	if (key === "Escape") {
		hide();
	}
}
</script>

<style>
@import "../css/classes/hide";
@import "../css/mixins/flex-lr";
@import "../css/mixins/flex-col";

#anchor {
	@include flex-col;
	
	position: fixed;
	z-index: 100;
	align-items: center;
	top: 0;
	width: 100vw;
	height: 0;
}

#main {
	@include flex-col;
	
	align-items: center;
	width: 100vw;
	height: 0;
}

#box {
	flex-shrink: 0;
	width: 72%;
	max-height: 80vh;
	margin: 4em 0 2em;
	border: 1px solid #cccccc;
	border-radius: 8px;
	padding: 1.3em;
	box-shadow: 0 6px 14px 1px #0000001a;
	overflow-y: auto;
	background: white;
	
	@media(min-width: 42em) {
		min-width: 40em;
	}
	
	@media(max-width: 42em) {
		width: 100%;
	}
}

#top {
	@include flex-lr;
}

#actions {
	margin-top: 1em;
}
</style>

<svelte:window on:keyup={keyup}/>

<div id="anchor" class:hide={!showing}>
	<div id="main">
		<div
			id="box"
			bind:this={box}
			style={inlineStyle(css)}
		>
			<slot/>
		</div>
	</div>
</div>
