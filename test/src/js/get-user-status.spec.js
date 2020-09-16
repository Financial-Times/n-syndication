'use strict';

const subject = require('../../../src/js/get-user-status') ;

describe.skip('./src/js/get-user-status', function () {
	it('getUserStatus should be a Function', function () {
		expect(typeof subject).toBe('function');
	});
});
