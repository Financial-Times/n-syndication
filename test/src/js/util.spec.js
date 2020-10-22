'use strict';



const underTest = require('../../../src/js/util');

describe('./src/js/util', function () {
	test('cheapClone should be a Function', function () {
		expect(typeof underTest.cheapClone).toBe('function');
	});
});
