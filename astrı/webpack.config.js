const path = require('path');

module.exports = {
  entry: './static/js/equation_input.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static/dist'),
    publicPath: '/static/dist/',
  },
  mode: 'development',
  experiments: {
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        },
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      }
    ],
  },
  devServer: {
    static: path.join(__dirname, 'static'),
    compress: true,
    port: 8080,
    hot: true,
  },
};
