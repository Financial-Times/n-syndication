'use strict';

import getUserStatus from './get-user-status';

import { init as initDataStore } from './data-store';
import { init as initIconify } from './iconify';
import { init as initDownloadModal } from './modal-download';
import { init as initNavigation } from './navigation';

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
	if (user && user.migrated !== true && !flags.get('syndicationRedux')) {
		return;
	}

	initNavigation(flags, user);

	initDataStore(flags);

	initIconify(flags, user);

	initDownloadModal(flags, user);
}

export { init };
