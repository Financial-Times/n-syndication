// 'use strict';

//Mocks
jest.mock('../../../src/js/userAccess', () => ({
	getSyndicationAccess: jest.fn(),
}));
import { getSyndicationAccess } from '../../../src/js/userAccess';

jest.mock('../../../src/js/get-user-status');
import getUserStatus from '../../../src/js/get-user-status';

//Fixtures
const userFixture = require('../../fixtures/userStatus.json');

//Dependencies
import { init as initDataStore } from '../../../src/js/data-store';
import { init as initIconify } from '../../../src/js/iconify';
import { init as initDownloadModal } from '../../../src/js/modal-download';
import { init as initNavigation } from '../../../src/js/navigation';

//Subject
import { init } from '../../../src/js/index';

describe('#init should return undefined and ', function () {
	beforeEach(() => {
		initDataStore = jest.fn();
		initIconify = jest.fn();
		initDownloadModal = jest.fn();
		initNavigation = jest.fn();
	});
	afterEach(() => {
		getSyndicationAccess.mockReset();
		getUserStatus.mockReset();
	});

	test('should NOT initiate any syndication features if the syndication flag is falsy', async () => {
		const flagMock = {
			get: () => {
				return false;
			},
		};

		const subject = await init(flagMock);
		expect(subject).toBe(undefined);
		expect(getUserStatus).not.toHaveBeenCalled();
		expect(getSyndicationAccess).not.toHaveBeenCalled();
		expect(initDataStore).not.toHaveBeenCalled();
		expect(initIconify).not.toHaveBeenCalled();
		expect(initDownloadModal).not.toHaveBeenCalled();
		expect(initNavigation).not.toHaveBeenCalled();
	});

	test('should not attempt to get user status or initialise syndication when not syndication customer', async () => {
		const flagMock = {
			get: () => true,
		};

		getSyndicationAccess.mockResolvedValue(['P2', 'Tool']);
		getUserStatus.mockResolvedValue(userFixture);

		const subject = await init(flagMock);

		expect(subject).toBe(undefined);

		expect(initDataStore).not.toHaveBeenCalled();
		expect(initIconify).not.toHaveBeenCalled();
		expect(initDownloadModal).not.toHaveBeenCalled();
		expect(initNavigation).not.toHaveBeenCalled();
	});

	test('should return undefined if the user isn’t migrated and NOT initiate any syndication features ', async () => {
		const flagMock = {
			get: () => true,
		};

		//clone userFixture
		const unMigratedUser = JSON.parse(JSON.stringify(userFixture));
		unMigratedUser.migrated = false;

		getSyndicationAccess.mockResolvedValue(['S1', 'P1']);
		getUserStatus.mockResolvedValue(unMigratedUser);

		const subject = await init(flagMock);

		expect(subject).toBe(undefined);
		expect(initDataStore).not.toHaveBeenCalled();
		expect(initIconify).not.toHaveBeenCalled();
		expect(initDownloadModal).not.toHaveBeenCalled();
		expect(initNavigation).not.toHaveBeenCalled();
	});

	// 	test.skip('should initialise the republising navigation', () => { });

	//Happy path
	test('should initialise syndication features the user has republishing product code S1', async () => {
		const flagMock = {
			get: () => true,
		};

		getSyndicationAccess.mockResolvedValue(['S1', 'P1']);
		getUserStatus.mockResolvedValue(userFixture);

		const subject = await init(flagMock);

		expect(subject).toBe(undefined);
		expect(initDataStore).toHaveBeenCalledWith(userFixture);
		expect(initIconify).toHaveBeenCalledWith(userFixture);
		expect(initDownloadModal).toHaveBeenCalledWith(userFixture);
		expect(initNavigation).toHaveBeenCalledWith(userFixture);
	});

	test('should initialise syndication features including rich article access the user has republishing product code S1 and S2', async () => {
		const flagMock = {
			get: () => true,
		};

		getSyndicationAccess.mockResolvedValue(['S1', 'S2', 'P1']);
		getUserStatus.mockResolvedValue(userFixture);

		const subject = await init(flagMock);

		expect(subject).toBe(undefined);
		expect(initDataStore).toHaveBeenCalledWith(userFixture);
		expect(initIconify).toHaveBeenCalledWith(userFixture);
		expect(initDownloadModal).toHaveBeenCalledWith(userFixture);
		expect(initNavigation).toHaveBeenCalledWith(userFixture);
	});
});
