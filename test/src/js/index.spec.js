// 'use strict';

import {init} from '../../../src/js/index';

import { getSyndicationAccess } from '../../../src/js/index';

//jest.mock('next-session-client');

// const userProductResFixture = {
// 	rich_content_access: {
// 		products: 'G0,Tools,S1,S2,P0,P2',
// 		uuid: '00000000-0000-0000-000000000000',
// 	},
// 	basic_syndication: {
// 		products: 'G0,Tools,S1,P0,P2',
// 	},
// 	no_syndication: {
// 		products: 'G0,Tools,P0,P2',
// 	},
// };

describe('#init', function () {
	test('init should be a Function', function () {
		expect(typeof init).toBe('function');
	});

	test.skip('should return undefined if the syndication flag is off and not call stubs', () => { });

	// context('when syndication customer', () => {
	// 	test.skip('should return undefined if the user isn’t migrated', () => { });
	// 	test.skip('should initialise the republising navigation', () => { });
	// 	test.skip('should end if the user isn’t allowed ft.com republishing', () => { });
	// 	test.skip('should initialise the rest if allowed ft.com republishing', () => { });
	// });

	// context('when not syndication customer', () => {
	// 	test.skip('should not attempt to get user status or initialise syndication', () => { });
	// });
});

describe('#getSyndicationAccess', () => {
	test('should return an empty Array if user has no syndication products', async () => {
		const subject = await getSyndicationAccess();

		expect(Array.isArray(subject)).toBe(true);
		expect(subject.length).toEqual(0);
	});

	test.skip('should an array of syndication only of product code S1 ', async () => {

		const subject = await getSyndicationAccess();

		expect(Array.isArray(subject)).toBe(true);
		expect(subject.length).toEqual(1);
		expect(subject.includes('S1')).toBe(true);
		expect(subject.includes('S2')).toBe(false);
	});
	test.skip('should an array of syndication only product codes S1 and S2', async () => {

		const subject = await getSyndicationAccess();

		expect(Array.isArray(subject)).toBe(true);
		expect(subject.length).toEqual(2);
		expect(subject.includes('S2')).toBe(true);
	});
});
