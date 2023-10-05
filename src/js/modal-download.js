/* eslint-disable no-console */
'use strict';

import { broadcast } from 'n-ui-foundations';
import oViewport from '@financial-times/o-viewport';
import Superstore from 'superstore';

import { TRACKING } from './config';

import { toElement } from './util';
import { getAllItemsForID, getItemByHTMLElement } from './data-store';
import { getMessage, getAdditionalMessages } from './messages';
import { createTrackingEvent, isCloseAction, isDownloadAction, isDownloadButton, isSaveAction, isSyndicationIcon } from './modal-utils';

import OverlayVisibilityManager from './modal-state-manager';

const overlayManager = new OverlayVisibilityManager();
const MAX_LOCAL_FORMAT_TIME_MS = 300000;
const localStore = new Superstore('local', 'syndication');
const isDownloadPage = location.pathname.includes('/download');
const isSavePage = location.pathname.includes('/save');

function init (user) {
	addEventListener('click', exports.actionModalFromClick, true);

	addEventListener('keyup', exports.actionModalFromKeyboard, true);
	addEventListener('resize', overlayManager.reposition, true);

	oViewport.listenTo('resize');

	overlayManager.USER_DATA = user;
}

function actionModalFromClick (evt) {
	try {
		const item = getItemByHTMLElement(evt.target);
		let fire = true;
		const trackingEvent = createTrackingEvent(evt, item, overlayManager);

		if (isSyndicationIcon(evt.target)) {
			exports.show(evt);
		} else if (isDownloadButton(evt.target)) {
			evt.preventDefault();
			exports.show(evt);
		} else if (isSaveAction(evt.target)) {
			exports.save(evt);
			overlayManager.hideOverlay();
			exports.show(evt);
			overlayManager.delayModalHide();
		} else if (isDownloadAction(evt.target)) {
			exports.download(evt);
			overlayManager.delayModalHide();
		} else {
			const isOverlayVisible = overlayManager.isOverlayVisible();
			if (isOverlayVisible && isCloseAction(evt.target)) {
				evt.preventDefault();
				overlayManager.delayModalHide();
			} else {
				fire = false;
			}
		}

		!fire || broadcast('oTracking.event', trackingEvent);
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

function actionModalFromKeyboard (evt) {
	switch (evt.key) {
		case 'Escape':
			overlayManager.hideOverlay();

			const trackingEvent = {};

			trackingEvent.category = TRACKING.CATEGORY;
			trackingEvent.contractID = overlayManager.USER_DATA.contract_id;
			trackingEvent.product = TRACKING.CATEGORY;
			trackingEvent.url = location.href;
			trackingEvent.action = 'close-syndication-modal';

			broadcast('oTracking.event', trackingEvent);

			break;
		case ' ':
		case 'Enter':
			if (isSyndicationIcon(evt.target)) {
				exports.show(evt);
			}
			break;
	}
}

function isDownloadDisabled (item) {
	return [
		overlayManager.USER_DATA.MAINTENANCE_MODE === true,
		item.type === 'package',
		item.notAvailable === true,
		item.canBeSyndicated === 'verify',
		item.canBeSyndicated === 'withContributorPayment' &&
		overlayManager.USER_DATA.contributor_content !== true,
		item.canBeSyndicated === 'no',
		!item.canBeSyndicated,
		item.canDownload < 1,
	].includes(true);
}

function isSaveDisabled (item) {
	return [
		item.saved === true,
		overlayManager.USER_DATA.MAINTENANCE_MODE === true,
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
		const title = overlayManager.USER_DATA.MAINTENANCE_MODE === true ? '' : item.title;
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
									${getMessage(item, overlayManager.USER_DATA)}
									</div>
									${getAdditionalMessages(item, overlayManager.USER_DATA)}
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
	}/syndication/download/${contentID}${overlayManager.DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}

function generateSaveURI (contentID, item) {
	let uri = `/syndication/save/${contentID}${overlayManager.DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}


function save (evt) {
	const item = getItemByHTMLElement(evt.target);
	const items = getAllItemsForID(item.id);

	items.forEach((item) => (item.saved = true));
}

function show (evt) {
	try {
		const isOverlayVisible = overlayManager.isOverlayVisible();
		if (isOverlayVisible) {
			overlayManager.hideOverlay();
		}

		if (overlayManager.shouldPreventDefault(evt.target.parentElement)) {
			evt.preventDefault();
		}

		localStore.get('download_format').then((val) => {
			if (val) {
				if (Date.now() - val.time <= MAX_LOCAL_FORMAT_TIME_MS) {
					overlayManager.DOWNLOAD_FORMAT = `?format=${val.format}`;
				} else {
					overlayManager.DOWNLOAD_FORMAT = '';
				}
			} else {
				overlayManager.DOWNLOAD_FORMAT = '';
			}

			const overlayFragment = createElement(getItemByHTMLElement(evt.target));
			overlayManager.showOverlay(overlayFragment);
		});
	} catch (error) { }
}



export {
	init,
	actionModalFromKeyboard,
	isDownloadDisabled,
	actionModalFromClick,
	show,
	save,
	createElement,
	isSaveDisabled,
	download
};
