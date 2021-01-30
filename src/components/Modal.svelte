<script>
import {createEventDispatcher, onMount} from "svelte";
import sleep from "../utils/sleep";
import inlineStyle from "../utils/dom/inlineStyle";
import bodyClick from "../utils/dom/bodyClick";

export let css = null;

let fire = createEventDispatcher();

let box;
let show = false;
let teardown;

export async function open() {
	show = true;
	
	await sleep();
	
	teardown = bodyClick.on(close, [box]);
}

export function close() {
	show = false;
	
	teardown();
	
	teardown = null;
	
	fire("close");
}

function keyup({key}) {
	if (key === "Escape") {
		close();
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
	max-height: 85vh;
	padding: 3em 0 2em;
}

#box {
	width: 72%;
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

<div id="anchor" class:hide={!show}>
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
