'use strict';

import {interpolate} from './util';

const CONTRACTUAL_RIGHTS_CONSIDERATION = '<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>';
const ADDITIONAL_CHARGES_WARNING = '<p class="syndication-message__content--warning">This content will incur additional charges to republish. Please contact us for further details (<a href="mailto:syndication@ft.com">syndication@ft.com</a> or +44 (0)207 873 4816).</p>';
export const MESSAGES = {
	EMBARGO: '<p>Please note that this content is embargoed until {{embargoPeriod}} after its original publication date of {{publishedDateDisplay}}.</p>',
	ENGLISH: '<p class="syndication-message__content--warning">Please note that this content is only available to download in English.</p>',
	MSG_2000: `{{embargoMessage}}{{translationMessage}}${CONTRACTUAL_RIGHTS_CONSIDERATION}`,
	MSG_2100: `<p>This content has already been downloaded and therefore will not count towards your republishing limit.</p>\n{{embargoMessage}}\n${CONTRACTUAL_RIGHTS_CONSIDERATION}`,
	MSG_2200: '<p>Please contact us for details of republishing rights for this content (<a href="mailto:syndication@ft.com">syndication@ft.com</a> or +44 (0)207 873 4816).</p>',
	MSG_2300: `{{embargoMessage}}${ADDITIONAL_CHARGES_WARNING}`,
	MSG_2320: `{{embargoMessage}}${ADDITIONAL_CHARGES_WARNING}\n${CONTRACTUAL_RIGHTS_CONSIDERATION}`,
	MSG_2340: `<p>This content has already been downloaded and therefore will not count towards your republishing limit.</p>\n{{embargoMessage}}\n${ADDITIONAL_CHARGES_WARNING}\n${CONTRACTUAL_RIGHTS_CONSIDERATION}`,
	MSG_4000: '<p>This content is not available for republishing.</p>',
	MSG_4050: '<p>Sorry, this content is no longer available.</p>',
	MSG_4100: '<p>You have reached your download limit for {{type}}s. Please contact your Account Manager to increase your limit.</p>',
	MSG_4200: '<p>Your contract does not allow {{type}}s to be downloaded. Please contact your Account Manager to change this.</p>',
	MSG_4250: '<p>You do not have rights to republish this type of content. Please contact your Account Manager for further details.</p>',
	MSG_4300: '<p>Report contains multiple articles. Please view each article individually for republishing rights.</p>',
	MSG_5000: '<p>Sorry, an error has occurred. Please try signing out and then in again. If error persists, please contact your Account Manager.</p>',
	MSG_5100: '<p>The Republishing Service is currently undergoing maintenance. Please try again later.</p>'
};

export const RICH_CONTENT_MESSAGES = {
	GRAPHICS: 'Please note that for copyright reasons not all the graphics in this article are available for republishing so will not be included in the download.',
	WORD_FORMAT: 'Graphics are only available in Word format. Please select Word format (docx) in your syndication management tool to download.'
};

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

export const TRACKING = {
	CATEGORY: 'syndication',
	DATA: {
		context: {
			app: 'Syndication'
		},
		system: {
			product: 'Syndication',
			source: 'o-tracking'
		}
	},
	URI: 'https://spoor-api.ft.com/px.gif'
};
