import { broadCast } from '../../../src/js/util';
import oViewport from '@financial-times/o-viewport';
import Superstore from 'superstore';

const modalDownload = require('../../../src/js/modal-download');
import OverlayVisibilityManager from '../../../src/js/modal-state-manager';
import { TRACKING } from '../../../src/js/config';
jest.mock('../../../src/js/util', () => {
	const originalModule = jest.requireActual('../../../src/js/util');
	return {
		__esModule: true,
		...originalModule,
		broadCast: jest.fn(),
	};
});
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
	const overlayManagerMockInstance = {
		isOverlayVisible: jest.fn(),
		hideOverlay: jest.fn(),
		delayModalHide: jest.fn(),
		USER_DATA
	};
	beforeEach(() => {
		jest
			.spyOn(Superstore.prototype, 'get')
			.mockImplementation(localStoreMock.get);
		jest
			.spyOn(Superstore.prototype, 'set')
			.mockImplementation(localStoreMock.set);
		jest.spyOn(modalDownload, 'show');
		jest.spyOn(modalDownload, 'download');
		jest.spyOn(modalDownload, 'save');
		jest.spyOn(OverlayVisibilityManager.prototype, 'hideOverlay').mockImplementation(overlayManagerMockInstance.hideOverlay);
		jest.spyOn(OverlayVisibilityManager.prototype, 'isOverlayVisible').mockImplementation(overlayManagerMockInstance.isOverlayVisible);
		jest.spyOn(OverlayVisibilityManager.prototype, 'delayModalHide').mockImplementation(overlayManagerMockInstance.delayModalHide);

	});

	afterEach(() => {
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
			OverlayVisibilityManager.prototype.reposition,
			true
		);

		expect(oViewport.listenTo).toHaveBeenCalledWith('resize');

		expect(overlayManagerMockInstance.USER_DATA).toStrictEqual(user);
	});

	it('actionModalFromKeyboard should hide the modal on "Escape" key press and trigger tracking event', () => {
		const trackingEvent = {
			category: 'syndication',
			contractID: overlayManagerMockInstance.USER_DATA.contract_id,
			product: TRACKING.CATEGORY,
			url: location.href,
			action: 'close-syndication-modal',
		};

		modalDownload.actionModalFromKeyboard({ key: 'Escape' });

		expect(overlayManagerMockInstance.hideOverlay).toHaveBeenCalled();
		expect(broadCast).toHaveBeenCalledWith('oTracking.event', trackingEvent);
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

		expect(broadCast).toHaveBeenCalledWith('oTracking.event', {
			category: TRACKING.CATEGORY,
			contractID: overlayManagerMockInstance.USER_DATA.contract_id,
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

		expect(overlayManagerMockInstance.delayModalHide).toHaveBeenCalled();
		expect(overlayManagerMockInstance.hideOverlay).toHaveBeenCalled();
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

		expect(overlayManagerMockInstance.delayModalHide).toHaveBeenCalled();
	});

	it('should prevent default and call exports.show when matching download button', () => {
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
		overlayManagerMockInstance.isOverlayVisible.mockReturnValue(true);

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

		overlayManagerMockInstance.isOverlayVisible.mockReturnValue(false);

		modalDownload.actionModalFromClick(evt);

		expect(overlayManagerMockInstance.delayModalHide).not.toHaveBeenCalled();
	});
});
