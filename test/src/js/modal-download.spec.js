/**
 * @jest-environment jsdom
 */
'use strict';



const underTest = require('../../../src/js/modal-download');

describe('./src/js/modal-download', function () {
	test('init should be a Function', function () {
		expect(typeof underTest.init).toBe('function');
	});
});
