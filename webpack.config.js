const path = require('path')
const webpack = require('webpack');
require('dotenv').config();
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: "production",
  target: ['web', 'es5'],
  entry: {
    index: "./src/index.ts",
    react: "./src/react-entry.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'dist'),
    library: "BringSDK",
    libraryTarget: "umd",
    globalObject: "this"
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js", ".json"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
     ".js": [".js", ".ts", ".tsx", ".json"]
    },
    alias: {
      "@": path.resolve(__dirname, "src")
    },
    fullySpecified: false,
    fallback: {
      '@react-native-async-storage/async-storage': false,
    },
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
    '@coinbase/wallet-sdk': '@coinbase/wallet-sdk' 
  },

  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^@react-native-async-storage\/async-storage$/,
    }),
    new webpack.DefinePlugin({
      'process.env.ZUPLO_API_KEY': JSON.stringify(process.env.ZUPLO_API_KEY),
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css',
    })
  ],
  module: {
    rules: [
      {
        test: /\.([cm]?ts|tsx|js)$/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './.babelrc', // or inline options
          }
        }
      }, {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto'
      },
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              sassOptions: {
                silenceDeprecations: ["legacy-js-api"],
              }
            },
          },
        ],
      },
      {
        test: /\.png|gif$/,
        loader: "file-loader",
        exclude: /node_modules/,
      },
    ]
  }
}