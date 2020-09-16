'use strict';

import {richContentMessage , getMessage} from '../../../src/js/messages';
import {RICH_CONTENT_MESSAGES} from '../../../src/js/config';
const itemsFixture = require('../../fixtures/item.json');
const userStatusFixture = require('../../fixtures/userStatus.json');

describe('messages', () => {

	describe('getMessages', () => {
		it('to return CONTRACTUAL_RIGHTS_CONSIDERATION message', () => {
			const subject = getMessage(itemsFixture,userStatusFixture);
			expect(subject).toBe('<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>');
			//TODO test all variations of MESSAGES as defined in config based on messageCode provided
		});
	});

	describe('richContentMessage', () => {
		it('returns an empty string if item does not have graphics', () => {
			const richContentMsg = richContentMessage(itemsFixture,userStatusFixture);
			document.body.innerHTML = richContentMsg;
			expect(richContentMsg).toEqual(expect.not.stringContaining(RICH_CONTENT_MESSAGES.GRAPHICS));
			expect(richContentMsg).toEqual(expect.not.stringContaining(RICH_CONTENT_MESSAGES.WORD_FORMAT));
		});

		it('returns empty string if if hasGraphics is FALSE and canAllGraphicsBeSyndicated is TRUE', () => {
			const items = Object.assign({}, itemsFixture, {hasGraphics: true, canAllGraphicsBeSyndicated: true });
			const richContentMsg = richContentMessage(items,userStatusFixture);
			expect(typeof richContentMsg).toBe('string');
			expect(richContentMsg).toEqual(expect.not.stringContaining(RICH_CONTENT_MESSAGES.GRAPHICS));
			expect(richContentMsg).toEqual(expect.not.stringContaining(RICH_CONTENT_MESSAGES.WORD_FORMAT));
		});

		it('returns empty string if if hasGraphics is FALSE and canAllGraphicsBeSyndicated is FALSE', () => {
			// eslint-disable-next-line no-undef
			const items = Object.assign({}, itemsFixture, {hasGraphics: true, });
			const richContentMsg = richContentMessage(items,userStatusFixture);
			expect(typeof richContentMsg).toBe('string');
			expect(richContentMsg).toEqual(expect.stringContaining(RICH_CONTENT_MESSAGES.GRAPHICS));
			expect(richContentMsg).toEqual(expect.not.stringContaining(RICH_CONTENT_MESSAGES.WORD_FORMAT));
		});

		it('returns HTML including the graphics unavailable message if hasGraphics is TRUE and canAllGraphicsBeSyndicated is FALSE', () => {
			// eslint-disable-next-line no-undef
			const items = Object.assign({}, itemsFixture, {hasGraphics: true, });
			const richContentMsg = richContentMessage(items,userStatusFixture);
			expect(typeof richContentMsg).toBe('string');
			expect(richContentMsg).toEqual(expect.stringContaining(RICH_CONTENT_MESSAGES.GRAPHICS));
			expect(richContentMsg).toEqual(expect.not.stringContaining(RICH_CONTENT_MESSAGES.WORD_FORMAT));
		});

		it('returns a string of HTML that contains the graphics unavailable message AND the word format message if hasGraphics is TRUE and canAllGraphicsBeSyndicated is FALSE AND download_format is docx', () => {
			// eslint-disable-next-line no-undef
			const items = Object.assign({}, itemsFixture, {hasGraphics: true, });
			const userStatus = Object.assign({}, userStatusFixture, {download_format: 'docx', });
			const richContentMsg = richContentMessage(items,userStatus);
			expect(typeof richContentMsg).toBe('string');
			expect(richContentMsg).toEqual(expect.stringContaining(RICH_CONTENT_MESSAGES.GRAPHICS));
			expect(richContentMsg).toEqual(expect.stringContaining(RICH_CONTENT_MESSAGES.WORD_FORMAT));
		});

	});

});
