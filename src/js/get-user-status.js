'use strict';

import { broadCast } from './util';

export default async function getUserStatus () {
	const url = '/syndication/user-status';
	const options = {
		credentials: 'include'
	};

	try {
		const response = await fetch(url, options);
		if (response.ok) {
			return response.json();
		} else {
			// this is a valid response, i.e. the user is not a syndication user but somehow managed to get here.
			// e.g. a developer with the right flags turned on, but doesn't belong to a licence.
			switch (response.status) {
				case 401:
					return null;
				case 503:
					if (response.headers.get('content-type').includes('application/json')) {
						const error = await response.json();
						error.migrated = true;
						error.MAINTENANCE_MODE = true;

						return error;
					}
			}

			const text = await response.text();
			throw new Error(`Next ${url} responded with "${text}" (${response.status})`);
		}
	} catch (error) {
		broadCast('oErrors.log', {
			error: error,
			info: {
				component: 'next-syndication-redux'
			}
		});
	}
}
