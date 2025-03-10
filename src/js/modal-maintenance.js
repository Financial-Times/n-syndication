/* eslint-disable no-console */
'use strict';

import oViewport from '@financial-times/o-viewport';
import Superstore from 'superstore';

import { TRACKING } from './config';

import { toElement, broadCast } from './util';
import { getItemByHTMLElement } from './data-store';
import { createTrackingEvent, isCloseAction,isDownloadButton,isSaveAction, isSyndicationIcon} from './modal-utils';

import OverlayVisibilityManager from './modal-state-manager';

const localStore = new Superstore('local', 'syndication');
const overlayManager = new OverlayVisibilityManager();

function init (user) {
	addEventListener('click', actionModalFromClick, true);

	addEventListener('keyup', actionModalFromKeyboard, true);
	addEventListener('resize', overlayManager.reposition, true);

	oViewport.listenTo('resize');

	overlayManager.USER_DATA = user;
}

function daysUntilMaintenance (date) {
	let dateNow = new Date(Date.now());
	let maintenanceDate = new Date(date);
	const diffTime = maintenanceDate - dateNow;
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays >= 0) {
		return diffDays;
	}
	return -1;
}
function actionModalFromClick (evt) {
	try {
		const item = getItemByHTMLElement(evt.target);
		let fire = true;
		const trackingEvent = createTrackingEvent(evt, item, overlayManager);

		if (isSyndicationIcon(evt.target)) {
			show(evt);
		}else if (isDownloadButton(evt.target)) {
			evt.preventDefault();
			show(evt);
		} else if (isSaveAction(evt.target)) {
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

		!fire || broadCast('oTracking.event', trackingEvent);
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

			broadCast('oTracking.event', trackingEvent);

			break;
		case ' ':
		case 'Enter':
			if (isSyndicationIcon(evt.target)) {
				show(evt);
			}

			break;
	}
}

function createElement (item) {
	try {
		const title = overlayManager.USER_DATA.MAINTENANCE_MODE === true ? '' : item.title;

		return toElement(`<div class="n-syndication-modal-shadow"></div>
							<div class="n-syndication-modal n-syndication-modal-${item.type}" role="dialog" aria-labelledby="'Download:  ${title}" tabindex="0">
								<header class="n-syndication-modal-heading">
								<span class="--o3-icon-warning-alt demo-icon n-syndication-maintenance-icon"></span>
									<a class="n-syndication-modal-close" data-action="close" 'data-trackable="close-syndication-modal" role="button" href="#" aria-label="Close" title="Close" tabindex="0"></a>
									<span role="heading" class="n-syndication-maintenance-modal-title" >Sorry, maintenance work is in progress</span></header><section class=" n-syndication-modal-content"><div class="n-syndication-maintenance-modal-message">
									<strong>You are not able to use the Syndication tool during this time.</strong> We will notify you via email once it’s back up and running again.
									</div>
									<div class="n-syndication-maintenance-modal-lower-message">If you require articles during the maintenance period, please email
									<u><a href = "mailto: syndication@ft.com" style=" color: black" target="_blank">syndication@ft.com</a></u>
									with your requirement, and we will be happy to help.
									</div>
									<div class="n-syndication-actions" data-content-id="${item.id}" data-iso-lang="${item.lang}">
									<button data-action="maintenance-modal-close" class="close-button-maintenance">
									<a><span data-action="maintenance-modal-close" class="close-message-maintenance">Thanks, I understand</span></a>
									</button>
									</div>
								</section>
							</div>`);
	} catch (error) {
		broadCast('oErrors.log', {
			error: error,
			info: {
				component: 'next-syndication-redux',
			},
		});
	}
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

		localStore.get('download_format').then(() => {
			const overlayFragment = createElement(getItemByHTMLElement(evt.target));
			overlayManager.showOverlay(overlayFragment);

		});
	} catch (error) { }
}

export {
	init,
	daysUntilMaintenance,
	show,
	actionModalFromClick,
	actionModalFromKeyboard,
	createElement
};
