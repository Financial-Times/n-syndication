'use strict';

import { interpolate } from './util';
import { MESSAGES } from './config';

export function getMessage (item, { MAINTENANCE_MODE, contributor_content }) {
	let message;
	item.translationMessage = '';
	if (item.embargoPeriod && typeof item.embargoPeriod === 'number') {
		item.embargoPeriod = `${item.embargoPeriod} day${
			item.embargoPeriod > 1 ? 's' : ''
		}`;
	}

	item.embargoMessage = item.embargoPeriod
		? interpolate(MESSAGES.EMBARGO, item)
		: '';
	if (Boolean(document.getElementById('ftlabsTranslationContainer'))) {
		item.translationMessage = interpolate(MESSAGES.ENGLISH, item);
	}

	if (MAINTENANCE_MODE === true) {
		message = MESSAGES.MSG_5100;
	} else if (item.type === 'package') {
		message = MESSAGES.MSG_4300;
	} else if (item.notAvailable === true) {
		message = MESSAGES.MSG_4050;
	} else if (item.canBeSyndicated === 'verify') {
		message = item.lang !== 'en' ? MESSAGES.MSG_4250 : MESSAGES.MSG_2200;
	}
	if (
		item.canBeSyndicated === 'withContributorPayment' &&
		contributor_content !== true
	) {
		message = MESSAGES.MSG_2300;
	} else if (
		item.canBeSyndicated === 'withContributorPayment' &&
		item.downloaded === true
	) {
		message = MESSAGES.MSG_2340;
	} else if (item.canBeSyndicated === 'withContributorPayment') {
		message = MESSAGES.MSG_2320;
	} else if (item.canBeSyndicated === 'no' || !item.canBeSyndicated) {
		message = MESSAGES.MSG_4000;
	} else if (item.downloaded === true) {
		message = MESSAGES.MSG_2100;
	} else if (item.canDownload === 0) {
		message = item.lang !== 'en' ? MESSAGES.MSG_4250 : MESSAGES.MSG_4200;
	} else if (item.canDownload === -1) {
		message = MESSAGES.MSG_4100;
	} else {
		message = MESSAGES.MSG_2000;
	}

	return interpolate(message, item);
}

export function richContentMessage (
	{ hasGraphics = false, canAllGraphicsBeSyndicated = false } = {},
	{ download_format = 'plain', allowed = {} } = {}
) {

	const messagesContent = [];

	if (allowed.rich_article) {
		if (hasGraphics && !canAllGraphicsBeSyndicated) {
			messagesContent.push({
				messageType: 'neutral',
				message: MESSAGES.GRAPHICS,
			});

			//Nested condition because only required if first condition true
			if (download_format && download_format !== 'docx') {

				messagesContent.push({
					messageType: 'error',
					message: MESSAGES.WORD_FORMAT,
				});
			}
		}
	}

	return messagesContent;
}
