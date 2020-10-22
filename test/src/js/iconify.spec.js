'use strict';



const underTest = require('../../../src/js/iconify');

describe('./src/js/iconify', function () {
	test('init should be a Function', function () {
		expect(typeof underTest.init).toBe('function');
	});
});
