import navigate from "./navigate";
import {shouldNavigate, hostMatches} from "./utils";

/*
A link action that can be added to <a href=""> tags rather
than using the <Link> component.

Example: <a href="/post/{postId}" use:link>{post.title}</a>
*/

function link(node) {
	function onClick(event) {
		let anchor = event.currentTarget;

		if (
			anchor.target === ""
			&& hostMatches(anchor)
			&& shouldNavigate(event)
		) {
			event.preventDefault();
			
			navigate(anchor.pathname + anchor.search, {
				replace: anchor.hasAttribute("replace"),
			});
		}
	}

	node.addEventListener("click", onClick);

	return {
		destroy() {
			node.removeEventListener("click", onClick);
		},
	};
}

/*
An action to be added at a root element of your application to
capture all relative links and push them onto the history stack.

Example:

<div use:links>
	 <Router>
		 <Route path="/" component={Home} />
		 <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
		 {#each projects as project}
			 <a href="/p/{project.id}">{project.title}</a>
		 {/each}
	 </Router>
</div>
*/

function links(node) {
	function findClosest(tagName, el) {
		while (el && el.tagName !== tagName) {
			el = el.parentNode;
		}
		
		return el;
	}

	function onClick(event) {
		let anchor = findClosest("A", event.target);

		if (
			anchor
			&& anchor.target === ""
			&& hostMatches(anchor)
			&& shouldNavigate(event)
			&& !anchor.hasAttribute("noroute")
		) {
			event.preventDefault();
			
			navigate(anchor.pathname + anchor.search, {
				replace: anchor.hasAttribute("replace"),
			});
		}
	}

	node.addEventListener("click", onClick);

	return {
		destroy() {
			node.removeEventListener("click", onClick);
		},
	};
}

export {link, links};
