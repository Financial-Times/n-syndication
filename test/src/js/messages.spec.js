/* eslint-disable quotes */
'use strict';

import {richContentMessage , getMessage} from '../../../src/js/messages';
const itemsFixture = require('../../fixtures/item.json');
const userStatusFixture = require('../../fixtures/userStatus.json');
//const getMessageFixture = require('../../fixtures/getMessageFixture');
//import {hasGraphicsMsg, invalidFormatMsg, bothMessages } from '../../fixtures/richMessageFixture';


describe('messages', () => {

	describe('getMessages', () => {
		it('to return a string', () => {
			const subject = getMessage(itemsFixture,userStatusFixture);
			expect(typeof subject).toBe('string');
			//expect(subject).to.equal(getMessageFixture);
			//TODO test all variations of MESSAGES as defined in config based on messageCode provided
		});
	});

	describe('richContentMessage', () => {
		it('returns an empty string if item does not have graphics', () => {

			//const subject = document.createElement('div');
			const richContentMsg = richContentMessage(itemsFixture,userStatusFixture);
			//subject.innerHTML = richContentMsg;
			expect(richContentMsg).toEqual('');
			expect(typeof richContentMsg).toBe('string');
		});

		it('returns an empty string if item does not have graphics', () => {
			// eslint-disable-next-line no-undef
			const items = Object.assign({}, itemsFixture, {hasGraphics: true});
			//const subject = document.createElement('div');
			const richContentMsg = richContentMessage(items,userStatusFixture);
			//subject.innerHTML = richContentMsg;
			//expect(richContentMsg).to.equal(bothMessages);
			expect(typeof richContentMsg).toBe('string');
		});

	});

});
