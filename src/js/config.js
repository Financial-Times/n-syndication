'use strict';

export const ATTR_ACTION = 'data-action';
export const ATTR_CONTENT_ID = 'data-content-id';
export const ATTR_CONTENT_TYPE = 'data-content-type';
export const ATTR_SYNDICATED = 'data-syndicated';
export const ATTR_TRACKABLE = 'data-trackable';
export const ATTR_TRACKABLE_VALUE = 'syn-icon';

export const CSS_CLASS_PREFIX = 'n-syndication';
export const CSS_CLASS_REPUBLISHING_BUTTON = 'download-button';
export const CSS_SELECTOR_ACTION_DOWNLOAD = `.${CSS_CLASS_PREFIX}-action[${ATTR_ACTION}="download"]`;
export const CSS_SELECTOR_ACTION_SAVE = `.${CSS_CLASS_PREFIX}-action[${ATTR_ACTION}="save"]`;
export const CSS_SELECTOR_CONTENT_ID = `[${ATTR_CONTENT_ID}]`;
export const CSS_SELECTOR_NOT_SYNDICATED = `:not([${ATTR_SYNDICATED}="true"])`;
export const CSS_SELECTOR_REPUBLISHING_BTN = `${CSS_SELECTOR_CONTENT_ID}[${ATTR_SYNDICATED}="true"].${CSS_CLASS_REPUBLISHING_BUTTON}`;
export const CSS_SELECTOR_SYNDATION_ICON = `${CSS_SELECTOR_CONTENT_ID}[${ATTR_SYNDICATED}="true"].${CSS_CLASS_PREFIX}-icon`;
export const CSS_SELECTOR_TRACKABLE = `[${ATTR_TRACKABLE}]`;

export const DATA_ID_PROPERTY = 'id';

export const EMPTY = '';

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

export const MAX_LOCAL_FORMAT_TIME_MS = 300000;

export const MESSAGES = {
    MSG_2000: `${EMPTY}<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>`,
    MSG_2100: `${EMPTY}<p>This content has already been downloaded and therefore will not count towards your republishing limit.</p>
<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>`,
    MSG_2200: `${EMPTY}<p>Please contact us for details of republishing rights for this content (<a href="mailto:syndication@ft.com">syndication@ft.com</a> or +44 (0)207 873 4816).</p>`,
    MSG_2300: `${EMPTY}<p>This content will incur additional charges to republish. Please contact us for further details (<a href="mailto:syndication@ft.com">syndication@ft.com</a> or +44 (0)207 873 4816).</p>`,
    MSG_2320: `${EMPTY}<p>This content will incur additional charges to republish. Please contact us for further details (<a href="mailto:syndication@ft.com">syndication@ft.com</a> or +44 (0)207 873 4816).</p>
<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>`,
    MSG_2340: `${EMPTY}<p>This content has already been downloaded and therefore will not count towards your republishing limit.</p>
<p>This content will incur additional charges to republish. Please contact us for further details (<a href="mailto:syndication@ft.com">syndication@ft.com</a> or +44 (0)207 873 4816).</p>
<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>`,
    MSG_4000: `${EMPTY}<p>This content is not available for republishing.</p>`,
    MSG_4100: `${EMPTY}<p>You have reached your download limit for articles. Please contact your Account Manager to increase your limit.</p>`,
    MSG_4200: `${EMPTY}<p>Your contract does not allow {{type}}s to be downloaded. Please contact your Account Manager to change this.</p>`,
    MSG_5000: `${EMPTY}<p>Sorry, an error has occurred. Please try signing out and then in again. If error persists, please contact your Account Manager.</p>`
};

export const MS_DELAY_HIDE = 500;

export const SYNDICATION_INSERTION_RULES = {
	'a': { fn: 'closest', slc: '.o-teaser__heading' },
	'article': { fn: 'querySelector', slc: '.topper__headline' },
	'div.hero': { fn: 'querySelector', slc: '.hero__heading' },
	'main.video': { fn: 'querySelector', slc: '.video__title' },
	'li.o-teaser__related-item': {}
};

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

//export const URI_PREFIX_DOWNLOAD = '/syndication/download';
export const URI_PREFIX_DOWNLOAD = `${location.port ? '' : 'https://dl.syndication.ft.com'}/syndication/download`;

export const URI_PREFIX_SAVE = '/syndication/save';
