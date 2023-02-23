/*\
title: $:/plugins/sukima/obfuscate/commands/deobfuscate.js
type: application/javascript
module-type: command

Run content through the deobfuscate utility.

\*/
(function () {
	exports.info = {
		name: 'deobfuscate',
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
			let output = $tw.utils.deobfuscate(input);

			fs.writeFileSync(absPath(outFile), output);

			return null;
		}
	}

	exports.Command = Command;
})();
