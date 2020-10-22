'use strict';

const underTest = require('../../../src/js/get-user-status');

describe('./src/js/get-user-status', function () {
	test('getUserStatus should be an Object', function () {
		expect(typeof underTest).toBe('object');
	});
});
