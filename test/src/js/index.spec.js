// 'use strict';

//Mocks
jest.mock( '../../../src/js/userAccess', () => ({
	getSyndicationAccess: jest.fn(),
}));
import { getSyndicationAccess } from '../../../src/js/userAccess';

jest.mock( '../../../src/js/get-user-status');
import getUserStatus from '../../../src/js/get-user-status';

//Fixtures
//const userFixture = require('../../fixtures/userStatus.json');

//Dependencies
import {init as initDataStore} from '../../../src/js/data-store';
import {init as initIconify} from '../../../src/js/iconify';
import {init as initDownloadModal} from '../../../src/js/modal-download';
import {init as initNavigation} from '../../../src/js/navigation';

//Subject
import {init} from '../../../src/js/index';

describe('#init', function () {
	const initDataStore = jest.fn();
	const initIconify = jest.fn();
	const initDownloadModal = jest.fn();
	const initNavigation = jest.fn();

	beforeEach(() => {
		//console.log('before each', getUserStatus);
	});


	afterEach(() => {
		getSyndicationAccess.mockReset();
		getUserStatus.mockReset();
	});


	test('should return undefined if the syndication flag is false', async () => {
		const flagMock = {
			get: () => {return false;}
		};

		const subject = await init(flagMock);
		expect(subject).toBe(undefined);
	});

	test('should not attempt to get user status or initialise syndication when not syndication customer', async () => {
		const flagMock = {
			get: () => true
		};

		const userMock = {};

		getSyndicationAccess.mockResolvedValue(['P1','P2', 'Tool']);

		getUserStatus.mockResolvedValue(userMock);

		const subject = await init(flagMock);

		expect(subject).toBe(undefined);

		expect(initDataStore).not.toHaveBeenCalled();
		expect(initIconify).not.toHaveBeenCalled();
		expect(initDownloadModal).not.toHaveBeenCalled();
		expect(initNavigation).not.toHaveBeenCalled();
	});
});


// 	test.skip('should return undefined if the user isn’t migrated', () => { });
// 	test.skip('should initialise the republising navigation', () => { });
// 	test.skip('should end if the user isn’t allowed ft.com republishing', () => { });

//Happy path
test.skip('should initialise the rest if allowed ft.com republishing', async () => {
	const flagMock = {
		get: () => true
	};


	getSyndicationAccess.mockResolvedValue(['S1','S2', 'P1']);

	const subject = await init(flagMock);

	// eslint-disable-next-line no-console
	console.log('subject happy path',subject);

	expect(subject).toBe(undefined);
	expect(initDataStore).toHaveBeenCalledWith(userFixture);
	expect(initIconify).toHaveBeenCalledWith(userFixture);
	expect(initDownloadModal).toHaveBeenCalledWith(userFixture);
	expect(initNavigation).toHaveBeenCalledWith(userFixture);


});
