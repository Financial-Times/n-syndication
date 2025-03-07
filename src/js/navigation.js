'use strict';

import { $ } from 'n-ui-foundations';
import { broadCast } from './util';

function buildNavItem (user) {
	const elNavItemLink = document.createElement('a');
	elNavItemLink.classList.add('o-header__nav-link');
	elNavItemLink.classList.add('n-syndication-republishing');
	elNavItemLink.setAttribute('data-trackable', 'Republishing');
	elNavItemLink.setAttribute('href', '/republishing/contract');
	elNavItemLink.textContent = 'Republishing';
	elNavItemLink.addEventListener('click', (evt) => {
		broadCast('oTracking.event', {
			category: 'syndication',
			action: 'Republishing',
			contractID: user.contract_id,
			product: 'syndication',
			referrer: location.href,
			url: evt.target.href || evt.target.getAttribute('href'),
		});
	});

	const elNavItem = document.createElement('li');
	elNavItem.classList.add('o-header__nav-item');
	elNavItem.setAttribute('data-trackable', 'syndication');
	elNavItem.appendChild(elNavItemLink);

	return elNavItem;
}

function insertDesktopNavItem (user) {
	const elCt = $('#o-header-nav-desktop');
	if (!elCt) {
		return;
	}

	const container = elCt.querySelector('.o-header__container');
	if (!container) {
		return;
	}

	let userNav = container.querySelector('[data-trackable="user-nav"]');
	if (!userNav) {
		userNav = document.createElement('ul');
		userNav.classList.add('o-header__nav-list');
		userNav.classList.add('o-header__nav-list--right');
		userNav.setAttribute('data-trackable', 'user-nav');
		container.appendChild(userNav);
	}

	const elNavItem = buildNavItem(user);
	userNav.appendChild(elNavItem);
}

function insertDrawerNavItem (user) {
	const elCt = $('#o-header-drawer');
	if (!elCt) {
		return;
	}

	const navLink = elCt.querySelector('[data-trackable="Portfolio"]');
	if (!navLink) {
		return;
	}

	const elNavItem = buildNavItem(user);
	const elInsertionPoint = navLink.parentElement;
	elInsertionPoint.insertAdjacentElement('afterend', elNavItem);
}

function init (user) {
	insertDesktopNavItem(user);
	insertDrawerNavItem(user);
}

export {
	init,
	insertDrawerNavItem,
	insertDesktopNavItem,
	buildNavItem
};
