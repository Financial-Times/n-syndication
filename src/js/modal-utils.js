
import { TRACKING } from './config';

function createTrackingEvent (evt, item, overlayManager) {
	const trackingEvent = {
		category: TRACKING.CATEGORY,
		contractID: overlayManager.USER_DATA.contract_id,
		product: TRACKING.CATEGORY,
		url: location.href,
		action: evt.target.getAttribute('data-trackable')
	};

	if (item) {
		Object.assign(trackingEvent, {
			lang: item.lang,
			message: item.messageCode,
			article_id: item.id,
			syndication_content: item.type
		});
	}

	return trackingEvent;
}

function isSyndicationIcon (target) {
	return target.matches('[data-content-id][data-syndicated="true"].n-syndication-icon');
}

function isDownloadButton (target) {
	return target.matches('[data-content-id][data-syndicated="true"].download-button');
}

function isSaveAction (target) {
	return target.matches('.n-syndication-action[data-action="save"]');
}

function isDownloadAction (target) {
	return target.matches('.n-syndication-action[data-action="download"]');
}

function isCloseAction (target) {
	const action = target.getAttribute('data-action');
	return target.matches('.n-syndication-modal-shadow') || (action && action === 'close');
}



module.exports = exports = {
	isCloseAction,
	isDownloadAction,
	isSaveAction,
	isDownloadButton,
	isSyndicationIcon,
	createTrackingEvent,
};
