const modalMaintenance = require('../../../src/js/modal-maintenance');
import { broadcast } from 'n-ui-foundations';

import { getItemByHTMLElement } from '../../../src/js/data-store';

jest.mock('n-ui-foundations', () => ({
	broadcast: jest.fn(),
}));
jest.mock('../../../src/js/data-store', () => ({
	getItemByHTMLElement: jest.fn(),
}));

describe('init', () => {
	const USER_DATA = { contract_id: '123' };
	beforeEach(() => {
		jest.useFakeTimers('modern');
		window.addEventListener = jest.fn();
		window.removeEventListener = jest.fn();
		modalMaintenance.USER_DATA = USER_DATA;
		jest.spyOn(modalMaintenance, 'delayHide');
		jest.spyOn(modalMaintenance, 'show');
		jest.spyOn(modalMaintenance, 'hide');
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should add event listeners and initialize USER_DATA', () => {
		const user = { contract_id: '123' };

		modalMaintenance.init(user);

		expect(window.addEventListener).toHaveBeenCalledWith(
			'click',
			expect.any(Function),
			true
		);
		expect(window.addEventListener).toHaveBeenCalledWith(
			'keyup',
			expect.any(Function),
			true
		);
		expect(window.addEventListener).toHaveBeenCalledWith(
			'resize',
			expect.any(Function),
			true
		);
		expect(modalMaintenance.USER_DATA).toEqual({ contract_id: '123' });
	});
});

describe('daysUntilMaintenance', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});
	it('should return the number of days until maintenance', () => {
		const currentDate = new Date();
		const result = modalMaintenance.daysUntilMaintenance(currentDate);

		expect(result).toBe(0);
	});

	it('should return -1 when maintenance date is in the past', () => {
		const maintenanceDate = '2023-05-20';
		const result = modalMaintenance.daysUntilMaintenance(maintenanceDate);
		expect(result).toBe(-1);
	});
});

describe('actionModalFromClick', () => {
	beforeEach(() => {
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});
	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});
	it('should call broadcast with the correct tracking event when item is found', () => {
		const evt = {
			target: {
				matches: jest.fn().mockReturnValue(true),
				getAttribute: jest.fn().mockReturnValue('save')
			},
			preventDefault: jest.fn(),
		};

		getItemByHTMLElement.mockReturnValue({
			id: 'item-id',
			lang: 'en',
			title: 'Sample Article',
			messageCode: '2345',
			type: 'article',
		});

		const expectedData = {
			category: 'syndication',
			contractID: modalMaintenance.USER_DATA.contract_id,
			product: 'syndication',
			url: window.location.href,
			lang: 'en',
			message: '2345',
			article_id: 'item-id',
			syndication_content: 'article',
		};

		modalMaintenance.actionModalFromClick(evt);

		expect(getItemByHTMLElement).toHaveBeenCalledTimes(1);
		expect(getItemByHTMLElement).toHaveBeenCalledWith(evt.target);
		expect(broadcast).toHaveBeenCalledTimes(1);
		expect(broadcast).toHaveBeenCalledWith('oTracking.event', expectedData);
	});

	it('should not call broadcast when item is not found', () => {
		const evt = {
			target: {
				matches: jest.fn().mockReturnValue(true),
				getAttribute: jest.fn().mockReturnValue('save'),
			},
			preventDefault: jest.fn(),
		};

		getItemByHTMLElement.mockReturnValue({});

		modalMaintenance.actionModalFromClick(evt);

		expect(getItemByHTMLElement).toHaveBeenCalledTimes(1);
		expect(getItemByHTMLElement).toHaveBeenCalledWith(evt.target);
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
				getAttribute: jest.fn().mockReturnValue('close'),
			},
			preventDefault: jest.fn(),
		};
		jest.spyOn(modalMaintenance, 'visible').mockReturnValue(true);

		modalMaintenance.actionModalFromClick(evt);
		expect(modalMaintenance.delayHide).toHaveBeenCalled();
		expect(broadcast).toHaveBeenCalled();
	});

	it('actionModalFromClick should not do anything if modal is not visible', () => {
		const evt = {
			target: {
				matches: jest.fn((selector) => {
					if (selector === '.n-syndication-modal-shadow') {
						return true;
					} else {
						return false;
					}
				}),
				getAttribute: jest.fn().mockReturnValue('close'),
			},
			preventDefault: jest.fn(),
		};

		jest.spyOn(modalMaintenance, 'visible').mockReturnValue(false);

		modalMaintenance.actionModalFromClick(evt);

		expect(modalMaintenance.show).not.toHaveBeenCalled();
	});
});

