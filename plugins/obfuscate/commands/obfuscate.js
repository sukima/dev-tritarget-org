/*\
title: $:/plugins/sukima/obfuscate/commands/obfuscate.js
type: application/javascript
module-type: command

Run content through the obfuscate utility.

\*/
(function () {
	exports.info = {
		name: 'obfuscate',
		synchronous: true,
	};

	class Command {
		constructor(params, commander) {
			this.params = params;
			this.commander = commander;
		}

		execute() {
			const fs = require('fs');
			const path = require('path');
			const absPath = (part) => path.resolve(process.cwd(), part);

			let [inFile, outFile] = this.params;
			let input = fs.readFileSync(absPath(inFile), 'utf8');
			let output = $tw.utils.obfuscate(input.trim());

			fs.writeFileSync(absPath(outFile), output);

			return null;
		}
	}

	exports.Command = Command;
})();
