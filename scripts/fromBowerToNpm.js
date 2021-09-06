const fs = require('fs');
const bowerPackage = require('../bower.json');
const npmPackage = require('../package.json');

function standardNpmPackage (version, name) {
	return `npm:@financial-times/${name}@${version}`;
}

const resolutionMap = {
	"n-ui-foundations": () => "github:financial-times/n-ui-foundations#nobower",
	"next-session-client": (version) => `${version}`,
	"o-buttons": standardNpmPackage,
	"o-overlay": standardNpmPackage,
	"o-tracking": standardNpmPackage,
	"o-visual-effects": standardNpmPackage,
	"o-message": standardNpmPackage,
	"o-viewport": standardNpmPackage,
};

for (const dependency in bowerPackage.dependencies) {
	if (!resolutionMap[dependency]) {
		throw new Error(`Please update fromBowerToNpm resolution map with the Bower package ${dependency}, so it will be usable also from NPM consumers`
		);
	} else {
		npmPackage.dependencies[dependency] = resolutionMap[dependency](
			bowerPackage.dependencies[dependency],
			dependency
		);
	}
}

fs.writeFileSync('package.json', JSON.stringify(npmPackage, null, 2));
