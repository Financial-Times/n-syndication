module.exports = {
	moduleDirectories: ['node_modules', 'bower_components'],
	testPathIgnorePatterns: ['/node_modules/', '/bower_components/', '/cypress/'],
	transform: {
		'.(js|jsx)': '@sucrase/jest-plugin'
	},
};
