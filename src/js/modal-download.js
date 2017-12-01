'use strict';

import { broadcast } from 'n-ui-foundations';
//import tracking from 'o-tracking';
import { listenTo } from 'o-viewport';
import Superstore from 'superstore';

import {
	ATTR_ACTION,
	ATTR_TRACKABLE,
	CSS_CLASS_PREFIX,
	CSS_SELECTOR_ACTION_DOWNLOAD,
	CSS_SELECTOR_ACTION_SAVE,
	CSS_SELECTOR_REPUBLISHING_BTN,
	CSS_SELECTOR_SYNDATION_ICON,
	DATA_ID_PROPERTY,
	DATA_LANG_PROPERTY,
	DEFAULT_LANGUAGE,
	EVENT_PREFIX,
	LABEL_ARIA_OVERLAY,
	MAX_LOCAL_FORMAT_TIME_MS,
	MESSAGES,
	MS_DELAY_HIDE,
	RE_INTERPOLATE,
	TRACKING,
	URI_PREFIX_DOWNLOAD,
	URI_PREFIX_SAVE
} from './config';

import { toElement } from './util';
import {
	getAllItemsForID,
	getItemByHTMLElement
} from './data-store';

const localStore = new Superstore('local', 'syndication');

let OVERLAY_FRAGMENT;
let OVERLAY_MODAL_ELEMENT;
let OVERLAY_SHADOW_ELEMENT;
let DOWNLOAD_FORMAT;
let USER_DATA;

function init (flags, user) {
	addEventListener('click', actionModalFromClick, true);

	addEventListener('keyup', actionModalFromKeyboard, true);
	addEventListener('resize', reposition, true);

	listenTo('resize');

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
	trackingEvent.action = evt.target.getAttribute(ATTR_TRACKABLE);

	if (item) {
		trackingEvent.lang = item.lang;
		trackingEvent.message = item.messageCode;
		trackingEvent.article_id = item[DATA_ID_PROPERTY];
		trackingEvent.syndication_content = item.type;
	}

	if (evt.target.matches(CSS_SELECTOR_SYNDATION_ICON)) {
		show(evt);
	}
	else if (evt.target.matches(CSS_SELECTOR_REPUBLISHING_BTN)) {
		evt.preventDefault();

		show(evt);
	}
	else if (evt.target.matches(CSS_SELECTOR_ACTION_SAVE)) {
		save(evt);

		hide();

		show(evt);

		delayHide();
	}
	else if (evt.target.matches(CSS_SELECTOR_ACTION_DOWNLOAD)) {
		download(evt);

		delayHide();
	}
	else {
		if (visible()) {
			const action = evt.target.getAttribute(ATTR_ACTION);

			if (evt.target.matches(`.${CSS_CLASS_PREFIX}-modal-shadow`) || (action && action === 'close')) {
				evt.preventDefault();

				delayHide();
			}
		}
		else {
			fire = false;
		}
	}

	!fire || broadcast('oTracking.event', trackingEvent);
}

function actionModalFromKeyboard (evt) {
	switch (evt.key) {
	case 'Escape' :
		hide();

		const trackingEvent = {};

		trackingEvent.category = TRACKING.CATEGORY;
		trackingEvent.contractID = USER_DATA.contract_id;
		trackingEvent.product = TRACKING.CATEGORY;
		trackingEvent.url = location.href;
		trackingEvent.action = 'close-syndication-modal';

		broadcast('oTracking.event', trackingEvent);

		break;
	case ' ' : case 'Enter' :
		if (evt.target.matches(CSS_SELECTOR_SYNDATION_ICON)) {
			show(evt);
		}

		break;
	}

}

