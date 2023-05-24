'use strict';

import { broadcast } from 'n-ui-foundations';
import oViewport from '@financial-times/o-viewport';
import Superstore from 'superstore';

import { TRACKING } from './config';

import { toElement } from './util';
import { getAllItemsForID, getItemByHTMLElement } from './data-store';
import { getMessage, getAdditionalMessages } from './messages';

const MAX_LOCAL_FORMAT_TIME_MS = 300000;
const localStore = new Superstore('local', 'syndication');
const isDownloadPage = location.pathname.includes('/download');
const isSavePage = location.pathname.includes('/save');

let OVERLAY_FRAGMENT;
let OVERLAY_MODAL_ELEMENT;
let OVERLAY_SHADOW_ELEMENT;
let DOWNLOAD_FORMAT;
let USER_DATA;

function init (user) {
	addEventListener('click', exports.actionModalFromClick, true);

	addEventListener('keyup',exports.actionModalFromKeyboard, true);
	addEventListener('resize', reposition, true);

	oViewport.listenTo('resize');

	USER_DATA = user;
}

function actionModalFromClick (evt) {
	const item = getItemByHTMLElement(evt.target);


	let fire = true;

	const trackingEvent = {};

	trackingEvent.category = TRACKING.CATEGORY;
	trackingEvent.contractID = USER_DATA.contract_id;
	trackingEvent.product = TRACKING.CATEGORY;
	trackingEvent.url = location.href;
	trackingEvent.action = evt.target.getAttribute('data-trackable');

	if (item) {
		trackingEvent.lang = item.lang;
		trackingEvent.message = item.messageCode;
		trackingEvent.article_id = item['id'];
		trackingEvent.syndication_content = item.type;
	}

	if (
		evt.target.matches(
			'[data-content-id][data-syndicated="true"].n-syndication-icon'
		)
	) {
		exports.show(evt);
	} else if (
		evt.target.matches(
			'[data-content-id][data-syndicated="true"].download-button'
		)
	) {
		evt.preventDefault();

		exports.show(evt);
	} else if (evt.target.matches('.n-syndication-action[data-action="save"]')) {
		exports.save(evt);

		exports.hide();

		exports.show(evt);

		exports.delayHide();
	} else if (
		evt.target.matches('.n-syndication-action[data-action="download"]')
	) {
		exports.download(evt);
		exports.delayHide();
	} else {
		if (exports.visible()) {
			const action = evt.target.getAttribute('data-action');

			if (
				evt.target.matches('.n-syndication-modal-shadow') ||
				(action && action === 'close')
			) {
				evt.preventDefault();

				exports.delayHide();
			}
		} else {
			fire = false;
		}
	}

	!fire || broadcast('oTracking.event', trackingEvent);
}

function actionModalFromKeyboard (evt) {
	switch (evt.key) {
		case 'Escape':
			module.exports.hide();

			const trackingEvent = {};

			trackingEvent.category = TRACKING.CATEGORY;
			trackingEvent.contractID = USER_DATA.contract_id;
			trackingEvent.product = TRACKING.CATEGORY;
			trackingEvent.url = location.href;
			trackingEvent.action = 'close-syndication-modal';

			broadcast('oTracking.event', trackingEvent);

			break;
		case ' ':
		case 'Enter':
			if (
				evt.target.matches(
					'[data-content-id][data-syndicated="true"].n-syndication-icon'
				)
			) {
				module.exports.show(evt);
			}
			break;
	}
}

function isDownloadDisabled (item) {
	return [
		USER_DATA.MAINTENANCE_MODE === true,
		item.type === 'package',
		item.notAvailable === true,
		item.canBeSyndicated === 'verify',
		item.canBeSyndicated === 'withContributorPayment' &&
		USER_DATA.contributor_content !== true,
		item.canBeSyndicated === 'no',
		!item.canBeSyndicated,
		item.canDownload < 1,
	].includes(true);
}

function isSaveDisabled (item) {
	return [
		item.saved === true,
		USER_DATA.MAINTENANCE_MODE === true,
		item.type === 'package',
		item.notAvailable !== true && item.canBeSyndicated === 'no',
		item.notAvailable !== true && !item.canBeSyndicated,
	].includes(true);
}

