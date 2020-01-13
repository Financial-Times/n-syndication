'use strict';

function cheapClone (item) {
	return JSON.parse(JSON.stringify(item));
}

function getContentAttributeFromHTMLElement (el, attrName = 'data-content-id') {
	do {
		if (el === document.documentElement) {
			return null;
		}

		const attrValue = el.getAttribute(attrName);

		if (attrValue) {
			return attrValue;
		}
	} while (el = el.parentElement);

	return null;
}

function getContentIDFromHTMLElement (el) {
	do {
		if (el === document.documentElement) {
			return null;
		}

		//		if (el.hasAttribute(ATTR_CONTENT_ID)) {
		let id = el.getAttribute('data-content-id');

		// there is a case where an item has a `data-content-id` with no value.
		// I can't figure it out right now, so temporary "fix"...
		if (!id && !el.classList.contains('o-header__subnav-item')) {
			id = el.getAttribute('data-id');

			if (!id) {
				let anchorEl = el;

				if (el.tagName.toUpperCase() !== 'A') {
					anchorEl = anchorEl.querySelector('a');
				}

				if (anchorEl && anchorEl.hasAttribute('href')) {
					id = anchorEl.getAttribute('href').split('/').pop();

					id = getContentIDFromHref(id);

					if (id) {
						el.setAttribute('data-content-id', id);
					}
				}
			}
		}

		if (id) {
			id = getContentIDFromHref(id);

			el.setAttribute('data-content-id', id);
		}

		return id || null;
		//		}
	} while (el = el.parentElement);

	return null;
}

function getContentIDFromHref (id) {
	if (id.indexOf('#') > -1) {
		id = id.substring(0, id.indexOf('#'));
	}

	if (id.indexOf('?') > -1) {
		id = id.substring(0, id.indexOf('?'));
	}

	return id;
}

function prepend (parent, element) {
	if (parent.prepend) {
		parent.prepend(element);
	} else {
		if (parent.childNodes.length) {
			parent.insertBefore(element, parent.childNodes[0]);
		} else {
			parent.appendChild(element);
		}
	}

	return parent;
}

function toElement (html) {
	const frag = document.createDocumentFragment();

	const ct = document.createElement('div');

	ct.insertAdjacentHTML('afterbegin', html);

	Array.from(ct.children).reverse().forEach(el => prepend(frag, el));

	return frag;
}

function interpolate (str, o) {
	return String(str).replace(/\{\{([^\}]+)\}\}/gim, (m, p) => p in o ? o[p] : '');
}

export {
	interpolate,
	cheapClone,
	getContentAttributeFromHTMLElement,
	getContentIDFromHTMLElement,
	prepend,
	toElement
};
