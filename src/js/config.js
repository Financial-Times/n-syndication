'use strict';

export const ATTR_CONTENT_ID = 'data-content-id';
export const ATTR_CONTENT_TYPE = 'data-content-type';
export const ATTR_SYNDICATED = 'data-syndicated';

export const CSS_CLASS_PREFIX = 'n-syndication';
export const CSS_CLASS_PREFIX_BUTTON = 'o-buttons';
export const CSS_CLASS_PREFIX_OVERLAY = 'o-overlay';
export const CSS_SELECTOR_CONTENT_ID = `[${ATTR_CONTENT_ID}]`;
export const CSS_SELECTOR_NOT_SYNDICATED = `:not([${ATTR_SYNDICATED}="true"])`;
export const CSS_SELECTOR_SYNDATION_ICON = `${CSS_SELECTOR_CONTENT_ID}[${ATTR_SYNDICATED}="true"].${CSS_CLASS_PREFIX}-icon`;

export const DATA_ID_PROPERTY = 'id';

export const EVENT_PREFIX = 'nSyndication';

export const EXCLUDE_ELEMENTS = {
	BUTTON: true,
	FORM: true
};

export const FETCH_URI_RESOLVE_SYNDICATABLE_CONTENT = '/syndication/resolve';
export const FETCH_OPTIONS_RESOLVE_SYNDICATABLE_CONTENT = {
	credentials: 'include',
	headers: {
		'content-type': 'application/json'
	},
	method: 'POST'
};

export const FETCH_URI_USER_STATUS = '/syndication/user-status';
export const FETCH_OPTIONS_USER_STATUS = {
	credentials: 'include'
};

export const LABEL_ARIA_OVERLAY = 'Download: ';
export const OVERLAY_TEXT_DISCLAIMER = 'Please ensure you have considered your contractual rights before republishing';

export const SYNDICATION_INSERTION_RULES = {
	'a': { fn: 'closest', slc: '.o-teaser__heading' },
	'article': { fn: 'querySelector', slc: '.topper__headline' }
};

export const URI_PREFIX_DOWNLOAD = 'https://www.ft.com/syndication/download';
export const URI_PREFIX_SAVE = 'https://www.ft.com/syndication/save';