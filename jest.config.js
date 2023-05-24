module.exports = {
	moduleDirectories: ['node_modules'],
	testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
	testEnvironment: 'jsdom',
	transform: {
		'.(js|jsx)': '@sucrase/jest-plugin'
	},
	transformIgnorePatterns: ['/node_modules//(?!(@financial-times)/)'],
	resolver: './jest-resolver' // added resolver to process origami browser packages
};
