/* eslint-env node */
const path = require('path');
const WebpackUserscript = require('webpack-userscript');
const { name, scriptName, description, repository } = require('./package.json');

const dev = process.argv.includes('--dev');

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${name}.user.js`,
    // libraryTarget: 'this',
  },
  plugins: [
    new WebpackUserscript({
      headers: {
        name: scriptName,
        description,
        namespace: 'https://uc.feildmaster.com/',
        match: 'https://*.undercards.net/*',
        exclude: 'https://*.undercards.net/*/*',
        updateURL: `https://github.com/${repository}/releases/latest/download/${name}.meta.js`,
        downloadURL: `https://github.com/${repository}/releases/latest/download/${name}.user.js`,
        require: [ // URLS of files to require
          'https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js',
        ],
        grant: 'none',
      },
      pretty: true,
    }),
  ],
};
