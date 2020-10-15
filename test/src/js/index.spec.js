// 'use strict';

//Mocks
jest.mock('next-session-client');
import {products as getUserProducts}from 'next-session-client';
//Fixtures
import userProductResFixture from '../../fixtures/userProducts';
//Subjects
import {init} from '../../../src/js/index';
import { getSyndicationAccess } from '../../../src/js/index';

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

	afterEach(() => {
		getUserProducts.mockReset();
	});
	// eslint-disable-next-line no-console
	//getUserProducts().then(val => console.log(val) );

	test('should return an empty Array if user has no syndication product codes', async () => {

		getUserProducts.mockResolvedValue(userProductResFixture.no_syndication);

		const subject = await getSyndicationAccess();

		expect(Array.isArray(subject)).toBe(true);
		expect(subject.length).toEqual(0);
	});

	test('should return an array of ["S1"] if use has basic syndication accsss of S1 ', async () => {

		getUserProducts.mockResolvedValue(userProductResFixture.basic_syndication);

		const subject = await getSyndicationAccess();

		expect(Array.isArray(subject)).toBe(true);
		expect(subject.length).toEqual(1);
		expect(subject.includes('S1')).toBe(true);
		expect(subject.includes('S2')).toBe(false);
	});

	test('should return an array of ["S1", "S2"] to denote syndication rich article access', async () => {

		getUserProducts.mockResolvedValue(userProductResFixture.rich_content_access);
		const subject = await getSyndicationAccess();

		expect(Array.isArray(subject)).toBe(true);
		expect(subject.length).toEqual(2);
		expect(subject.includes('S2')).toBe(true);
	});
});
