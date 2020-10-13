import {$$} from 'n-ui-foundations';
import {products as getUserProducts} from 'next-session-client';
import getUserStatus from './get-user-status';
import {init as initDataStore} from './data-store';
import {init as initIconify} from './iconify';
import {init as initDownloadModal} from './modal-download';
import {init as initNavigation} from './navigation';

const SYNDICATION_PRODUCT_CODE = 'S1';
const SYNDICATION_RICH_ARTICLE_CODE = 'S2';

export async function getSyndicationAccess () {

	const response = await getUserProducts().catch(err => err);

	if(response && response.products) {
		return response.products.split(',').filter(product => (
			product === SYNDICATION_PRODUCT_CODE ||product=== SYNDICATION_RICH_ARTICLE_CODE));
	}

	return [];
}

export async function init (flags) {

	if (!flags.get('syndication')) {
		return;
	}

	const syndicationAccess = await getSyndicationAccess();

	if (syndicationAccess.length === -1 || !syndicationAccess.includes(SYNDICATION_PRODUCT_CODE)) {
		return;
	}

	const user = await getUserStatus();


	const noUserOrUserNotMigrated = (!user || user.migrated !== true);
	if (noUserOrUserNotMigrated) {
		return;
	}

	if(syndicationAccess.includes(SYNDICATION_RICH_ARTICLE_CODE)) {
		//if user has S2 then augment the user object with rich article prop
		user.allowed.rich_article = true;
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
