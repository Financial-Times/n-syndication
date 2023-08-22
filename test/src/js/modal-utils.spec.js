import {
	isCloseAction,
	isDownloadAction,
	isSaveAction,
	isDownloadButton,
	isSyndicationIcon,
	createTrackingEvent
} from './../../../src/js/modal-utils';

import { TRACKING } from '../../../src/js/config';

global.location = {
	href: 'http://localhost/'
};

describe('Tracking module', () => {
	const mockEvent = (targetAttributes = {}) => ({
		target: {
			getAttribute: jest.fn((attr) => targetAttributes[attr] || null),
			matches: jest.fn(() => false)
		}
	});

	const mockOverlayManager = {
		USER_DATA: {
			contract_id: '12345'
		}
	};

	describe('createTrackingEvent', () => {
		it('should create a basic tracking event', () => {
			const event = mockEvent({ 'data-trackable': 'trackableItem' });
			const result = createTrackingEvent(event, null, mockOverlayManager);

			expect(result).toEqual({
				category: TRACKING.CATEGORY,
				contractID: '12345',
				product: TRACKING.CATEGORY,
				url: 'http://localhost/',
				action: 'trackableItem'
			});
		});

		it('should create an extended tracking event with item data', () => {
			const event = mockEvent({ 'data-trackable': 'trackableItem' });
			const item = {
				lang: 'en',
				messageCode: 'msg123',
				id: 'abc123',
				type: 'someType'
			};

			const result = createTrackingEvent(event, item, mockOverlayManager);

			expect(result).toEqual({
				category: TRACKING.CATEGORY,
				contractID: '12345',
				product: TRACKING.CATEGORY,
				url: 'http://localhost/',
				action: 'trackableItem',
				lang: 'en',
				message: 'msg123',
				article_id: 'abc123',
				syndication_content: 'someType'
			});
		});
	});

	describe('isSyndicationIcon', () => {
		it('should detect a syndication icon', () => {
			const event = mockEvent();
			event.target.matches = (selector) => selector.includes('n-syndication-icon');

			expect(isSyndicationIcon(event.target)).toBeTruthy();
		});
	});

	describe('isDownloadButton', () => {
		it('should detect a download button', () => {
			const event = mockEvent();
			event.target.matches = (selector) => selector.includes('download-button');

			expect(isDownloadButton(event.target)).toBeTruthy();
		});
	});

	describe('isSaveAction', () => {
		it('should detect a save action', () => {
			const event = mockEvent();
			event.target.matches = (selector) => selector.includes('[data-action="save"]');

			expect(isSaveAction(event.target)).toBeTruthy();
		});
	});

	describe('isDownloadAction', () => {
		it('should detect a download action', () => {
			const event = mockEvent();
			event.target.matches = (selector) => selector.includes('[data-action="download"]');

			expect(isDownloadAction(event.target)).toBeTruthy();
		});
	});

	describe('isCloseAction', () => {
		it('should detect a close action from modal shadow', () => {
			const event = mockEvent();
			event.target.matches = (selector) => selector.includes('.n-syndication-modal-shadow');

			expect(isCloseAction(event.target)).toBeTruthy();
		});

		it('should detect a close action from data-action attribute', () => {
			const event = mockEvent({ 'data-action': 'close' });

			expect(isCloseAction(event.target)).toBeTruthy();
		});
	});
});
