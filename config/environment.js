const path = require('path');

const devServerHost = '0.0.0.0';
const devServerPort = 3000;
const assetsDir = '/';
const outputDir = '../build';
const imagesDir = './images';
const publicPath = '/';

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  paths: {
    assetsDir,
    publicPath,
    output: outputDir,
    stylesheets: path.join(assetsDir, 'scss'),
    javascripts: path.join(assetsDir, 'js'),
    images: imagesDir,
    layoutsGlob: path.join(assetsDir, '*.hbs'),
    layoutsPartialsGlob: path.join(assetsDir, 'partials', '*.hbs'),
    layoutsOutput: path.join(assetsDir, 'build'),
  },
  devServer: {
    publicPath: `//${devServerHost}:${devServerPort}${publicPath}`,
    host: devServerHost,
    port: devServerPort,
  },
};
