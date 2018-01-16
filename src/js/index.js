import {$$, $} from 'n-ui-foundations';
import {products as getUserProducts} from 'next-session-client';
import getUserStatus from './get-user-status';
import {init as initRedux} from './redux';

const SYNDICATION_PRODUCT_CODE = 'S1';
const SYNDICATION_USER_ATTR = 'data-syndication-user';
const SYNDICATION_LINK_CLASS = 'o-teaser__syndication-indicator';
const TEASER_SELECTOR = '.o-teaser--syndicatable, .o-teaser--not-syndicatable';

const createSyndicationLinkOld = (uuid, title, syndicationStatus) => {
	const a = document.createElement('a');
	a.href = `http://ftsyndication.com/redirect.php?uuid=${uuid}`;
	a.target = '_blank';
	a.rel = 'noopener';
	a.classList.add(SYNDICATION_LINK_CLASS);
	a.classList.add(SYNDICATION_LINK_CLASS+'--'+syndicationStatus);
	a.innerHTML = `<span>Download “${title || 'article'}” (opens in a new window)</span>`;
	return a;
};

function checkIfUserIsSyndicationCustomer () {
	let userIsSyndicationCustomer = false;
	return getUserProducts()
		.then(response => {
			if (response && response.products) {
				userIsSyndicationCustomer = response.products.includes(SYNDICATION_PRODUCT_CODE);
			}
		})
		.catch(err => err)
		.then(() => userIsSyndicationCustomer);
}

function updateTeasers (teasers, createSyndicator){
	teasers.forEach(teaser => updateTeaser(teaser, createSyndicator));
}

function updateTeaser (teaser, createSyndicator){
	const syndicationStatus = teaser.classList.contains('o-teaser--syndicatable') ? 'yes' : 'no';
	const heading = teaser.querySelector('.o-teaser__heading');
	if(heading.querySelector('.'+SYNDICATION_LINK_CLASS)){
		return;
	}
	const link = heading.querySelector('a');
	const uuid = link.pathname.replace('/content/', '');
	const title = link.textContent;
	heading.insertBefore(createSyndicator(uuid, title, syndicationStatus), link);
}

function updateMainArticle (article, createSyndicator){
	const syndicationStatus = article.getAttribute('data-syndicatable');
	//TODO: Use data-attributes instead of relying on HTML classes
	const container = article.querySelector('.topper__headline') || article.querySelector('.article-headline');
	const title = container.querySelector('.article-classifier__gap');
	const uuid = article.getAttribute('data-content-id');
	container.insertBefore(createSyndicator(uuid, title, syndicationStatus), title);
}

function updateGenerics (generics, createSyndicator){
	generics.forEach(generic => updateGeneric(generic, createSyndicator));
}

function updateGeneric (container, createSyndicator){
	const uuid = container.getAttribute('data-syndicatable-uuid');
	const title = container.querySelector('[data-syndicatable-title]').innerHTML;
	const syndicationStatus = container.getAttribute('data-syndicatable');
	const target = container.querySelector('[data-syndicatable-target]');

	target.parentNode.insertBefore(createSyndicator(uuid, title, syndicationStatus), target);
}

function onAsyncContentLoaded (createSyndicator){
	const syndicatableTeasers = $$(TEASER_SELECTOR);
	updateTeasers(syndicatableTeasers, createSyndicator);
}

function init (flags){
	if (!flags.get('syndication')) {
		return;
	}

	checkIfUserIsSyndicationCustomer().then(userIsSyndicationCustomer => {
		if(!userIsSyndicationCustomer){
			return;
		}

		getUserStatus().then(user => {
			if (user && user.migrated === true || flags.get('syndicationRedux')) {
				return initRedux(flags, user);
			}

			if(!flags.get('syndication')){
				return;
			}

			const syndicatableTeasers = $$(TEASER_SELECTOR);
			const syndicatableMainArticle = $('.article[data-syndicatable]');

			// TODO: update article pages to use generic style?
			const syndicatableGenerics = $$('[data-syndicatable]:not(.article)');

			if(!syndicatableTeasers.length && !syndicatableMainArticle && !syndicatableGenerics.length){
				return;
			}

			document.body.setAttribute(SYNDICATION_USER_ATTR, 'true');

			document.body.addEventListener('asyncContentLoaded', () => onAsyncContentLoaded(createSyndicationLinkOld));

			if(syndicatableTeasers.length){
				updateTeasers(syndicatableTeasers, createSyndicationLinkOld);
			}

			if(syndicatableMainArticle){
				updateMainArticle(syndicatableMainArticle, createSyndicationLinkOld);
			}

			if (syndicatableGenerics.length){
				updateGenerics(syndicatableGenerics, createSyndicationLinkOld);
			}
		});
	});
}

export {
	init,
	checkIfUserIsSyndicationCustomer
};
