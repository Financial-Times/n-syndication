module.exports = {
	files: {
		allow: [],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			'0bc92c56-3fa8-46aa-9f2f-11300332f79b', // secrets.js:3
			'43d06a9a-5c72-4273-8738-b5cf26fa75b7', // secrets.js:4
			'74c2babb-1ff2-4a18-9718-4b054dd819c2', // secrets.js:5, test/fixtures/item.json:7
			'aSyndication\\.User@ftqa\\.org' // test/fixtures/userStatus.json:21
		]
	}
};
