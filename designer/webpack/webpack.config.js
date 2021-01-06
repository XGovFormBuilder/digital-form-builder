const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = {
  target: "web",
  entry: path.resolve(__dirname, "../client", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "../dist", "designer"),
    filename: "[name].[hash:4].bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    //modules: [path.resolve(__dirname, "../../node_modules")],
  },
  devtool: "eval-cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        loader: "file-loader",
        options: {
          name: "assets/images/[name].[ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
        options: {
          name: "assets/fonts/[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "assets/css/[name].css",
      chunkFilename: "assets/css/[id].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "client/i18n/translations", to: "assets/translations" },
      ],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      defaultSizes: "gzip",
      openAnalyzer: false,
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, "../dist", "designer"),
    compress: true,
    port: 3001,
    historyApiFallback: true,
    open: true, // Here
    openPage: "new",
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        //pathRewrite: { "^/api": "" },
      },
    },
  },
};
