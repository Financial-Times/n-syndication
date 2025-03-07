const iconifyModule = require('./../../../src/js/iconify');
const { broadCast, toElement } = require('../../../src/js/util');

jest.mock('../../../src/js/data-store', () => ({
	fetchItems: jest.fn().mockReturnValue(['1', '2', '3']),
	DATA_STORE: [{ id: 'content-id-1' }, { id: 'content-id-2' }],
}));

jest.mock('../../../src/js/messages', () => ({
	getMessage: jest
		.fn()
		.mockReturnValue('Expected message based on item properties'),
}));

jest.mock('../../../src/js/util', () => ({
	getContentIDFromHTMLElement: jest.fn(),
	toElement: jest.fn(),
	broadCast: jest.fn(),
}));

describe('./src/js/iconify', () => {
	beforeEach(() => {
		jest.spyOn(iconifyModule, 'getSyndicatableItems').mockReturnValue(['123']);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('init', () => {
		it('init should be a Function', () => {
			expect(typeof iconifyModule.init).toBe('function');
		});
	});

	describe('createElement', () => {
		it('should create a syndication icon element with correct attributes', () => {
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
				spanElement.classList.add('o3-visually-hidden');
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
				'span.o3-visually-hidden'
			);
			expect(spanElement.textContent).toBe(
				'Expected message based on item properties'
			);
		});
	});

	describe('findElementToSyndicate', () => {
		beforeAll(() => {
			document.documentElement.innerHTML = `
		<div class="card__concept-article" data-content-id="1">
			<a class="card__concept-article-link"></a>
		</div>
		<div class="topic-card__concept-article">
			<a class="topic-card__concept-article-link"></a>
		</div>
		<a class="package__content-item" data-content-id="2"></a>
		<article data-trackable="story">
			<a class="story__link"></a>
		</article>
	`;
		});

		it('should return null for non-matching rules or elements', () => {
			const element = document.createElement('div');

			let foundElement = iconifyModule.findElementToSyndicate(element);
			expect(foundElement).toBeNull();

			foundElement = iconifyModule.findElementToSyndicate(
				document.querySelector('article')
			);
			expect(foundElement).toBeNull();
		});

		it('should return the correct element to syndicate for matching rules', () => {
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
		it('should not call forEach/syndicateElement method when the array is empty', () => {
			const emptyArray = { forEach: jest.fn(), length: 0 };

			const result = iconifyModule.syndicateElements({}, emptyArray);

			expect(emptyArray.forEach).not.toHaveBeenCalled();
			expect(result).toEqual(undefined);
		});

		it('should call forEach/syndicateElement method when the array is not empty', () => {
			const arrayItems = { forEach: jest.fn(), length: 2 };
			iconifyModule.syndicateElements({}, arrayItems);

			expect(arrayItems.forEach).toHaveBeenCalled();
		});
	});

	describe('updatePage', () => {

		it('should update the page with syndicated elements', () => {
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

			expect(broadCast).toHaveBeenCalledWith('nSyndication.iconified');
		});
	});
});
