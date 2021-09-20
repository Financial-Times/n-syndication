# n-syndication [![CircleCI](https://circleci.com/gh/Financial-Times/n-syndication.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-syndication)

A client side library available as a Bower component that displays links next to headlines allowing syndication customers to download or save content for republishing.

## What is Syndication and how does it work

For an explanation, including a Slides deck which explains the infrastructure, please see [the Wiki page](https://github.com/Financial-Times/next/wiki/Syndication)

## Local Development

```sh
$ git clone git@github.com:Financial-Times/n-syndication.git
$ cd n-syndication
$ make install
```

Run the (incomplete) test suite with

```sh
$ make test
```

Verify that the Sass can compile by running

```sh
$ npx sass ./test/main.scss --load-path=./bower_components/
```

And by running:

```sh
$ npx sass ./test/main.scss --load-path=./node_modules --load-path=./node_modules/@financial-times
```

### Developing with a next app

Instruction for developing the library within a next app will be are in development ([ACC-1156](https://financialtimes.atlassian.net/browse/ACC-1156)).

## Deployment

Create a release tag [in Github](https://github.com/Financial-Times/n-syndication/releases) following the Semver convention and prefixing the release number with `v`. This will make this available as a bower component at that version.

If you are wanting to deploy to FT.com, after creating the tag you will need to coordinate the release for [these repos](https://github.com/search?q=org%3AFinancial-Times+filename%3Abower.json+n-syndication+NOT+repo%3AFinancial-Times%2Fnext-alpha-front-page+NOT+repo%3AFinancial-Times%2Fn-ui+NOT+repo%3AFinancial-Times%2Fn-syndication&type=Code). You should create a pull request updating the package version in the repo's `bower.json`.

## How does it work

The `n-syndication` module first checks to see if a user is "syndication enabled".

If they are it aggregates all the content IDs it finds on a page by querying for all the `[data-content-id]` attributes in each [n-teaser](https://github.com/Financial-Times/n-teaser).

It sends them to the [next-syndication-api](https://github.com/Financial-Times/next-syndication-api), which returns back an Array of Objects for each content ID that can be syndicated according to what this user's contract specifies.

When a user then clicks a syndicator icon, a modal is displayed with `save` and/or `download` buttons enabled/disabled, along with the appropriate messaging, also according to the user's contractual rights.

## I can't see the icons!

You need to be a syndication subscriber to see them. On a technical level this means having `S1` in your [products list](https://session-next.ft.com/products), which should be the default case for all FT developer accounts, but if not then contact syndhelp@ft.com.

The icons can be toggled on/off using the `syndication` flag via the [Flag Toggler](https://toggler.ft.com/).

## Where does the data come from?
The Content API has the property `canBeSyndicated` which is a string containing either `yes`, `no` or `verify`.  This property is available in Next's Elastic search cluster and in [Next API](https://github.com/Financial-Times/next-api)

## This is just some javascript - is there other code elsewhere?
Yep - These links will probably be wrong pretty soon but will hopefully point you in the right direction:

**n-teaser** - https://github.com/Financial-Times/n-teaser/blob/main/src/presenters/teaser-presenter.js#L77
Here we add an additional modifier if syndication is available on this article

**next-article** - https://github.com/Financial-Times/next-article/blob/main/views/content.html#L20
Here a data attribute is added containing the syndication status of the article.

**generic** - add the following data attributes to your markup:

* `data-syndicatable-uuid` – the uuid of the content to syndicate
* `data-syndicatable-title` – the title of the content to syndicate
* `data-syndicatable` – `yes` / `no` / `verify`
* `data-syndicatable-target` – the element to insert the syndication flag
