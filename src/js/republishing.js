'use strict';

import {broadcast} from 'n-ui-foundations';
import getUserStatus from './get-user-status';
import {init as initDataStore} from './data-store';
import {init as initDownloadModal} from './modal-download';
import {TRACKING} from './config';

function init (flags, user) {
	if (user) {
		_init(flags, user);
	} else {
		getUserStatus().then(user => {
			_init(flags, user);
		});
	}
}

function _init (flags, user) {
	if (!location.pathname.includes('/contract')) {
		if (typeof window.republishingInitData !== 'function') {
			window.republishingInitData = function () {
			};
		}

		initDataStore(user, window.republishingInitData());

		initDownloadModal(user);
	}

	window.getRepublishingUser = () => user;

	track(flags, user);
}

function track (flags, user) {
	const config = JSON.parse(JSON.stringify(TRACKING.DATA));
	config.context.contractID = user.contract_id;
	//	config.context.appVersion = user.app.version;

	document.addEventListener('submit', (evt) => broadcastClick(evt, user), true);
	addEventListener('click', (evt) => broadcastClick(evt, user), true);
}

function broadcastClick (evt, user) {
	let publish = false;
	if (evt.target.matches('.o-header-services__nav-link')) {
		publish = true;
	}

	if (publish === true) {
		broadcast('oTracking.event', {
			category: TRACKING.CATEGORY,
			action: evt.target.getAttribute('data-trackable'),
			app: TRACKING.DATA.context.app,
			//			appVersion: user.app.version,
			contractID: user.contract_id,
			url: location.href
		});
	}
}

export {init, track};
