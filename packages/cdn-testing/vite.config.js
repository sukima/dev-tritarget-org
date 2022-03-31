const fs = require('fs');
const path = require('path');
const { defineConfig } = require('vite');
const banner = require('vite-plugin-banner');

const preamble = fs.readFileSync(path.resolve(__dirname, 'banner.txt'), 'utf8');

module.exports = defineConfig({
  plugins: [
    banner(preamble),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'testing.js'),
      name: 'testing',
      formats: ['es'],
      fileName: (format) => `testing.js`
    },
  },
});
