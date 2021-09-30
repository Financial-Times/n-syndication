'use strict';

import {broadcast} from 'n-ui-foundations';
import oViewport from 'o-viewport';
import Superstore from 'superstore';

import {TRACKING} from './config';

import {toElement} from './util';
import {getAllItemsForID, getItemByHTMLElement} from './data-store';

const localStore = new Superstore('local', 'syndication');

let OVERLAY_FRAGMENT;
let OVERLAY_MODAL_ELEMENT;
let OVERLAY_SHADOW_ELEMENT;
let USER_DATA;
let DAYS_LEFT;

function init (user, daysLeft) {
	addEventListener('click', actionModalFromClick, true);

	addEventListener('keyup', actionModalFromKeyboard, true);
	addEventListener('resize', reposition, true);

	oViewport.listenTo('resize');

	USER_DATA = user;
	DAYS_LEFT = daysLeft;
}

function daysUntilMaintenance (date) {
	let dateNow = new Date(Date.now());
	let maintenanceDate = new Date(date);
	const diffTime = maintenanceDate - dateNow;
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays>=0){
		return diffDays;
	}
	return -1;
}

function actionModalFromClick (evt) {
	const item = getItemByHTMLElement(evt.target);

	let fire = true;

	const trackingEvent = {};

	trackingEvent.category = TRACKING.CATEGORY;
	trackingEvent.contractID = USER_DATA.contract_id;
	trackingEvent.product = TRACKING.CATEGORY;
	trackingEvent.url = location.href;

	if (item) {
		trackingEvent.lang = item.lang;
		trackingEvent.message = item.messageCode;
		trackingEvent.article_id = item['id'];
		trackingEvent.syndication_content = item.type;
	}

	if (evt.target.matches('[data-content-id][data-syndicated="true"].n-syndication-icon')) {
		show(evt);
	} else if (evt.target.matches('[data-content-id][data-syndicated="true"].download-button')) {
		evt.preventDefault();

		show(evt);
	} else if (evt.target.matches('.n-syndication-action[data-action="save"]')) {
		delayHide();
	} 
	 else {
		if (visible()) {
			const action = evt.target.getAttribute('data-action');

			if (evt.target.matches('.n-syndication-modal-shadow') || (action && action === 'maintenance-modal-close')) {
				evt.preventDefault();

				delayHide();
			}
		} else {
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
		case ' ' :
		case 'Enter' :
			if (evt.target.matches('[data-content-id][data-syndicated="true"].n-syndication-icon')) {
				show(evt);
			}

			break;
	}

}

function createElement (item) {
	const title = USER_DATA.MAINTENANCE_MODE === true ? '' : item.title;

	return toElement(`<div class="n-syndication-modal-shadow"></div>
							<div class="n-syndication-modal n-syndication-modal-${item.type}" role="dialog" aria-labelledby="'Download:  ${title}" tabindex="0">
								<header class="n-syndication-modal-heading">
								<span class="o-icons-icon o-icons-icon--warning-alt demo-icon n-syndication-maintenance-icon"></span>
									<a class="n-syndication-modal-close" data-action="close" 'data-trackable="close-syndication-modal" role="button" href="#" aria-label="Close" title="Close" tabindex="0"></a>
									<span role="heading" class="n-syndication-maintenance-modal-title" >Maintenance work is scheduled in ${DAYS_LEFT} days on Oct 6, 2021</span>
								</header>
								<section class=" n-syndication-modal-content">
								<div class="n-syndication-maintenance-modal-word-count">
									${ '<span>10:30 - 14:30 BST (British Summer Time)</span>'} <br>
									${ '<span>5:30 - 9:30 EDT (Eastern Daylight Time)</span>'}
								</div>
									<div class="n-syndication-maintenance-modal-message">
									You will not be able to use the Syndication tool during this time.
									</div>
									<div class="n-syndication-maintenance-modal-lower-message">
									If you require articles during the maintenance period, we will be able to provide them if you email 
									<u><a href = "mailto: syndication@ft.com" style=" color: black" target="_blank">syndication@ft.com</a></u>
									with your requirement.
									</div>
									<div class="n-syndication-actions" data-content-id="${item.id}" data-iso-lang="${item.lang}">
									<button data-action="maintenance-modal-close" class="close-button-maintenance">
									<a><span data-action="maintenance-modal-close" class="close-message-maintenance">Thanks, I understand</span></a>
									</button>
									</div>
								</section>
							</div>`);

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

function delayHide (ms = 500) {
	let tid = setTimeout(() => {
		clearTimeout(tid);
		tid = null;

		hide();
	}, ms);
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

	localStore.get('download_format').then(() => {
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
	init,
	daysUntilMaintenance
};