function createElement (item) {
	let saveText = item.saved === true ? 'Already saved' : 'Save for later';
	let downloadButtonState = '';
	let downloadHref = generateDownloadURI(item[DATA_ID_PROPERTY], item);
	let downloadText = 'Download';
	let saveButtonState = item.saved === true ? 'disabled' : '';
	let saveHref = generateSaveURI(item[DATA_ID_PROPERTY], item);
	let message;
	let trackableValueDownloadItem = 'download-items';
	let trackableValueSaveForLater = 'save-for-later';
	let wordCount = '';
	let trackableAttributeForDownload = `${ATTR_TRACKABLE}`;

	if (item.embargoPeriod) {
		if (typeof item.embargoPeriod === 'number') {
			item.embargoPeriod = `${item.embargoPeriod} day${item.embargoPeriod > 1 ? 's' : ''}`;
		}

		item.embargoMessage = item.embargoPeriod ? interpolate(MESSAGES.EMBARGO, item) : '';
	}

	if (location.pathname.includes('/download')) {
		trackableValueDownloadItem = 'redownload';
		trackableValueSaveForLater += '-downloads-page';
	}
	else if (location.pathname.includes('/save')) {
		// trackableValueDownloadItem = 'download-saved-item';
		trackableValueDownloadItem = '';
	}

	if (USER_DATA.MAINTENANCE_MODE === true) {
		message = MESSAGES.MSG_5100;
		downloadButtonState = 'disabled';
		saveButtonState = 'disabled';
		item.title = '';
	}
	else if (item.type === 'package') {
		message = MESSAGES.MSG_4300;
		downloadButtonState = 'disabled';
		saveButtonState = 'disabled';
	}
	else if (item.notAvailable === true) {
		downloadButtonState = 'disabled';
		message = MESSAGES.MSG_4050;
	}
	else if (item.canBeSyndicated === 'verify') {
		downloadButtonState = 'disabled';
		message = item.lang !== DEFAULT_LANGUAGE ? MESSAGES.MSG_4250 : MESSAGES.MSG_2200;
	}
	else if (item.canBeSyndicated === 'withContributorPayment') {
		if (USER_DATA.contributor_content !== true) {
			downloadButtonState = 'disabled';
			message = MESSAGES.MSG_2300;
		}
		else if (item.downloaded === true) {
			message = MESSAGES.MSG_2340;
		}
		else {
			message = MESSAGES.MSG_2320;
		}
	}
	else if (item.canBeSyndicated === 'no' || !item.canBeSyndicated) {
		downloadButtonState = 'disabled';
		saveButtonState = 'disabled';
		message = MESSAGES.MSG_4000;
	}
	else if (item.downloaded === true) {
		message = MESSAGES.MSG_2100;
	}
	else if (item.canDownload < 1) {
		downloadButtonState = 'disabled';

		switch (item.canDownload) {
		case 0:
			message = item.lang !== DEFAULT_LANGUAGE ? MESSAGES.MSG_4250 : MESSAGES.MSG_4200;

			break;
		case -1:
			message = MESSAGES.MSG_4100;

			break;
		}
	}
	else {
		message = MESSAGES.MSG_2000;
	}

	message = interpolate(message, item);
	//	item.messageCode = message;

	if (downloadButtonState === 'disabled') {
		downloadHref = '#';
		downloadText += ' unavailable';
	}
	if (saveButtonState === 'disabled') {
		saveHref = '#';

		if (item.saved !== true) {
			saveText = 'Save unavailable';
		}
	}

	if (item.wordCount) {
		wordCount = `<span class="${CSS_CLASS_PREFIX}-modal-word-count">Word count: ${item.wordCount}</span>`;
	}

	if (trackableValueDownloadItem) {
		trackableAttributeForDownload = `${trackableAttributeForDownload}="${trackableValueDownloadItem}"`;
	}
	else {
		trackableAttributeForDownload = '';
	}

	let frag = toElement(`<div class="${CSS_CLASS_PREFIX}-modal-shadow"></div>
<div class="${CSS_CLASS_PREFIX}-modal ${CSS_CLASS_PREFIX}-modal-${item.type}" role="dialog" aria-labelledby="${LABEL_ARIA_OVERLAY} ${item.title}" tabindex="0">
	<header class="${CSS_CLASS_PREFIX}-modal-heading">
		<a class="${CSS_CLASS_PREFIX}-modal-close" data-action="close" ${ATTR_TRACKABLE}="close-syndication-modal" role="button" href="#" aria-label="Close" title="Close" tabindex="0"></a>
		<span role="heading" class="${CSS_CLASS_PREFIX}-modal-title">${item.title}</span>
	</header>
	<section class=" ${CSS_CLASS_PREFIX}-modal-content">
		${wordCount}
		<div class="${CSS_CLASS_PREFIX}-modal-message">
		${message}
		</div>
		<div class="${CSS_CLASS_PREFIX}-actions" data-content-id="${item[DATA_ID_PROPERTY]}" data-iso-lang="${item[DATA_LANG_PROPERTY]}">
			<a class="${CSS_CLASS_PREFIX}-action" data-action="save" ${saveButtonState} ${ATTR_TRACKABLE}="${trackableValueSaveForLater}" href="${saveHref}">${saveText}</a>
			<a class="${CSS_CLASS_PREFIX}-action ${CSS_CLASS_PREFIX}-action-primary" data-action="download" ${downloadButtonState} ${trackableAttributeForDownload} href="${downloadHref}">${downloadText}</a>
		</div>
	</section>
</div>`);

	return frag;
}

