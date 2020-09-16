'use strict';;

const subject = require('../../../src/js/iconify');

describe('./src/js/iconify', function () {
	it('init should be a Function', function () {
		expect(typeof subject.init).toBe('function');
	});
});
