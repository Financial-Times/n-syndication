'use strict';

const underTest = require('../../../src/js/config');

describe('./src/js/config', function () {
	test('config should be an Object', function () {
		expect(typeof underTest).toBe('object');
	});
});
