'use strict';

import { richContentMessage, getMessage } from '../../../src/js/messages';
import { MESSAGES } from '../../../src/js/config';
const itemsFixture = require('../../fixtures/items.json');
const userStatusFixture = require('../../fixtures/userStatus.json');

describe('messages', () => {
	describe('getMessages', () => {
		it('to return CONTRACTUAL_RIGHTS_CONSIDERATION message', () => {
			const subject = getMessage(itemsFixture, userStatusFixture);
			expect(subject).toBe(
				'<p>Please ensure you have considered your <a data-trackable="contractual-rights" href="/republishing/contract">contractual rights</a> before republishing.</p>'
			);
			//TODO test all variations of MESSAGES as defined in config based on messageCode provided
		});
	});

	describe('richContentMessage for users WITHOUT rich_article access', () => {
		it('returns an empty string if user does not have allowed.rich_article set to TRUE', () => {

			const richContentMsg = richContentMessage(
				itemsFixture,
				userStatusFixture
			);
			document.body.innerHTML = richContentMsg;

			expect(Array.isArray(richContentMsg)).toBe(true);
			expect(richContentMsg.length).toBe(0);
		});
	});

	describe('richContentMessage for users with rich_article access', () => {

		const msg1 = { messageType: 'neutral', message: MESSAGES.GRAPHICS };
		const msg2 = { messageType: 'error', message: MESSAGES.WORD_FORMAT };

		beforeEach(() => {
			userStatusFixture.allowed.rich_articles = true;
		});

		it('returns an empty string if item does not have graphics', () => {
			const richContentMsg = richContentMessage(
				itemsFixture,
				userStatusFixture
			);
			document.body.innerHTML = richContentMsg;

			expect(Array.isArray(richContentMsg)).toBe(true);
			expect(richContentMsg.length).toBe(0);
		});

		it('returns empty string if hasGraphics is FALSE and canAllGraphicsBeSyndicated is TRUE', () => {
			const items = Object.assign({}, itemsFixture, {
				canAllGraphicsBeSyndicated: true,
			});
			const richContentMsg = richContentMessage(items, userStatusFixture);

			expect(Array.isArray(richContentMsg)).toBe(true);
			expect(richContentMsg.length).toBe(0);
		});

		it('returns empty string if hasGraphics is FALSE and canAllGraphicsBeSyndicated is FALSE', () => {
			const items = Object.assign({}, itemsFixture);
			const richContentMsg = richContentMessage(items, userStatusFixture);

			expect(Array.isArray(richContentMsg)).toBe(true);
			expect(richContentMsg.length).toBe(0);
		});

		it('returns HTML including the graphics unavailable message if hasGraphics is TRUE and canAllGraphicsBeSyndicated is FALSE and download_format IS docx', () => {
			const itemsHasGraphics = Object.assign({}, itemsFixture, { hasGraphics: true });
			const userWithWordDoc = Object.assign({}, userStatusFixture, { download_format: 'docx' });
			const richContentMsg = richContentMessage(itemsHasGraphics, userWithWordDoc);


			expect(Array.isArray(richContentMsg)).toBe(true);
			expect(richContentMsg.length).toBe(1);
			expect(richContentMsg[0]).toEqual(msg1);
		});

		it('returns a string of HTML that contains the graphics unavailable message AND the word format message if hasGraphics is TRUE and canAllGraphicsBeSyndicated is FALSE and download_format is NOT docx', () => {
			const items = Object.assign({}, itemsFixture, { hasGraphics: true });
			const userStatus = Object.assign({}, userStatusFixture, {
				download_format: 'plain',
			});
			const richContentMsg = richContentMessage(items, userStatus);

			expect(Array.isArray(richContentMsg)).toBe(true);
			expect(richContentMsg.length).toBe(2);
			expect(richContentMsg[0]).toEqual(msg1);
			expect(richContentMsg[1]).toEqual(msg2);
		});
	});
});