function createElement (item) {
	try {
		const disableDownloadButton = exports.isDownloadDisabled(item);
		const disableSaveButton = exports.isSaveDisabled(item);
		const downloadHref = disableDownloadButton
			? '#'
			: generateDownloadURI(item.id, item);
		const downloadText = disableDownloadButton
			? 'Download unavailable'
			: 'Download';
		const saveHref = disableSaveButton
			? '#'
			: generateSaveURI(item['id'], item);
		const saveTrackingId = isDownloadPage
			? 'save-for-later'
			: 'save-for-later-downloads-page';
		const title = USER_DATA.MAINTENANCE_MODE === true ? '' : item.title;
		let downloadTrackingId;
		let saveText;

		if (item.saved === true) {
			saveText = 'Already saved';
		} else {
			saveText = disableSaveButton ? 'Save unavailable' : 'Save for later';
		}

		if (isDownloadPage) {
			downloadTrackingId = 'redownload';
		} else if (!isSavePage) {
			downloadTrackingId = 'download-items';
		}

		return toElement(`<div class="n-syndication-modal-shadow"></div>
							<div class="n-syndication-modal n-syndication-modal-${item.type
}" role="dialog" aria-labelledby="'Download:  ${title}" tabindex="0">
								<header class="n-syndication-modal-heading">
									<a class="n-syndication-modal-close" data-action="close" 'data-trackable="close-syndication-modal" role="button" href="#" aria-label="Close" title="Close" tabindex="0"></a>
									<span role="heading" class="n-syndication-modal-title">${title}</span>
								</header>
								<section class=" n-syndication-modal-content">
									${item.wordCount
		? `<span class="n-syndication-modal-word-count">Word count: ${item.wordCount}</span>`
		: ''
}
									<div class="n-syndication-modal-message">
									${getMessage(item, USER_DATA)}
									</div>
									${getAdditionalMessages(item, USER_DATA)}
									<div class="n-syndication-actions" data-content-id="${item.id
}" data-iso-lang="${item.lang}">
										<a class="n-syndication-action" data-action="save" ${disableSaveButton ? 'disabled' : ''
} data-trackable="${saveTrackingId}" href="${saveHref}">${saveText}</a>
										<a class="n-syndication-action n-syndication-action-primary" data-action="download" ${disableDownloadButton ? 'disabled' : ''
} ${downloadTrackingId ? `data-trackable="${downloadTrackingId}"` : ''
} href="${downloadHref}">${downloadText}</a>
									</div>
								</section>
							</div>`);
	} catch (error) {
		broadcast('oErrors.log', {
			error: error,
			info: {
				component: 'next-syndication-redux',
			},
		});
	}
}

function delayHide (ms = 500) {
	let tid = setTimeout(() => {
		clearTimeout(tid);
		tid = null;

		module.exports.hide();
	}, ms);
}

function download (evt) {
	const item = getItemByHTMLElement(evt.target);
	const items = getAllItemsForID(item.id);

	items.forEach((item) => {
		item.downloaded = true;
		item.messageCode = 'MSG_2100';
	});

	broadcast('nSyndication.downloadItem', {
		item: item,
	});
}

function generateDownloadURI (contentID, item) {
	let uri = `${location.port ? '' : 'https://dl.syndication.ft.com'
	}/syndication/download/${contentID}${DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}

function generateSaveURI (contentID, item) {
	let uri = `/syndication/save/${contentID}${DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}

function hide () {
	if (module.exports.visible()) {
		OVERLAY_MODAL_ELEMENT.remove();

		OVERLAY_SHADOW_ELEMENT.remove();

		OVERLAY_FRAGMENT = null;
		OVERLAY_MODAL_ELEMENT = null;
		OVERLAY_SHADOW_ELEMENT = null;
	}
}

function reposition () {
	if (!module.exports.visible()) {
		return;
	}

	const DOC_EL = document.documentElement;

	let x = DOC_EL.clientWidth / 2 - OVERLAY_MODAL_ELEMENT.clientWidth / 2;
	let y = Math.max(
		DOC_EL.clientHeight / 3 - OVERLAY_MODAL_ELEMENT.clientHeight / 2,
		100
	);

	OVERLAY_MODAL_ELEMENT.style.left = `${x}px`;
	OVERLAY_MODAL_ELEMENT.style.top = `${y}px`;
}

function save (evt) {
	const item = getItemByHTMLElement(evt.target);
	const items = getAllItemsForID(item.id);

	items.forEach((item) => (item.saved = true));
}

function shouldPreventDefault (el) {
	while (el) {
		if (el.tagName && el.tagName.toUpperCase() === 'A') {
			return true;
		}
		el = el.parentElement;
	}
	return false;
}
function show (evt) {
	try {
		if (module.exports.visible()) {
			module.exports.hide();
		}

		if (shouldPreventDefault(evt.target.parentElement)) {
			evt.preventDefault();
		}

		localStore.get('download_format').then((val) => {
			if (val) {
				if (Date.now() - val.time <= MAX_LOCAL_FORMAT_TIME_MS) {
					DOWNLOAD_FORMAT = `?format=${val.format}`;
				} else {
					DOWNLOAD_FORMAT = '';
				}
			} else {
				DOWNLOAD_FORMAT = '';
			}

			OVERLAY_FRAGMENT = createElement(getItemByHTMLElement(evt.target));

			OVERLAY_MODAL_ELEMENT =
				OVERLAY_FRAGMENT.lastElementChild || OVERLAY_FRAGMENT.lastChild;
			OVERLAY_SHADOW_ELEMENT =
				OVERLAY_FRAGMENT.firstElementChild || OVERLAY_FRAGMENT.firstChild;

			document.body.appendChild(OVERLAY_FRAGMENT);

			reposition();
		});
	} catch (error) { }
}

function visible () {
	return !!(
		OVERLAY_MODAL_ELEMENT && document.body.contains(OVERLAY_MODAL_ELEMENT)
	);
}


module.exports = exports = {
	init,
	actionModalFromKeyboard,
	isDownloadDisabled,
	actionModalFromClick,
	USER_DATA,
	OVERLAY_FRAGMENT,
	OVERLAY_SHADOW_ELEMENT,
	OVERLAY_MODAL_ELEMENT,
	hide,
	show,
	save,
	delayHide,
	visible,
	createElement,
	reposition,
	isSaveDisabled,
	download
};
