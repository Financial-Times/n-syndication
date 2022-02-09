module.exports = {
	moduleDirectories: ['node_modules'],
	testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
	transform: {
		'.(js|jsx)': '@sucrase/jest-plugin'
	},
	transformIgnorePatterns: ['/node_modules//(?!(@financial-times)/)'],
};
