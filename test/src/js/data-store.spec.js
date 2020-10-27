'use strict';

const underTest = require('../../../src/js/data-store');

describe('./src/js/data-store', function () {
	test('init should be a Function', function () {
		expect(typeof underTest.init).toBe('function');
	});
});
