import {
	init,
	insertDesktopNavItem,
	buildNavItem,
	insertDrawerNavItem,
} from '../../../src/js/navigation';
import { broadCast } from '../../../src/js/util';

jest.mock('../../../src/js/util', () => ({
	broadCast: jest.fn(),
}));

describe('./src/js/navigation', () => {
	beforeEach(() => {
		document.body.innerHTML = `
		<div id="o-header-nav-desktop">
			<div class="o-header__container"></div>
		</div>
		<div id="o-header-drawer">
			<a data-trackable="Portfolio"></a>
		</div>
	`;
		jest.spyOn(document, 'querySelector');
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});

	test('insertDesktopNavItem should insert the nav item into the desktop nav', () => {
		const user = { contract_id: '123' };
		const container = document.querySelector('.o-header__container');
		const userNav = document.createElement('ul');
		userNav.setAttribute('data-trackable', 'user-nav');
		container.appendChild(userNav);

		insertDesktopNavItem(user);
		expect(document.querySelector).toHaveBeenCalledTimes(2);
		expect(userNav.childElementCount).toBe(1);
		const navItem = userNav.querySelector('.o-header__nav-item');
		expect(navItem).not.toBeNull();
	});

	test('insertDrawerNavItem should insert the nav item into the drawer nav', () => {
		const user = { contract_id: '123' };

		insertDrawerNavItem(user);

		expect(document.querySelector).toHaveBeenCalledTimes(1);
		const drawerNavItem = document.querySelector(
			'#o-header-drawer .o-header__nav-item'
		);
		expect(drawerNavItem).not.toBeNull();
	});

	test('init should insert nav items in both desktop and drawer navs', () => {
		const user = { contract_id: '123' };

		init(user);
		expect(document.querySelector).toHaveBeenCalledTimes(2);
		const desktopNavItem = document.querySelector(
			'#o-header-nav-desktop .o-header__nav-item'
		);
		expect(desktopNavItem).not.toBeNull();

		const drawerNavItem = document.querySelector(
			'#o-header-drawer .o-header__nav-item'
		);
		expect(drawerNavItem).not.toBeNull();
	});

	test('buildNavItem should create a nav item with the correct attributes and event listener', () => {
		const user = { contract_id: '123' };

		const navItem = buildNavItem(user);

		expect(navItem.classList.contains('o-header__nav-item')).toBe(true);
		expect(navItem.getAttribute('data-trackable')).toBe('syndication');

		const navLink = navItem.querySelector('.o-header__nav-link');
		expect(navLink.classList.contains('o-header__nav-link')).toBe(true);
		expect(navLink.getAttribute('data-trackable')).toBe('Republishing');
		expect(navLink.getAttribute('href')).toBe('/republishing/contract');
		expect(navLink.textContent).toBe('Republishing');

		// Simulate a click event and check if the event listener is called
		navLink.dispatchEvent(new Event('click'));
		expect(broadCast).toHaveBeenCalled();
	});

	test('init should not insert nav items if the container elements are not found', () => {
		const user = { contract_id: '123' };

		jest.spyOn(document, 'querySelector').mockReturnValue(null);
		jest.spyOn(document, 'createElement');

		init(user);

		expect(document.querySelector).toHaveBeenCalledTimes(2);
		expect(document.querySelector).toHaveBeenCalledWith(
			'#o-header-nav-desktop'
		);
		expect(document.querySelector).toHaveBeenCalledWith('#o-header-drawer');

		expect(document.createElement).not.toHaveBeenCalled();
	});
	test('insertDesktopNavItem should not insert the nav item if the container element is not found', () => {
		const user = { contract_id: '123' };

		jest.spyOn(document, 'querySelector').mockReturnValue(null);
		jest.spyOn(document, 'createElement');

		insertDesktopNavItem(user);

		expect(document.querySelector.mock.calls.length).toBe(1);
		expect(document.querySelector.mock.calls[0][0]).toBe('#o-header-nav-desktop');

		expect(document.createElement).not.toHaveBeenCalled();
	});
	test('insertDrawerNavItem should not insert the nav item if the container or nav link element is not found', () => {
		const user = { contract_id: '123' };

		jest
			.spyOn(document, 'querySelector')
			.mockReturnValueOnce(null)
			.mockReturnValueOnce({ querySelector: () => null });
		jest.spyOn(document, 'createElement');

		insertDrawerNavItem(user);

		expect(document.querySelector.mock.calls.length).toBe(1);
		expect(document.querySelector.mock.calls[0][0]).toBe('#o-header-drawer');

		expect(document.createElement).not.toHaveBeenCalled();
	});
});
