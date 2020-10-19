import {$$} from 'n-ui-foundations';
import getUserStatus from './get-user-status';
import {init as initDataStore} from './data-store';
import {init as initIconify} from './iconify';
import {init as initDownloadModal} from './modal-download';
import {init as initNavigation} from './navigation';
import { getSyndicationAccess } from './userAccess';
import { SYNDICATION_ACCESS } from './config';

export async function init (flags) {

	console.log('init called with syndication flag: ', flags.get());
	if (!flags.get('syndication')) {
		console.log('ditch at flag check');
		return;
	}

	const syndicationAccess = await getSyndicationAccess();
	console.log('syndy access is', syndicationAccess);
	if (syndicationAccess.length === -1 || !syndicationAccess.includes(SYNDICATION_ACCESS.STANDARD)) {
		console.log('syndy access denied', syndicationAccess);
		return;
	}

	const user = await getUserStatus();

	console.log(user);
	const noUserOrUserNotMigrated = (!user || user.migrated !== true);
	if (noUserOrUserNotMigrated) {
		console.log('syndy user does not exist or not migrated', user);
		return;
	}

	if(syndicationAccess.includes(SYNDICATION_ACCESS.RICH_ARTICLE)) {
		//if user has S2 then augment the user object with rich article prop
		console.log('has rich content');
		user.allowed.rich_article = true;
	}

	initNavigation(user);

	const allowed = user.allowed || {};

	const allowedSomeSpanishContent = (allowed.spanish_content === true || allowed.spanish_weekend === true);
	if (allowedSomeSpanishContent && allowed.ft_com !== true) {
		console.log('has spanish content');
		return;
	}

	console.log('syndi user status with:' ,allowed);

	initDataStore(user);
	initIconify(user);
	initDownloadModal(user);
	$$('.video__actions__download').forEach(el => el.parentNode.removeChild(el));
}
