jest.mock('next-session-client');
import {products as getUserProducts}from 'next-session-client';
//Fixtures
import userProductResFixture from '../../fixtures/userProducts';
//Subjects
import {getSyndicationAccess, checkIfUserIsSyndicationCustomer} from '../../../src/js/user-access';

describe('checkIfUserIsSyndicationCustomer', () => {
	afterEach(() => {
		getUserProducts.mockReset();
	});

	test('should return FALSE if getUserProducts call fails', async () => {

		getUserProducts.mockResolvedValue(new Error('Some error from next-session client'));

		const subject = await checkIfUserIsSyndicationCustomer();

		expect(subject).toBe(false);
	});


	test('should return FALSE if user has no syndication product codes', async () => {

		getUserProducts.mockResolvedValue(userProductResFixture.no_syndication);

		const subject = await checkIfUserIsSyndicationCustomer();

		expect(subject).toBe(false);
	});

	test('should return TRUE if user has syndication product code S1', async () => {

		getUserProducts.mockResolvedValue(userProductResFixture.basic_syndication);

		const subject = await checkIfUserIsSyndicationCustomer();

		expect(subject).toBe(true);
	});

	test('should return TRUE if user has syndication product code S1 and S2', async () => {

		getUserProducts.mockResolvedValue(userProductResFixture.rich_content_access);

		const subject = await checkIfUserIsSyndicationCustomer();

		expect(subject).toBe(true);
	});

});

describe('#getSyndicationAccess', () => {

	afterEach(() => {
		getUserProducts.mockReset();
	});

	test('should return an empty Array if getUserProducts rejects', async () => {
		//Silent fail of user access!?
		getUserProducts.mockResolvedValue(new Error('Some error from next-session client'));

		const subject = await getSyndicationAccess();

		expect(Array.isArray(subject)).toBe(true);
		expect(subject.length).toEqual(0);
	});

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
