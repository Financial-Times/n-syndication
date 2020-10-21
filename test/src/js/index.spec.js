'use strict';



const underTest = require('../../../src/js/index');

describe('#init', function () {
	test('init should be a Function', function () {
		expect(typeof underTest.init).toBe('function');
	});

	test.skip('should return undefined if the syndication flag is off and not call stubs', () => { });
	test.skip('should return undefined if the user isn’t migrated', () => { });
	test.skip('should initialise the republising navigation', () => { });
	test.skip('should end if the user isn’t allowed ft.com republishing', () => { });
	test.skip('should initialise the rest if allowed ft.com republishing', () => { });
	test.skip('should not attempt to get user status or initialise syndication', () => { });

});

describe('#checkIfUserIsSyndicationCustomer', () => {
	test.skip('should return true if user has the S1 product code in their products', () => { });
	test.skip('should return false if user doesn’t have the S1 product code in their products', () => { });
	test.skip('should return false if there was an error fetching the products', () => { });
});
