/**
 * @jest-environment jsdom
 */
'use strict';

const { interpolate,
	cheapClone,
	getContentAttributeFromHTMLElement,
	getContentIDFromHTMLElement,
	getContentIDFromHref,
	prepend,
	toElement } = require('../../../src/js/util');

describe('./src/js/util', function () {
	test('cheapClone should be a Function', function () {
		expect(typeof cheapClone).toBe('function');
	});

	describe('cheapClone', function () {
		test('should clone an object', function () {
			const obj = { foo: 'bar' };
			const clonedObj = cheapClone(obj);
			expect(clonedObj).toEqual(obj);
			expect(clonedObj).not.toBe(obj);
		});

		test('should clone an array', function () {
			const arr = [1, 2, 3];
			const clonedArr = cheapClone(arr);
			expect(clonedArr).toEqual(arr);
			expect(clonedArr).not.toBe(arr);
		});

	});

	test('getContentAttributeFromHTMLElement should return the attribute value', function () {
		const el = document.createElement('div');
		el.setAttribute('data-content-id', '123');
		const attrValue = getContentAttributeFromHTMLElement(el);
		expect(attrValue).toBe('123');
	});

	test('getContentAttributeFromHTMLElement should return null if the attribute is not found', function () {
		const el = document.createElement('div');
		const attrValue = getContentAttributeFromHTMLElement(el);
		expect(attrValue).toBe(null);
	});


	test('getContentIDFromHTMLElement should return the content ID from data-content-id', function () {
		const el = document.createElement('div');
		el.setAttribute('data-content-id', '123');
		const contentID = getContentIDFromHTMLElement(el);
		expect(contentID).toBe('123');
	});

	test('getContentIDFromHTMLElement should return the content ID from data-id', function () {
		const el = document.createElement('div');
		el.setAttribute('data-id', '456');
		const contentID = getContentIDFromHTMLElement(el);
		expect(contentID).toBe('456');
	});

	test('getContentIDFromHTMLElement should extract the content ID from anchor href', function () {
		const el = document.createElement('div');
		const anchor = document.createElement('a');
		anchor.setAttribute('href', '/path/to/content');
		el.appendChild(anchor);
		const contentID = getContentIDFromHTMLElement(el);
		expect(contentID).toBe('content');
	});


	test('getContentIDFromHref should extract the content ID with "#" character', function () {
		const id = getContentIDFromHref('/path/to/content#section1');
		expect(id).toBe('/path/to/content');
	});

	test('getContentIDFromHref should extract the content ID with "?" character', function () {
		const id = getContentIDFromHref('/path/to/content?param=value');
		expect(id).toBe('/path/to/content');
	});


	test('prepend should prepend an element to parent', function () {
		const parent = document.createElement('div');
		const child1 = document.createElement('div');
		const child2 = document.createElement('div');
		parent.appendChild(child2);
		prepend(parent, child1);
		expect(parent.childNodes[0]).toBe(child1);
		expect(parent.childNodes[1]).toBe(child2);
	});


	test('toElement should convert HTML string to DOM fragment', function () {
		const html = '<div><p>Paragraph 1</p><p>Paragraph 2</p></div>';
		const fragment = toElement(html);
		expect(fragment.children.length).toBe(1);
		expect(fragment.children[0].tagName).toBe('DIV');
		expect(fragment.children[0].children.length).toBe(2);
	});


	test('interpolate should replace placeholders with values from the object', function () {
		const str = 'Hello, {{name}}! You are {{age}} years old.';
		const obj = { name: 'John', age: 30 };
		const result = interpolate(str, obj);
		expect(result).toBe('Hello, John! You are 30 years old.');
	});

});
