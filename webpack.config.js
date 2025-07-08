const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';

const JS_DIR = path.resolve(__dirname, 'src/js');
const IMG_DIR = path.resolve(__dirname, 'src/img');
const LIB_DIR = path.resolve(__dirname, 'src/library');
const BUILD_DIR = path.resolve(__dirname, 'build');
const SRC_DIR = path.resolve(__dirname, 'src');

module.exports = {
  entry: {
      setting: JS_DIR + '/setting.js',
      pricing: JS_DIR + '/pricing.js',
      visitor: JS_DIR + '/visitor.js',
      invoice: JS_DIR + '/invoice.js',
      public: JS_DIR + '/public.js',
      editor: JS_DIR + '/editor.js',
      server: JS_DIR + '/server.js',
      media: JS_DIR + '/media.js',
      admin: JS_DIR + '/admin.js',
      popup: JS_DIR + '/popup.js',
    hunts: JS_DIR + '/hunts.js',
      task: JS_DIR + '/task.js',
      pwa: JS_DIR + '/pwa.js',
      cdn: JS_DIR + '/cdn.js',
      app: JS_DIR + '/app.js',
    // sw: JS_DIR + '/sw.js',
  },
  output: {
    clean: true,
    // libraryTarget: 'var',
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: 'js/[name].[contenthash].js',
    // publicPath: '/wp-content/plugins/site-core/dist/', // __webpack_public_path__ = '';
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'source-map' : false,
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      // '@functions': path.resolve(__dirname, 'src/js/backend/app/components/common/functions'),
      // '@context': path.resolve(__dirname, 'src/js/backend/app/components/context'),
      // '@common': path.resolve(__dirname, 'src/js/backend/app/components/common'),
      // '@components': path.resolve(__dirname, 'src/js/backend/app/components'),
      // '@icons': path.resolve(__dirname, 'src/icons'),
      // '@sass': path.resolve(__dirname, 'src/sass'),
      // '@img': path.resolve(__dirname, 'src/img'),
      // '@js': path.resolve(__dirname, 'src/js'),
      // 
      '@functions': path.resolve(__dirname, 'src/js/components/common/functions'),
      '@entry': path.resolve(__dirname, 'src/js/components/application'),
      '@context': path.resolve(__dirname, 'src/js/components/context'),
      '@common': path.resolve(__dirname, 'src/js/components/common'),
      '@components': path.resolve(__dirname, 'src/js/components'),
      '@banglee': path.resolve(__dirname, 'src/js/banglee'),
      '@modules': path.resolve(__dirname, 'src/js/modules'),
      '@library': path.resolve(__dirname, 'src/library'),
      '@icons': path.resolve(__dirname, 'src/icons'),
      '@sass': path.resolve(__dirname, 'src/sass'),
      '@img': path.resolve(__dirname, 'src/img'),
      '@js': path.resolve(__dirname, 'src/js'),
    },
    fallback: {
    }
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3000,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { browsers: ['>0.25%', 'not dead'] } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                isDev && require.resolve('react-refresh/babel')
              ].filter(Boolean),
            },
          },
        ].filter(Boolean),
      },
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(ico|png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    !isDev && new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    isDev && new ReactRefreshWebpackPlugin(),
    // !isDev && new WorkboxPlugin.InjectManifest({
    //   swSrc: JS_DIR + '/sw.js',
    //   swDest: 'js/sw.js',
    //   maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    // }),
    new CopyPlugin({
      patterns: [
        { from: LIB_DIR, to: path.resolve(__dirname, 'dist/library') },
        { from: path.resolve(SRC_DIR, 'icons'), to: path.resolve(__dirname, 'dist/icons') },
        { from: path.resolve(SRC_DIR, 'icons'), to: path.resolve(__dirname, 'dist/icons') },
      ],
    })
  ].filter(Boolean),
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  //   runtimeChunk: 'single',
  // },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //     minSize: 20000,
  //     maxSize: 244000,
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name(module) {
  //           const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
  //           return `npm.${packageName.replace('@', '')}`;
  //         },
  //         chunks: 'all',
  //       },
  //     },
  //   },
  //   runtimeChunk: 'single',
  // },

};