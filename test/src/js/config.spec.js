'use strict';

const subject = require('../../../src/js/config');

describe('./src/js/config', function () {
	test('config should be an Object', function () {
		expect(typeof subject).toEqual('object');
	});
});
