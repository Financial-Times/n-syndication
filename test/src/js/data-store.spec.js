'use strict';

const subject = require('../../../src/js/data-store');

describe('./src/js/data-store', function () {
	test('init should be a Function', function () {
		expect(typeof subject.init).toBe('function');
	});
});