function delayHide (ms = MS_DELAY_HIDE) {
	let tid = setTimeout(() => {
		clearTimeout(tid);
		tid = null;

		hide();
	}, ms);
}

function download (evt) {
	const item = getItemByHTMLElement(evt.target);
	const items = getAllItemsForID(item.id);

	items.forEach(item => {
		item.downloaded = true;
		item.messageCode = 'MSG_2100';
	});

	broadcast(`${EVENT_PREFIX}.downloadItem`, {
		item: item
	});
}

function generateDownloadURI (contentID, item) {
	let uri = `${URI_PREFIX_DOWNLOAD}/${contentID}${DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}

function generateSaveURI (contentID, item) {
	let uri = `${URI_PREFIX_SAVE}/${contentID}${DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}

function hide () {
	if (visible()) {
		OVERLAY_MODAL_ELEMENT.remove();

		OVERLAY_SHADOW_ELEMENT.remove();

		OVERLAY_FRAGMENT = null;
		OVERLAY_MODAL_ELEMENT = null;
		OVERLAY_SHADOW_ELEMENT = null;
	}
}

function interpolate (str, o) {
	return String(str).replace(RE_INTERPOLATE, (m, p) => p in o ? o[p] : '');
}

function reposition () {
	if (!visible()) {
		return;
	}

	const DOC_EL = document.documentElement;

	let x = (DOC_EL.clientWidth / 2) - (OVERLAY_MODAL_ELEMENT.clientWidth / 2);
	let y = Math.max((DOC_EL.clientHeight / 3) - (OVERLAY_MODAL_ELEMENT.clientHeight / 2), 100);

	OVERLAY_MODAL_ELEMENT.style.left = `${x}px`;
	OVERLAY_MODAL_ELEMENT.style.top = `${y}px`;
}

function save (evt) {
	const item = getItemByHTMLElement(evt.target);
	const items = getAllItemsForID(item.id);

	items.forEach(item => item.saved = true);
}
function shouldPreventDefault (el) {
	do {
		if (el.tagName.toUpperCase() === 'A') {
			return true;
		}
	} while (el = el.parentElement);

	return false;
}

function show (evt) {
	if (visible()) {
		hide();
	}

	if (shouldPreventDefault(evt.target.parentElement)) {
		evt.preventDefault();
	}

	localStore.get('download_format').then(val => {
		if (val) {
			if (Date.now() - val.time <= MAX_LOCAL_FORMAT_TIME_MS) {
				DOWNLOAD_FORMAT = `?format=${val.format}`;
			}
			else {
				DOWNLOAD_FORMAT = '';
			}
		}
		else {
			DOWNLOAD_FORMAT = '';
		}

		OVERLAY_FRAGMENT = createElement(getItemByHTMLElement(evt.target));

		OVERLAY_MODAL_ELEMENT = OVERLAY_FRAGMENT.lastElementChild || OVERLAY_FRAGMENT.lastChild;
		OVERLAY_SHADOW_ELEMENT = OVERLAY_FRAGMENT.firstElementChild || OVERLAY_FRAGMENT.firstChild;

		document.body.appendChild(OVERLAY_FRAGMENT);

		reposition();
	});
}

function visible () {
	return !!(OVERLAY_MODAL_ELEMENT && document.body.contains(OVERLAY_MODAL_ELEMENT));
}

export {
	createElement,
	generateDownloadURI,
	generateSaveURI,
	hide,
	init,
	reposition,
	show,
	save,
	visible
};
