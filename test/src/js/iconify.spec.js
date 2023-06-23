const iconifyModule = require('./../../../src/js/iconify');

import { toElement } from '../../../src/js/util';

import { fetchItems } from '../../../src/js/data-store';
import { broadcast } from 'n-ui-foundations';

jest.mock('../../../src/js/data-store', () => ({
	fetchItems: jest.fn().mockReturnValue(['1', '2', '3']),
	DATA_STORE: [{ id: 'content-id-1' }, { id: 'content-id-2' }],
}));

jest.mock('n-ui-foundations', () => ({
	$$: jest.fn(),
	broadcast: jest.fn(),
}));

jest.mock('../../../src/js/messages', () => ({
	getMessage: jest
		.fn()
		.mockReturnValue('Expected message based on item properties'),
}));

jest.mock('../../../src/js/util', () => ({
	getContentIDFromHTMLElement: jest.fn(),
	toElement: jest.fn(),
}));

describe('./src/js/iconify', () => {
	beforeEach(() => {
		jest.spyOn(iconifyModule, 'getSyndicatableItems').mockReturnValue(['123']);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	test('init should be a Function', () => {
		expect(typeof iconifyModule.init).toBe('function');
	});

	describe('createElement', () => {
		test('should create a syndication icon element with correct attributes', () => {
			const item = {
				messageCode: '123',
				lang: 'en',
				id: 'content-id',
				type: 'article',
			};

			toElement.mockImplementation((html) => {
				const ct = document.createElement('div');
				ct.insertAdjacentHTML('afterbegin', html);

				const buttonElement = document.createElement('button');
				buttonElement.classList.add('n-syndication-icon');
				buttonElement.setAttribute('data-content-id', 'content-id');
				buttonElement.setAttribute('data-iso-lang', 'en');
				buttonElement.setAttribute('data-content-type', 'article');
				buttonElement.setAttribute('data-syndicated', 'true');

				const spanElement = document.createElement('span');
				spanElement.classList.add('o-normalise-visually-hidden');
				spanElement.textContent = 'Expected message based on item properties';

				buttonElement.appendChild(spanElement);

				return buttonElement;
			});

			const element = iconifyModule.createElement(item);

			expect(element.tagName).toBe('BUTTON');
			expect(element.classList).toContain('n-syndication-icon');
			expect(element.getAttribute('data-content-id')).toBe('content-id');
			expect(element.getAttribute('data-iso-lang')).toBe('en');
			expect(element.getAttribute('data-content-type')).toBe('article');
			expect(element.getAttribute('data-syndicated')).toBe('true');

			const spanElement = element.querySelector(
				'span.o-normalise-visually-hidden'
			);
			expect(spanElement.textContent).toBe(
				'Expected message based on item properties'
			);
		});
	});

	describe('findElementToSyndicate', () => {
		beforeAll(() => {
			document.documentElement.innerHTML = `
		<div class="card__concept-article">
			<a class="card__concept-article-link"></a>
		</div>
		<div class="topic-card__concept-article">
			<a class="topic-card__concept-article-link"></a>
		</div>
		<a class="package__content-item"></a>
		<article data-trackable="story">
			<a class="story__link"></a>
		</article>
	`;
		});

		test('should return null for non-matching rules or elements', () => {
			const element = document.createElement('div');

			let foundElement = iconifyModule.findElementToSyndicate(element);
			expect(foundElement).toBeNull();

			foundElement = iconifyModule.findElementToSyndicate(
				document.querySelector('article')
			);
			expect(foundElement).toBeNull();
		});

		test('should return the correct element to syndicate for matching rules', () => {
			const elements = {
				'.card__concept-article-link': document.querySelector(
					'.card__concept-article-link'
				),
				'.topic-card__concept-article-link': document.querySelector(
					'.topic-card__concept-article-link'
				),
				'a.package__content-item': document.querySelector(
					'a.package__content-item'
				),
				'.story__link': document.querySelector('.story__link'),
			};

			Object.entries(elements).forEach(([, element]) => {
				const foundElement = iconifyModule.findElementToSyndicate(element);
				expect(foundElement).toBe(
					element.closest(
						'.card__concept-article, .topic-card__concept-article, .package__title, article[data-trackable="story"]'
					)
				);
			});
		});
	});
	describe('syndicateElements', () => {
		function createMockElement (tagName) {
			return {
				tagName: tagName,
				classList: {
					contains: jest.fn(() => true),
				},
				getAttribute: jest.fn(),
				setAttribute: jest.fn(),
				querySelector: jest.fn(() => ({
					not: {
						toBeNull: jest.fn(),
					},
				})),
			};
		}

		test('should syndicate an item to multiple elements', () => {
			const item = {
				id: 'content-id',
				type: 'article',
				canBeSyndicated: true,
			};
			jest.spyOn(iconifyModule, 'syndicateElement');

			const elements = [
				createMockElement('button'),
				createMockElement('form'),
				createMockElement('form'),
			];

			iconifyModule.syndicateElements(item, elements);

			expect(iconifyModule.syndicateElement).toHaveBeenCalled();
		});
	});

	describe('updatePage', () => {
		test('should update the page with syndicated elements', () => {
			const elements = [
				{
					classList: { contains: jest.fn(() => true) },
					setAttribute: jest.fn(),
					tagName: 'form',
					matches: jest.fn(),
					getAttribute: jest.fn(() => 'content-id-1'),
				},
				{
					classList: { contains: jest.fn(() => true) },
					setAttribute: jest.fn(),
					matches: jest.fn(),
					tagName: 'button',
					getAttribute: jest.fn(() => 'content-id-1'),
				},
				{
					classList: { contains: jest.fn(() => true) },
					setAttribute: jest.fn(),
					tagName: 'a',
					matches: jest.fn(),
					getAttribute: jest.fn(() => 'content-id-2'),
				},
			];

			iconifyModule.updatePage(elements);

			expect(broadcast).toHaveBeenCalledWith('nSyndication.iconified');
		});
	});

	describe('init', () => {
		test('should call syndicate and updatePage functions and attach event listeners', () => {
			const user = { id: 'user-id', contract_id: '123' };

			jest.spyOn(iconifyModule, 'syndicate');
			const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

			const itemIDs = ['1', '2', '3'];

			fetchItems.mockReturnValue(itemIDs);

			iconifyModule.init(user);

			expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'asyncContentLoaded',
				expect.any(Function),
				true
			);
			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'nSyndication.dataChanged',
				expect.any(Function),
				true
			);

			expect(iconifyModule.syndicate).toHaveBeenCalled();
		});
	});
});