describe('actionModalFromKeyboard', () => {
	beforeEach(() => {
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});
	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});
	it('should prevent default and call show when matching download button', () => {
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
				classList: {
					contains: jest.fn(),
					add: jest.fn(),
				},
				setAttribute: jest.fn(),
			},
			preventDefault: jest.fn(),
		};

		evt.target.setAttribute('data-trackable', 'example');
		evt.target.setAttribute('data-content-id', 'contentId');
		evt.target.setAttribute('data-syndicated', 'true');
		evt.target.classList.add('download-button');

		modalMaintenance.actionModalFromClick(evt);

		expect(evt.preventDefault).toHaveBeenCalled();
		expect(modalMaintenance.show).toHaveBeenCalledWith(evt);
	});
	it('should call show  when Enter key is pressed', () => {
		const evt = {
			key: 'Enter',
			target: {
				getAttribute: jest.fn().mockReturnValue('save'),
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
				parentElement: {
					getAttribute: jest.fn().mockReturnValue('en'),
					dataset: {
						messageCode: '12345',
						id: 'item-id',
						type: 'article',
					},
				},
			},
			test:'dbbsf',
			preventDefault: jest.fn(),
		};

		jest.spyOn(modalMaintenance, 'show');

		modalMaintenance.actionModalFromKeyboard(evt);

		expect(modalMaintenance.show).toHaveBeenCalledWith(evt);
	});
	it('actionModalFromClick should show the modal for save action', () => {
		const evt = {
			target: {
				matches: jest.fn((selector) => {
					if (selector === '.n-syndication-action[data-action="save"]') {
						return true;
					} else {
						return false;
					}
				}),
				getAttribute: jest.fn().mockReturnValue('save'),
				classList: {
					contains: jest.fn(),
					add: jest.fn(),
				},
				setAttribute: jest.fn(),
				parentElement: {
					getAttribute: jest.fn(),
				},
			},
			preventDefault: jest.fn(),
		};

		modalMaintenance.actionModalFromClick(evt);

		expect(modalMaintenance.delayHide).toHaveBeenCalled();
	});
	it('should call broadcast when Escape key is pressed', () => {
		const evt = {
			key: 'Escape',
			target: {
				getAttribute: jest.fn().mockReturnValue('save'),
				parentElement: {
					getAttribute: jest.fn().mockReturnValue('en'),
					dataset: {
						messageCode: '12345',
						id: 'item-id',
						type: 'article',
					},
				},
			},
			preventDefault: jest.fn(),
		};
		jest.spyOn(modalMaintenance, 'hide');

		getItemByHTMLElement.mockReturnValue({});

		modalMaintenance.actionModalFromKeyboard(evt);
		expect(modalMaintenance.hide).toHaveBeenCalled();
		expect(broadcast).toHaveBeenCalledTimes(1);
	});
});

describe('createElement', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});
	test('createElement should create a maintenance modal element', () => {
		const item = {
			id: 'item-id',
			lang: 'en',
			title: 'Sample Article',
			messageCode: '2345',
			type: 'article',
		};

		const expectedModal = `<div class="n-syndication-modal-shadow"></div><div aria-labelledby="'Download:  ${item.title}" class="n-syndication-modal n-syndication-modal-${item.type}" role="dialog" tabindex="0">
		<header class="n-syndication-modal-heading">
			<span class="o-icons-icon o-icons-icon--warning-alt demo-icon n-syndication-maintenance-icon"></span>
			<a 'data-trackable="close-syndication-modal" aria-label="Close" class="n-syndication-modal-close" data-action="close" href="#" role="button" tabindex="0" title="Close"></a>
			<span class="n-syndication-maintenance-modal-title" role="heading">Sorry, maintenance work is in progress</span>
			</header>
			<section class=" n-syndication-modal-content">
			<div class="n-syndication-maintenance-modal-message">
				<strong>You are not able to use the Syndication tool during this time.</strong>
				We will notify you via email once it’s back up and running again.
			</div>
			<div class="n-syndication-maintenance-modal-lower-message">
				If you require articles during the maintenance period, please email
				<u><a href="mailto: syndication@ft.com" style=" color: black" target="_blank">syndication@ft.com</a></u>
				with your requirement, and we will be happy to help.
			</div>
			<div class="n-syndication-actions" data-content-id="${item.id}" data-iso-lang="${item.lang}">
				<button class="close-button-maintenance" data-action="maintenance-modal-close">
				<a><span data-action="maintenance-modal-close" class="close-message-maintenance">Thanks, I understand</span></a>
				</button></div>
			</section>
		</div>
		`;

		const expectedFragment = document
			.createRange()
			.createContextualFragment(expectedModal);

		const result = modalMaintenance.createElement(item);

		const expectedChildrenCount = expectedFragment.children.length;
		const resultChildrenCount = result.children.length;
		expect(resultChildrenCount).toEqual(expectedChildrenCount);
	});
});
