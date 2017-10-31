'use strict';

import { broadcast } from 'n-ui-foundations';
//import tracking from 'o-tracking';

import getUserStatus from './get-user-status';
import { init as initDataStore } from './data-store';
import { init as initDownloadModal } from './modal-download';
import {
	ATTR_TRACKABLE,
	CSS_SELECTOR_REPUBLISHING_HEADER_LINK,
	//	CSS_SELECTOR_TRACKABLE,
	TRACKING
} from './config';

function init (flags, user) {
	if (user) {
		_init(flags, user);
	}
	else {
		getUserStatus().then(user => {
			_init(flags, user);
		});
	}
}

function _init (flags, user) {
	if (!location.pathname.includes('/contract')) {
		if (typeof window.republishingInitData !== 'function') {
			window.republishingInitData = function () {};
		}

		initDataStore(flags, user, window.republishingInitData());

		initDownloadModal(flags, user);
	}

	window.getRepublishingUser = () => user;

	track(flags, user);
}

function track (flags, user) {
	const config = JSON.parse(JSON.stringify(TRACKING.DATA));
	config.context.contractID = user.contract_id;
	//	config.context.appVersion = user.app.version;

	//	broadcast('oTracking.page', config);
	broadcast('oTracking.page', {
		app: TRACKING.DATA.context.app,
		//		appVersion: user.app.version,
		contractID: user.contract_id
	});

	document.addEventListener('submit', (evt) => broadcastClick(evt, user), true);
	addEventListener('click', (evt) => broadcastClick(evt, user), true);
}

function broadcastClick (evt, user) {
	let publish = false;
	if (evt.target.matches(CSS_SELECTOR_REPUBLISHING_HEADER_LINK)) {
		publish = true;
	}
	//	else if (location.pathname.includes('/save') || location.pathname.includes('/download')) {
	//		if (evt.target.matches(CSS_SELECTOR_TRACKABLE)) {
	//			publish = true;
	//		}
	//	}

	if (publish === true) {
		broadcast('oTracking.event', {
			category: TRACKING.CATEGORY,
			action: evt.target.getAttribute(ATTR_TRACKABLE),
			app: TRACKING.DATA.context.app,
			//			appVersion: user.app.version,
			contractID: user.contract_id,
			url: location.href
		});
	}
}

export { init, track };
