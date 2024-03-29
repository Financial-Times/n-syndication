# n-syndication [![CircleCI](https://circleci.com/gh/Financial-Times/n-syndication.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-syndication)


## Troubleshooting
All troubleshooting information is gathered in the [Syndication API Troubleshooting runbook](https://runbooks.ftops.tech/next-syndication-api).

## What is n-syndication and how does it work

A client side library that displays icons next to headlines allowing syndication customers to download or save content for republishing.

* [n-syndication wiki page](https://financialtimes.atlassian.net/wiki/spaces/Accounts/pages/8120991905/n-syndication+icons+display+library) gives some background context on how the icons work

See [getting started](https://financialtimes.atlassian.net/wiki/spaces/Accounts/pages/8120533017/Syndication) on the authentication wiki page if you need to be added as a syndication subscriber.

You can develop with n-syndication without installing all of syndication. See instructions for local development and developing with a Next app.

If your app is failing locally as if you need the syndication API installed locally, you probably have some syndication port details in `next-router`'s `.env` variables. Removing them should get the app to call the live production syndication API instead.

### More information about the syndication system

* [The Syndication Wiki](https://financialtimes.atlassian.net/wiki/spaces/Accounts/pages/8120533017/Syndication) explains the system and its architecture, including endpoints and authentication.
* [Next Wiki](https://github.com/Financial-Times/next/wiki/Syndication) covers GDPR SAR and erasure requests so that people without github access can read it, as it is automatically published to https://customer-products.in.ft.com/wiki/Syndication.
* [Database Credentials & Key Rotation](https://github.com/Financial-Times/next-syndication-api/wiki#database-credentials-and-key-rotation) info related with key rotation in the systems

## Local Development

```sh
$ git clone git@github.com:Financial-Times/n-syndication.git
$ cd n-syndication
$ npm install
```

Run the (incomplete) test suite with

```sh
$ npm test
```

Verify that the Sass can compile by running

```sh
$ npx sass ./test/main.scss --load-path=./node_modules
```

And by running:

```sh
$ npx sass ./test/main.scss --load-path=./node_modules --load-path=./node_modules/@financial-times
```

### Developing with a next app

Instruction for developing the library within a next app will be are in development ([ACC-1156](https://financialtimes.atlassian.net/browse/ACC-1156)).

## Deployment

Create a release tag [in Github](https://github.com/Financial-Times/n-syndication/releases) following the Semver convention and prefixing the release number with `v`. This will make this available as a NPM package at that version.

If you are wanting to deploy to FT.com, after creating the tag you will need to coordinate the release for [these repos](https://github.com/search?q=org%3AFinancial-Times+filename%3Apackage.json+n-syndication+NOT+repo%3AFinancial-Times%2Fnext-alpha-front-page+NOT+repo%3AFinancial-Times%2Fn-ui+NOT+repo%3AFinancial-Times%2Fn-syndication&type=Code). You should create a pull request updating the package version in the repo's `package.json`.

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
