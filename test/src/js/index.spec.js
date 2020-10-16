// 'use strict';

//Mocks
jest.mock('next-session-client');
//import getUserStatus from '../../../src/js/get-user-status';
//Fixtures
//import getSyndicationAccess from '../../../src/js/get-user-status';
//Subjects
import {init} from '../../../src/js/index';

describe('#init', function () {

	//getUserStatus = jest.fn();

	beforeEach(() => {


	});


	test('should return undefined if the syndication flag is false', async () => {
		const flagMock = {
			get: () => false
		};

		const subject = await init(flagMock);

		expect(subject).toBe(undefined);

	});

	test.skip('should not attempt to get user status or initialise syndication when not syndication customer', async () => {
		const flagMock = {
			get: () => true
		};

		const subject = await init(flagMock);

		expect(subject).toBe(undefined);
	});
});

// context('when syndication customer', () => {
// 	test.skip('should return undefined if the user isn’t migrated', () => { });
// 	test.skip('should initialise the republising navigation', () => { });
// 	test.skip('should end if the user isn’t allowed ft.com republishing', () => { });
// 	test.skip('should initialise the rest if allowed ft.com republishing', () => { });
// });

