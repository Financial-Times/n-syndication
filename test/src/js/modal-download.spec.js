import { broadcast } from 'n-ui-foundations';
import oViewport from '@financial-times/o-viewport';
import Superstore from 'superstore';

const modalDownload = require('../../../src/js/modal-download');

import { TRACKING } from '../../../src/js/config';

jest.mock('n-ui-foundations', () => ({
	broadcast: jest.fn(),
}));

jest.mock('../../../src/js/config');

jest.mock('../../../src/js/data-store', () => ({
	getItemByHTMLElement: jest.fn().mockReturnValue({
		id: '123',
		lang: 'en',
		messageCode: 'test-message',
		type: 'article',
		test: 'icon test',
	}),
	getAllItemsForID: jest.fn().mockReturnValue([
		{
			id: '123',
			lang: 'en',
			messageCode: 'test-message',
			type: 'article',
			test: 'icon test',
		},
	]),
}));

jest.mock('@financial-times/o-viewport', () => ({
	listenTo: jest.fn(),
}));

jest.mock('superstore');

describe('./src/js/modal-download', () => {
	const localStoreMock = {
		get: jest
			.fn()
			.mockResolvedValue({ time: Date.now(), format: 'test-format' }),
		set: jest.fn(),
	};
	const USER_DATA = { contract_id: '123' };
	beforeEach(() => {
		jest
			.spyOn(Superstore.prototype, 'get')
			.mockImplementation(localStoreMock.get);
		jest
			.spyOn(Superstore.prototype, 'set')
			.mockImplementation(localStoreMock.set);
		modalDownload.USER_DATA = USER_DATA;
		jest.spyOn(modalDownload, 'hide');
		jest.spyOn(modalDownload, 'show');
		jest.spyOn(modalDownload, 'delayHide');
		jest.spyOn(modalDownload, 'download');
		jest.spyOn(modalDownload, 'save');
		jest.spyOn(modalDownload, 'visible');
	});

	afterEach(()=>{
		jest.clearAllMocks();
	});

	it('init should set up event listeners and viewport', () => {
		const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
		const user = { contract_id: '123' };

		modalDownload.init(user);

		expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			'click',
			modalDownload.actionModalFromClick,
			true
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			'keyup',
			modalDownload.actionModalFromKeyboard,
			true
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			'resize',
			modalDownload.reposition,
			true
		);

		expect(oViewport.listenTo).toHaveBeenCalledWith('resize');

		expect(modalDownload.USER_DATA).toStrictEqual(user);
	});

	it('actionModalFromKeyboard should hide the modal on "Escape" key press and trigger tracking event', () => {
		const trackingEvent = {
			category: 'syndication',
			contractID: modalDownload.USER_DATA.contract_id,
			product: TRACKING.CATEGORY,
			url: location.href,
			action: 'close-syndication-modal',
		};

		modalDownload.actionModalFromKeyboard({ key: 'Escape' });

		expect(modalDownload.hide).toHaveBeenCalled();
		expect(broadcast).toHaveBeenCalledWith('oTracking.event', trackingEvent);
	});

	it('actionModalFromKeyboard should show the modal on "Enter" or "Space" key press for syndication icon', () => {
		modalDownload.actionModalFromKeyboard({
			key: 'Enter',
			target: { matches: jest.fn().mockReturnValueOnce(true) },
		});

		expect(modalDownload.show).toHaveBeenCalled();

		modalDownload.actionModalFromKeyboard({
			key: 'Space',
			target: { matches: jest.fn().mockReturnValueOnce(true) },
		});
		expect(modalDownload.show).toHaveBeenCalledTimes(1);
	});

	it('isDownloadDisabled should return false for valid download conditions', () => {
		const item = {
			type: 'article',
			notAvailable: false,
			canBeSyndicated: true,
			canDownload: 1,
		};

		expect(modalDownload.isDownloadDisabled(item)).toBe(false);
	});

	it('actionModalFromClick should show the modal for syndication icon', () => {
		const evt = {
			target: {
				matches: jest.fn((selector) => {
					if (
						selector ===
						'[data-content-id][data-syndicated="true"].n-syndication-icon'
					) {
						return true;
					} else {
						return false;
					}
				}),
				getAttribute: jest.fn().mockReturnValue('save')
			},
			preventDefault: jest.fn(),
		};

		modalDownload.actionModalFromClick(evt);
		expect(modalDownload.show).toHaveBeenCalled();

		expect(broadcast).toHaveBeenCalledWith('oTracking.event', {
			category: TRACKING.CATEGORY,
			contractID: modalDownload.USER_DATA.contract_id,
			product: TRACKING.CATEGORY,
			url: location.href,
			action: 'save',
			lang: 'en',
			message: 'test-message',
			article_id: '123',
			syndication_content: 'article',
		});
	});

	it('actionModalFromClick should save, hide, show and delay hide the modal for save action', () => {
		const evt = {
			target: {
				matches: jest.fn((selector) => {
					if (selector === '.n-syndication-action[data-action="save"]') {
						return true;
					} else {
						return false;
					}
				}),
				getAttribute: jest.fn().mockReturnValue('save')
			},
			preventDefault: jest.fn(),
		};

		modalDownload.actionModalFromClick(evt);

		expect(modalDownload.delayHide).toHaveBeenCalled();
		expect(modalDownload.hide).toHaveBeenCalled();
		expect(modalDownload.save).toHaveBeenCalled();
		expect(modalDownload.show).toHaveBeenCalled();
	});

	it('actionModalFromClick should download and delay hide the modal for download action', () => {
		const evt = {
			target: {
				matches: jest.fn((selector) => {
					if (selector === '.n-syndication-action[data-action="download"]') {
						return true;
					} else {
						return false;
					}
				}),
				getAttribute: jest.fn().mockReturnValue('download')
			},
			preventDefault: jest.fn(),
		};

		modalDownload.actionModalFromClick(evt);

		expect(modalDownload.download).toHaveBeenCalled();
		expect(modalDownload.delayHide).toHaveBeenCalled();
	});

	it('should prevent default and call module.exports.show when matching download button', () => {
		const evt = {
			target: {
				matches: jest.fn((selector) => {
					if (
						selector ===
						'[data-content-id][data-syndicated="true"].download-button'
					) {
						return true;
					} else {
						return false;
					}
				}),
				getAttribute: jest.fn().mockReturnValue('close'),
			},
			preventDefault: jest.fn(),
		};

		modalDownload.actionModalFromClick(evt);

		expect(evt.preventDefault).toHaveBeenCalled();
		expect(modalDownload.show).toHaveBeenCalledWith(evt);
	});

	it('actionModalFromClick should hide the modal on click outside or close action', () => {
		const evt = {
			target: {
				matches: jest.fn((selector) => {
					if (selector === '.n-syndication-modal-shadow') {
						return true;
					} else {
						return false;
					}
				}),
				getAttribute: jest.fn().mockReturnValue('close')
			},
			preventDefault: jest.fn(),
		};
		jest.spyOn(modalDownload, 'delayHide');

		modalDownload.actionModalFromClick(evt);

		expect(evt.preventDefault).toHaveBeenCalled();
	});

	it('actionModalFromClick should not do anything if modal is not visible', () => {
		const evt = {
			target: {
				matches: jest.fn().mockReturnValue(false),
				getAttribute: jest.fn().mockReturnValue('close')
			},
			preventDefault: jest.fn(),
		};

		jest.spyOn(modalDownload, 'visible').mockReturnValue(false);

		modalDownload.actionModalFromClick(evt);

		expect(modalDownload.delayHide).not.toHaveBeenCalled();
	});
});
