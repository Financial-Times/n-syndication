'use strict';

import {broadcast} from 'n-ui-foundations';

import {getContentAttributeFromHTMLElement, getContentIDFromHTMLElement} from './util';

const DATA_STORE = [];
const DATA_STORE_MAP = {};
const DATA_HIDDEN_ID_PROPERTY = '__id__';

let USER_DATA;

function init (user, data = null) {
	USER_DATA = user;

	addEventListener('nSyndication.fetch', evt => refresh(evt.detail.response), true);

	if (Object.prototype.toString.call(data) === '[object Array]') {
		refresh(data);
	}
}

async function fetchItems (itemIDs) {
	if (USER_DATA.MAINTENANCE_MODE === true) {
		const fakeRes = itemIDs.map(id => {
			return {
				id,
				canBeSyndicated: 'maintenance',
				messageCode: 'MSG_5100'
			};
		});

		broadcast('nSyndication.fetch', {
			request: itemIDs,
			response: fakeRes
		});

		return Promise.resolve(fakeRes);
	}

	const options = {
		credentials: 'include',
		headers: {'content-type': 'application/json'},
		method: 'POST',
		body: JSON.stringify(itemIDs)
	};

	if(options.body.length) {

		try {
			const response = await fetch(`/syndication/resolve${location.search}`, options);

			if (!response.ok) {
				const text = await response.text();
				throw new Error(`Next /syndication/resolve responded with "${text}" (${response.status})`);
			}

			const items = await response.json();

			broadcast('nSyndication.fetch', {
				request: itemIDs,
				response: items
			});

			return items;

		} catch (error) {
			broadcast('oErrors.log', {
				error,
				info: {
					component: 'next-syndication-redux'
				}
			});
		}

	}
}

function getItemByHTMLElement (el) {
	const id = getContentIDFromHTMLElement(el);
	const lang = getContentAttributeFromHTMLElement(el, 'data-iso-lang') || 'en';

	return getItemByID(id, lang);
}

function getAllItemsForID (id) {
	return DATA_STORE.filter(item => item['id'] === id);
}

function getItemByID (id, lang = 'en') {
	const _id = `${id}__${lang}`;

	return DATA_STORE_MAP[_id] || DATA_STORE_MAP[id] || DATA_STORE.find(item => matches(item, id, lang)) || null;
}

function getItemIndex (item) {
	let id;
	let lang;

	switch (Object.prototype.toString.call(item)) {
		case '[object Object]' :
			id = item['id'];
			lang = item['lang'] || 'en';

		// allow fall-through
		case '[object String]' :
			return DATA_STORE.findIndex(item => matches(item, id, lang));
	}

	return -1;
}

function getUserData () {
	return USER_DATA;
}

function matches (item, id, lang) {
	const _id = `${id}__${lang}`;

	return item[DATA_HIDDEN_ID_PROPERTY] === _id || (item['id'] === id && item['lang'] === lang);
}

function refresh (data) {
	const EXISTING = [];

	data.forEach(item => {
		const id = item['id'];
		const lang = item['lang'] || 'en';

		const _id = item[DATA_HIDDEN_ID_PROPERTY] = `${id}__${lang}`;

		if (_id in DATA_STORE_MAP) {
			EXISTING.push(item);

			const existingIndex = DATA_STORE.findIndex(storeItem => matches(storeItem, id, lang));

			if (existingIndex > -1) {
				DATA_STORE[existingIndex] = item;
			}
		}

		if (!EXISTING.includes(item)) {
			DATA_STORE.push(item);
		}

		// replace with new content things may have changed
		DATA_STORE_MAP[_id] = item;
	});

	broadcast('nSyndication.dataChanged', {
		existing: EXISTING,
		items: DATA_STORE
	});

	return {
		DATA_STORE,
		DATA_STORE_MAP,
		EXISTING
	};
}

export {
	DATA_STORE,
	DATA_STORE_MAP,
	fetchItems,
	getAllItemsForID,
	getItemByHTMLElement,
	getItemByID,
	getItemIndex,
	getUserData,
	init,
	refresh
};
