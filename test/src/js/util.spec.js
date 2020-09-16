'use strict';

const subject = require('../../../src/js/util');

describe('./src/js/util', function () {
	it('cheapClone should be a Function', function () {
		expect(typeof subject.cheapClone).toBe('function');
	});
});
