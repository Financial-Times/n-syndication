import {$$} from 'n-ui-foundations';
import getUserStatus from './get-user-status';
import {init as initDataStore} from './data-store';
import {init as initIconify} from './iconify';
import {init as initDownloadModal} from './modal-download';
import {init as initNavigation} from './navigation';
import { getSyndicationAccess } from './userAccess';
import { SYNDICATION_ACCESS } from './config';

export async function init (flags) {

	if (!flags.get('syndication')) {
		return;
	}

	const syndicationAccess = await getSyndicationAccess();

	if (syndicationAccess.length === -1 || !syndicationAccess.includes(SYNDICATION_ACCESS.STANDARD)) {
		return;
	}

	const user = await getUserStatus();

	const noUserOrUserNotMigrated = (!user || user.migrated !== true);
	if (noUserOrUserNotMigrated) {
		return;
	}

	if(syndicationAccess.includes(SYNDICATION_ACCESS.RICH_ARTICLE)) {
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
