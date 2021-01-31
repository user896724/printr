<script>
import {onMount, createEventDispatcher} from "svelte";
import bodyClick from "../utils/dom/bodyClick";
import inlineStyle from "../utils/dom/inlineStyle";
import lid from "../utils/lid";

export let label = null;
export let name = "";
export let value = "";
export let type = "text";
export let editing;
export let disabled = false;
export let readonly = false;
export let placeholder = "";
export let grow = false;
export let growVertical = false;
export let table = false;
export let css = null;
export let inputCss = {};
export let labelCss = {};
export let rows = 5;
export let required = false;
export let autofocus = false;
export let newPassword = false;
export let nosubmit = false;
export let inline = false;
export let block = false;
export let _id = bodyClick.id();

export function focus() {
	input.focus();
}

export function blur() {
	input.blur();
}

let fire = createEventDispatcher();

let textValue;
let id = lid();
let input;
let lastValue = value;

editing = false;

$: ac = newPassword ? "new-password" : "";

function keyup(e) {
	fire("keyup", e);
	
	if (value !== lastValue) {
		fire("change");
		
		lastValue = value;
	}
}

function change() {
	if (value !== lastValue) {
		fire("change");
		
		lastValue = value;
	}
}

function click(e) {
	bodyClick.add(_id);
	
	fire("click", e);
}

function onFocus(e) {
	editing = true;
	
	fire("focus", input);
	fire("startEditing");
}

function onBlur() {
	editing = false;
	
	fire("stopEditing");
	fire("blur");
}

onMount(function() {
	if (autofocus) {
		input.focus();
	}
});
</script>

<svelte:options accessors/>

<style>
@import "../../css/mixins/flex-col";
@import "../../css/selectors/inputs";

#wrapper {
	&.growVertical {
		flex-grow: 1;
	}
}

#main {
	&.grow, &.table {
		@include flex-col;
	}
	
	&.inline {
		display: flex;
		flex-direction: row;
		align-items: center;
		
		label {
			align-self: auto;
			margin-right: .5rem;
			margin-bottom: 0;
		}
	}
	
	.growVertical & {
		height: 100%;
	}
}

label {
	display: inline-block;
	align-self: flex-start;
	margin-bottom: .2em;
}

#input {
	display: flex;
	align-items: center;
	
	.growVertical & {
		height: 100%;
	}
}

.textarea {
	display: flex;
	
	.grow & {
		flex-grow: 1;
	}
}

textarea {
	flex-grow: 1;
	display: block;
}

#{$inputs}, textarea {
	font-family: inherit;
	font-size: inherit;
	border: 1px solid #556979;
	border-radius: 2px;
	padding: 5px;
	background: white;
	
	&.editing {
		box-shadow: var(--focusShadow);
	}
	
	&.disabled {
		background: var(--inputBackgroundDisabled);
	}
	
	.grow & {
		width: 100%;
	}
	
	.growVertical & {
		height: 100%;
	}
	
	.table & {
		flex-grow: 1;
		border: 0;
		border-radius: 0;
		background: transparent;
	}
}
</style>

<div
	id="wrapper"
	style={inlineStyle(css)}
	class:growVertical
>
	<div
		id="main"
		class:inline
		class:grow
		class:table
	>
		{#if label}
			<label for={id} style={inlineStyle(labelCss)}>
				{label}
			</label>
		{/if}
		<div id="input">
			<slot name="labelBefore"/>
			<!-- type can't be dynamic with 2 way binding on value -->
			{#if type === "text"}
				<input
					{id}
					class:editing
					class:disabled
					bind:this={input}
					style={inlineStyle(inputCss)}
					{name}
					bind:value
					on:keydown
					on:keypress
					on:keyup={keyup}
					on:change={change}
					on:focus={onFocus}
					on:blur={onBlur}
					on:click={click}
					{required}
					{placeholder}
					{disabled}
					{readonly}
					autocomplete={ac}
					type="text"
					{...$$restProps}
				>
			{:else if type === "email"}
				<input
					{id}
					class:editing
					class:disabled
					bind:this={input}
					style={inlineStyle(inputCss)}
					{name}
					bind:value
					on:keydown
					on:keypress
					on:keyup={keyup}
					on:change={change}
					on:focus={onFocus}
					on:blur={onBlur}
					on:click={click}
					{required}
					{placeholder}
					{disabled}
					{readonly}
					autocomplete={ac}
					type="email"
					{...$$restProps}
				>
			{:else if type === "password"}
				<input
					{id}
					class:editing
					class:disabled
					bind:this={input}
					style={inlineStyle(inputCss)}
					{name}
					bind:value
					on:keydown
					on:keypress
					on:keyup={keyup}
					on:change={change}
					on:focus={onFocus}
					on:blur={onBlur}
					on:click={click}
					{required}
					{placeholder}
					{disabled}
					{readonly}
					autocomplete={ac}
					type="password"
					{...$$restProps}
				>
			{:else if type === "number"}
				<input
					{id}
					class:editing
					class:disabled
					bind:this={input}
					style={inlineStyle(inputCss)}
					{name}
					bind:value
					on:keydown
					on:keypress
					on:keyup={keyup}
					on:change={change}
					on:focus={onFocus}
					on:blur={onBlur}
					on:click={click}
					{required}
					{placeholder}
					{disabled}
					{readonly}
					type="number"
					{...$$restProps}
				>
			{:else if type === "area"}
				<div class="textarea">
					<textarea
						{id}
						class:editing
						class:disabled
						bind:this={input}
						{rows}
						style={inlineStyle(inputCss)}
						{name}
						bind:value
						on:keydown
						on:keypress
						on:keyup={keyup}
						on:change={change}
						on:focus={onFocus}
						on:blur={onBlur}
						on:click={click}
						{required}
						{disabled}
						{readonly}
						{...$$restProps}
					></textarea>
				</div>
			{:else if type === "hidden"}
				<input
					bind:this={input}
					{name}
					{value}
					type="hidden"
					{...$$restProps}
				>
			{/if}
			<slot name="labelAfter"/>
		</div>
	</div>
</div>
