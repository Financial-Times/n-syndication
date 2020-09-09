'use strict';

import {$$, broadcast} from 'n-ui-foundations';

import {DATA_STORE, fetchItems} from './data-store';
import {getMessage} from './config';
import {getContentIDFromHTMLElement, prepend, toElement} from './util';

const SYNDICATION_INSERTION_RULES = {
	['a.card__concept-article-link']: {fn: 'closest', slc: '.card__concept-article'},
	['a.topic-card__concept-article-link']: {fn: 'closest', slc: '.topic-card__concept-article'},
	['a.package__content-item']: {fn: 'querySelector', slc: '.package__title'},
	['.story__link']: {fn: 'closest', slc: 'article[data-trackable="story"]'},
	// matcher for n-teaser
	'a': {fn: 'closest', slc: '.o-teaser__heading'},
	// matcher for x-teaser
	'.o-teaser': {fn: 'querySelector', slc: '.o-teaser__heading'},
	'.stream-item': {fn: 'querySelector', slc: '.card-openable__headline'},
	'article[class="article"]': {fn: 'querySelector', slc: '.o-topper__headline'},
	'article.article--brand': {fn: 'querySelector', slc: '.o-topper__headline'},
	'article.article-grid': {fn: 'querySelector', slc: '.o-topper__headline', up: 1},
	'div.hero': {fn: 'querySelector', slc: '.hero__heading'},
	'main.video': {fn: 'querySelector', slc: '.video__title'},
	'li.o-teaser__related-item': {}
};
let USER_DATA;

function init (user) {
	USER_DATA = user;
	addEventListener('asyncContentLoaded', () => syndicate(), true);
	addEventListener('nSyndication.dataChanged', () => updatePage(), true);

	return syndicate();
}

function createElement (item) {
	const {messageCode, lang = 'en', id, type} = item;
	const stateClass = `n-syndication-icon-state-${messageCode}`.toLowerCase();
	const template = `<button
							class="n-syndication-icon ${stateClass}"
							data-content-id="${id}"
							data-iso-lang="${lang}"
							data-content-type="${type}"
							data-syndicated="true"
							data-trackable="syn-icon"
							data-message-code="${messageCode}"
							type="button">
							<span class="o-normalise-visually-hidden">${getMessage(item, USER_DATA)}</span>
						</button>`;
	return toElement(template);
}

function findElementToSyndicate (element) {
	const elementIsNotFormOrButton =
		element.tagName.toUpperCase() !== 'FORM'
		&& element.tagName.toUpperCase() !== 'BUTTON';

	if (element !== document.documentElement && elementIsNotFormOrButton) {
		const entries = Object.entries(SYNDICATION_INSERTION_RULES);

		for (let [match, rule] of entries) {
			if (element.matches(match)) {
				// in the case where the element to insert the syndication icon is a sibling of the element
				// that contains the content ID, rather than a ancestor or descendant of the element
				// we can use the `up` property to start the search from a `parentElement` of the source element
				if (typeof rule.up === 'number' && rule.up === rule.up) {
					let i = -1;

					while (++i < rule.up) {
						element = element.parentElement;
					}
				}

				if (!rule.fn && !rule.slc) {
					return element;
				}

				const targetElement = element[rule.fn](rule.slc);

				if (targetElement) {
					return targetElement;
				}
			}
		}
	}

	return null;
}

function getSyndicatableItems () {
	return $$([
		'[data-content-id]',
		'[data-id]',
		'a.card__concept-article-link',
		'a.topic-card__concept-article-link',
		'a.package__content-item',
		'.story__link'
	].join(', '));
}

function getSyndicatableItemIDs (items) {
	// Save time by sending only distinct content IDs
	const IDs = Array.from(items).reduce((acc, el) => {
		const ID = getContentIDFromHTMLElement(el);

		if (ID) {
			acc[ID] = ID;
		}

		return acc;
	}, {});

	return Object.keys(IDs);
}

function syndicate () {
	const ELEMENTS = getSyndicatableItems();

	const ITEM_IDS = getSyndicatableItemIDs(ELEMENTS);

	return fetchItems(ITEM_IDS);
}

function syndicateElement (item, el) {
	const element = findElementToSyndicate(el);

	if (element !== null && element.getAttribute('data-syndicated') !== 'true') {
		element.classList.add('n-syndication');
		element.classList.add(`n-syndication-state-${item.canBeSyndicated}`);

		prepend(element, createElement(item));

		element.setAttribute('data-content-type', item.type);
		element.setAttribute('data-syndicated', 'true');
	}

	if (element !== el) {
		el.setAttribute('data-content-type', item.type);
		el.setAttribute('data-syndicated', 'true');
	}
}

function syndicateElements (item, els) {
	if (!els.length) {
		return;
	}

	els.forEach(el => syndicateElement(item, el));
}

function updatePage (els) {
	if (!Array.isArray(els)) {
		els = getSyndicatableItems();
	}

	const elementsByContentID = Array.from(els).reduce((acc, el) => {
		const contentID = el.getAttribute('data-content-id');

		if (!Array.isArray(acc[contentID])) {
			acc[contentID] = [];
		}

		acc[contentID].push(el);

		return acc;
	}, {});

	DATA_STORE.forEach(item => syndicateElements(item, elementsByContentID[item['id']]));

	broadcast('nSyndication.iconified');
}

export {
	init
};
