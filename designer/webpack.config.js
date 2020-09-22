const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const babelOptions = require('./.babelrc.json')

const devMode = process.env.NODE_ENV !== 'production'
const prodMode = process.env.NODE_ENV === 'production'
const environment = prodMode ? 'production' : 'development'

const client = {
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, 'client', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist', 'client'),
    filename: 'assets/[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          ...babelOptions
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: devMode,
              reloadAll: true,
              publicPath: '../../'
            }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/images/[name].[ext]'

        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'views', 'designer.html'),
      filename: 'designer.html'
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? 'assets/css/[name].css' : 'assets/css/[name].[hash].css',
      chunkFilename: devMode ? 'assets/css/[id].css' : 'assets/css/[id].[hash].css'
    })
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}

const server = {
  target: 'node',
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, 'server', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          ...babelOptions
        }
      }
    ]
  },
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules')
    })
  ]
}

module.exports = [
  client,
  server
]
