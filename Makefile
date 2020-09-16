node_modules/@financial-times/n-gage/index.mk:
	npm install --no-package-lock @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

test: verify unit-test

unit-test:
	#@karma start karma.conf.js
	@jest
	@$(DONE)
