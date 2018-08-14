'use strict';

export const ATTR_ACTION = 'data-action';
export const ATTR_CONTENT_ID = 'data-content-id';
export const ATTR_CONTENT_TYPE = 'data-content-type';
export const ATTR_ID = 'data-id';
export const ATTR_ISO_LANG = 'data-iso-lang';
export const ATTR_SYNDICATED = 'data-syndicated';
export const ATTR_TRACKABLE = 'data-trackable';
export const ATTR_TRACKABLE_VALUE = 'syn-icon';

export const CSS_SELECTOR_ACTION_DOWNLOAD = '.n-syndication-action[data-action="download"]';
export const CSS_SELECTOR_ACTION_SAVE = '.n-syndication-action[data-action="save"]';
export const CSS_SELECTOR_CARD_LINK = 'a.card__concept-article-link';
export const CSS_SELECTOR_CONTENT_ID = '[data-content-id]';
export const CSS_SELECTOR_ID = '[data-id]';
export const CSS_SELECTOR_PACKAGE_CONTENT_ITEM = 'a.package__content-item';
export const CSS_SELECTOR_REPUBLISHING_HEADER_LINK = '.o-header-services__nav-link';
export const CSS_SELECTOR_REPUBLISHING_BTN = `[data-content-id][data-syndicated="true"].download-button`;
export const CSS_SELECTOR_STORY_LINK = '.story__link'; // for top fastFT bar under main navigation
export const CSS_SELECTOR_SYNDATION_ICON = '[data-content-id][data-syndicated="true"].n-syndication-icon';
export const CSS_SELECTOR_TOPIC_CARD_LINK = 'a.topic-card__concept-article-link';
export const CSS_SELECTOR_VIDEO_DOWNLOAD_BUTTON = '.video__actions__download';

export const CSS_SELECTOR_SYNDICATABLE_ITEMS = [
	CSS_SELECTOR_CONTENT_ID,
	CSS_SELECTOR_ID,
	CSS_SELECTOR_CARD_LINK,
	CSS_SELECTOR_TOPIC_CARD_LINK,
	CSS_SELECTOR_PACKAGE_CONTENT_ITEM,
	CSS_SELECTOR_STORY_LINK
].join(', ');

export const DATA_ID_PROPERTY = 'id';
export const DATA_LANG_PROPERTY = 'lang';

export const DEFAULT_LANGUAGE = 'en';

export const EVENT_PREFIX = 'nSyndication';

export const EXCLUDE_ELEMENTS = {
	BUTTON: true,
	FORM: true
};

export const LABEL_ARIA_OVERLAY = 'Download: ';

export const MAX_LOCAL_FORMAT_TIME_MS = 300000;

const CONTRACTUAL_RIGHTS_CONSIDERATION = '<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>';
const ADDITIONAL_CHARGES_WARNING = '<p class="syndication-message__content--warning">This content will incur additional charges to republish. Please contact us for further details (<a href="mailto:syndication@ft.com">syndication@ft.com</a> or +44 (0)207 873 4816).</p>';
export const MESSAGES = {
	EMBARGO : '<p>Please note that this content is embargoed until {{embargoPeriod}} after its original publication date of {{publishedDateDisplay}}.</p>',
	MSG_2000: `{{embargoMessage}}${CONTRACTUAL_RIGHTS_CONSIDERATION}`,
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

export const RE_INTERPOLATE = /\{\{([^\}]+)\}\}/gim;

export const MS_DELAY_HIDE = 500;

export const SYNDICATION_INSERTION_RULES = {
	[CSS_SELECTOR_CARD_LINK]: { fn: 'closest', slc: '.card__concept-article' },
	[CSS_SELECTOR_TOPIC_CARD_LINK]: { fn: 'closest', slc: '.topic-card__concept-article' },
	[CSS_SELECTOR_PACKAGE_CONTENT_ITEM]: {fn: 'querySelector', slc: '.package__title' },
	[CSS_SELECTOR_STORY_LINK]: {fn: 'closest', slc: 'article[data-trackable="story"]' },
	// matcher for n-teaser
	'a': { fn: 'closest', slc: '.o-teaser__heading' },
	// matcher for x-teaser
	'.o-teaser': { fn: 'querySelector', slc: '.o-teaser__heading' },
	'.stream-item': { fn: 'querySelector', slc: '.card-openable__headline' },
	'article[class="article"]': { fn: 'querySelector', slc: '.topper__headline' },
	'article.article--brand': { fn: 'querySelector', slc: '.topper__headline' },
	'article.article-grid': { fn: 'querySelector', slc: '.topper__headline', up: 1 },
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
