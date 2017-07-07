'use strict';

import { broadcast } from 'n-ui-foundations';

import {
	FETCH_URI_USER_STATUS,
	FETCH_OPTIONS_USER_STATUS
} from './config';

import { init as initDataStore } from './data-store';
import { init as initIconify } from './iconify';
import { init as initDownloadModal } from './modal-download';

import { cheapClone } from './util';

function init (flags) {
	if (!flags.get('syndicationRedux')) {
		return;
	}

	getUserStatus().then(response => {
		if (response !== null) {
			initDataStore(flags);

			initIconify(flags);

			initDownloadModal(flags);
		}
	});
}

function getUserStatus () {
	return fetch(FETCH_URI_USER_STATUS, cheapClone(FETCH_OPTIONS_USER_STATUS))
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			else {
				// this is a valid response, i.e. the user is not a syndication user but somehow managed to get here.
				// e.g. a developer with the right flags turned on, but doesn't belong to a licence.
				if (response.status === 401) {
					return null;
				}

				return response.text()
					.then(text => {
						throw new Error(`Next ${FETCH_URI_USER_STATUS} responded with "${text}" (${response.status})`);
					});
			}
		})
		.catch(error => {
			broadcast('oErrors.log', {
				error: error,
				info: {
					component: 'next-syndication-redux'
				}
			});
		});
}

export { init, getUserStatus };
