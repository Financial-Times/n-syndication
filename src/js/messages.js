'use strict';

import {interpolate} from './util';
import {MESSAGES, RICH_CONTENT_MESSAGES} from './config';

//TODO template this propery
const notAllGraphics = `<div class="o-message o-message--alert o-message--neutral" data-o-component="o-message"><div class="o-message__container">
		<div class="o-message__content">
			<p class="o-message__content-main">
				<span class="o-message__content-highlight">${RICH_CONTENT_MESSAGES.GRAPHICS}</span>
		</div>
	</div>
</div>`;

const inValidFormat = `<div class="o-message o-message--alert o-message--error" data-o-component="o-message"><div class="o-message__container">
		<div class="o-message__content">
			<p class="o-message__content-main">
				<span class="o-message__content-highlight">${RICH_CONTENT_MESSAGES.WORD_FORMAT}</span>
		</div>
	</div>
</div>`;

export function getMessage (item, {MAINTENANCE_MODE, contributor_content}) {
	let message;
	item.translationMessage = '';
	if (item.embargoPeriod && typeof item.embargoPeriod === 'number') {
		item.embargoPeriod = `${item.embargoPeriod} day${item.embargoPeriod > 1 ? 's' : ''}`;
	}

	item.embargoMessage = item.embargoPeriod ? interpolate(MESSAGES.EMBARGO, item) : '';
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
	if (item.canBeSyndicated === 'withContributorPayment' && contributor_content !== true) {
		message = MESSAGES.MSG_2300;
	} else if (item.canBeSyndicated === 'withContributorPayment' && item.downloaded === true) {
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


export function richContentMessage (item, userData) {

	const messagesBlocks = [];
	//If is rich content users & some images are not licences display
	//If default format is not word display secondary message

	//Condition for rich_article user?
	// if(userData.allowed && userData.allowed.hasOwnProperty('rich_article') && userData.allowed.rich_article) {
	// 	//do nothing if user access is not rich article
	// 	return;
	// };


	//TODO Just here to flesh out manually test logic remove once hasGraphic and canAllGraphicsBeSyndicated exist
	// if(item.canBeSyndicated && item.canBeSyndicated === 'yes') {
	// 	messagesBlocks.push(notAllGraphics);
	// 	if(userData.download_format && userData.download_format === 'docx') {
	// 		messagesBlocks.push(inValidFormat);
	// 	}
	// }

	if(item.hasGraphics && !item.canAllGraphicsBeSyndicated) {
		messagesBlocks.push(notAllGraphics);

		//nested condition because only required if first condition true
		if(userData.download_format && userData.download_format === 'docx') {
			messagesBlocks.push(inValidFormat);
		}
	}

	return messagesBlocks.join('');

}
