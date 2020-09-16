import {$$} from 'n-ui-foundations';
import {products as getUserProducts} from 'next-session-client';
import getUserStatus from './get-user-status';
import {init as initDataStore} from './data-store';
import {init as initIconify} from './iconify';
import {init as initDownloadModal} from './modal-download';
import {init as initNavigation} from './navigation';

export async function checkIfUserIsSyndicationCustomer () {
	const SYNDICATION_PRODUCT_CODE = 'S1';
	const response = await getUserProducts().catch(err => err);

	return response && response.products
		? response.products.includes(SYNDICATION_PRODUCT_CODE)
		: false;
}

export async function init (flags) {
	if (!flags.get('syndication')) {
		return;
	}

	const userIsSyndicationCustomer = await checkIfUserIsSyndicationCustomer();
	if (!userIsSyndicationCustomer) {
		return;
	}

	const user = await getUserStatus();

	const noUserOrUserNotMigrated = (!user || user.migrated !== true);
	if (noUserOrUserNotMigrated) {
		return;
	}

	initNavigation(user);

	const allowed = user.allowed || {};

	const allowedSomeSpanishContent = (allowed.spanish_content === true || allowed.spanish_weekend === true);
	if (allowedSomeSpanishContent && allowed.ft_com !== true) {
		return;
	}

	initDataStore(user);
	initIconify(user);
	initDownloadModal(user);
	$$('.video__actions__download').forEach(el => el.parentNode.removeChild(el));
}
