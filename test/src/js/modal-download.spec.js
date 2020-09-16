'use strict';

const subject = require('../../../src/js/modal-download');

describe('./src/js/modal-download', function () {
	it('init should be a Function', function () {
		expect(typeof subject.init).toBe('function');
	});
});
