<script>
import {getContext, createEventDispatcher} from "svelte";
import location from "../../stores/location";
import navigate from "./navigate";
import {startsWith, resolve, shouldNavigate} from "./utils";

export let to = "#";
export let replace = false;
export let component = null;

let {base} = getContext("Router");
let dispatch = createEventDispatcher();

let href, isPartiallyCurrent, isCurrent, props;

$: href = to === "/" ? $base.uri : resolve(to, $base.uri);
$: isPartiallyCurrent = startsWith($location.pathname, href);
$: isCurrent = href === $location.pathname;
$: ariaCurrent = isCurrent ? "page" : undefined;

$: props = {
	location: $location,
	href,
	isPartiallyCurrent,
	isCurrent,
};

function onClick(event) {
	dispatch("click", event);
	
	if (shouldNavigate(event) && to[0] !== "/") {
		event.preventDefault();
		
		// Don't push another entry to the history stack when the user
		// clicks on a Link to the page they are currently on.
		let shouldReplace = $location.pathname === href || replace;
		
		navigate(href, shouldReplace);
	}
}
</script>

{#if component}
	<svelte:component
		this={component}
		{...props}
		{...$$restProps}
		on:click={onClick}
	>
		<slot/>
	</svelte:component>
{:else}
	<a {href} aria-current={ariaCurrent} on:click={onClick}>
		<slot/>
	</a>
{/if}
