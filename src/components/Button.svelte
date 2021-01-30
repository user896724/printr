<script>
import {createEventDispatcher, getContext} from "svelte";
import bodyClick from "../utils/dom/bodyClick";
import inlineStyle from "../utils/dom/inlineStyle";

export let label = null;
export let title = null;
export let href = null;
export let style = "default";
export let primary = false;
export let flat = false;
export let notab = false;
export let nofocus = false;
export let css = null;
export let type = "button";
export let name = "";
export let value = label;
export let arrow = false;
export let down = false;
export let stopPropagation = false;
export let glyph = null;
export let circle = null;
export let icon = null;
export let leftIcon = null;
export let rightIcon = null;
export let iconWidth = null;
export let iconHeight = null;
export let iconOpacity = null;
export let disabled = false;
export let _id = bodyClick.id();

export function blur() {
	button.blur();
}

let fire = createEventDispatcher();

let form = getContext("Form");

let button;
let calculatedCss;

function click(e) {
	bodyClick.add(_id);
	
	fire("click", e);
	
	if (form && type === "submit") {
		form.submit();
	}
	
	if (stopPropagation) {
		e.stopPropagation();
	}
}

function mousedown(e) {
	if (nofocus) {
		e.preventDefault();
	}
}

$: circleStyle = circle ? {
	width: circle,
	height: circle,
	borderRadius: 100,
} : null;

$: if (icon) {
	leftIcon = icon;
}

$: hasIcon = leftIcon || rightIcon;

/*
TODO something better for opacity?  white ones look better more opaque
*/

function getIconOpacity(icon, disabled) {
	return {
		opacity: iconOpacity || disabled ? .3 : (icon.match(/\/white\//) ? .95 : .75),
	};
}
</script>

<svelte:options accessors/>

<style>
#button {
	font-family: inherit;
	font-size: 1em;
	letter-spacing: normal;
	text-decoration: none;
	color: var(--color, #333333);
	position: relative;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	border: var(--border, none);
	border-radius: var(--borderRadius, 3px);
	padding: var(--padding, 7px 15px);
	box-shadow: var(--shadow, none);
	cursor: pointer;
	background: var(--background, #e8e7e6);
	
	&.leftIcon .label {
		margin-left: .5em;
	}
	
	&.rightIcon .label {
		margin-right: .5em;
	}
	
	&.flat {
		border: 0;
	}
	
	&.link {
		text-decoration: underline;
		border: 0;
		padding: 0;
		box-shadow: none;
		background: transparent;
	}
	
	&.link:active, .link:focus {
		box-shadow: none;
	}
	
	&.disabled {
		color: var(--disabledColor, gray);
		border-color: var(--disabledBorderColor, #d2d2d2) !important;
		box-shadow: var(--disabledShadow, none) !important;
		cursor: default;
		background: var(--disabledBackground, #e8e7e6);
	}
	
	&.small {
		padding: 0 5px;
	}

	&.icon {
		padding: 0;
		
		&.nofocus:active {
			box-shadow: none;
		}
	}
	
	&.down, &:active {
		background: var(--activeBackground, linear-gradient(#e4e2e2, #F4F4F4));
	}
	
	&.large {
		&:active {
			box-shadow: var(--activeShadow, none);
		}
	}
	
	&.icon {
		&.focusable:active {
			box-shadow: var(--activeShadow, none);
		}
	}
	
	&.clear {
		border: 0;
		background: transparent;
	}
	
	span.glyph {
		line-height: 0;
	}
	
	span.arrow {
		margin-left: .25rem;
	}
}
</style>

{#if href}
	<a
		id="button"
		class="theme_button {style}"
		class:primary
		class:secondary={!primary}
		class:hasIcon
		class:leftIcon
		class:rightIcon
		class:flat
		class:threed={!flat}
		class:disabled
		style={inlineStyle(circleStyle, css)}
		{href}
		{title}
		on:click={click}
		tabindex={notab ? -1 : ""}
	>
		{#if leftIcon}
			<img
				src={leftIcon}
				width={iconWidth}
				height={iconHeight}
				style={inlineStyle(getIconOpacity(leftIcon, disabled))}
			>
		{/if}
		{#if label}
			<span class="label">
				{@html label}
			</span>
		{/if}
		{#if rightIcon}
			<img
				src={rightIcon}
				width={iconWidth}
				height={iconHeight}
				style={inlineStyle(getIconOpacity(rightIcon, disabled))}
			>
		{/if}
	</a>
{:else}
	<button
		id="button"
		bind:this={button}
		class="theme_button {style}"
		class:primary
		class:secondary={!primary}
		class:hasIcon
		class:leftIcon
		class:rightIcon
		class:flat
		class:threed={!flat}
		class:disabled
		class:down
		class:nofocus
		class:focusable={!nofocus}
		style={inlineStyle(circleStyle, css)}
		{type}
		{name}
		{value}
		{title}
		on:click={click}
		on:mousedown={mousedown}
		tabindex={notab ? -1 : ""}
		{disabled}
	>
		{#if leftIcon}
			<img
				src={leftIcon}
				width={iconWidth}
				height={iconHeight}
				style={inlineStyle(getIconOpacity(leftIcon, disabled))}
			>
		{/if}
		{#if label}
			<span class="label">
				{@html label}
			</span>
		{/if}
		{#if rightIcon}
			<img
				src={rightIcon}
				width={iconWidth}
				height={iconHeight}
				style={inlineStyle(getIconOpacity(rightIcon, disabled))}
			>
		{/if}
		{#if glyph}
			<span class="glyph">
				{@html glyph}
			</span>
		{/if}
		{#if arrow}
			<span class="glyph arrow">
				&#9207;
			</span>
		{/if}
	</button>
{/if}
