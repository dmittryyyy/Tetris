const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HandlebarsPlugin = require('handlebars-webpack-plugin');
const handlebarsHelpers = require('just-handlebars-helpers');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const environment = require('./environment');

const config = {
  mode: environment.mode,
  entry: {
    vendor: [
      'stimulus',
      '@hotwired/turbo',
      'imask/esm/imask',
      'imask/esm/masked/pattern',
      'imask/esm/masked/range',
      'imask/esm/masked/regexp',
    ],
    app: {
      import: [
        `${environment.paths.stylesheets}/application.scss`,
        `${environment.paths.javascripts}/application.js`,
      ],
      dependOn: 'vendor',
    },
  },
  output: {
    path: path.join(__dirname, environment.paths.output),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|svg|ttf|woff|woff2)$/,
        use: [{
          loader: 'file-loader',
          // Uncomment if fonts are not used
          // options: {
          //   name: 'fonts/[name].[ext]',
          // },
        }],
      },
      {
        test: /\.scss$/,
        use: [
          // TODO: fix an issue with sourcemaps:
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [autoprefixer],
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 5e5, // bytes
    maxEntrypointSize: 5e5, // bytes
    assetFilter(assetFilename) {
      // Function predicate that provides asset filenames
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    },
  },
  target: 'web',
  plugins: [
    new HandlebarsPlugin({
      entry: path.join(process.cwd(), environment.paths.layoutsGlob),
      output: path.join(
        process.cwd(),
        environment.paths.layoutsOutput,
        '[name].html',
      ),
      partials: [path.join(process.cwd(), environment.paths.layoutsPartialsGlob)],
      onBeforeAddPartials: (Handlebars) => {
        handlebarsHelpers.registerHelpers(Handlebars);
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: environment.paths.images, to: environment.paths.output, noErrorOnMissing: true },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
    emitOnErrors: false,
  },
};

if (environment.mode === 'production') {
  config.plugins.concat([
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      // compress files bigger than 10 KB:
      threshold: 10240,
      minRatio: 0.8,
    }),
  ]);
  config.output.publicPath = environment.paths.publicPath;
} else {
  config.performance.maxAssetSize = 1e6;
  config.performance.maxEntrypointSize = 1e6;
  config.output.publicPath = environment.devServer.publicPath;
  config.devServer = {
    open: true,
    host: environment.devServer.host,
    port: environment.devServer.port,
    disableHostCheck: true,
    // headers: {
    //   'Access-Control-Allow-Origin': '*',
    // },
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },

        { from: /./, to: '/404.html' },
      ],
    },
    compress: true, // enable gzip compression
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    // noInfo: true, // only errors & warns on hot reload
    stats: 'minimal',
  };
  config.devtool = 'source-map';
}

module.exports = config;
