const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const devMode = process.env.NODE_ENV !== "production";
const prodMode = process.env.NODE_ENV === "production";
const environment = prodMode ? "production" : "development";

const client = {
  target: "web",
  mode: environment,
  watch: devMode,
  entry: path.resolve(__dirname, "client", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "assets/[name].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "../node_modules")],
  },
  node: {
    __dirname: false,
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
            options: {
              hmr: devMode,
              reloadAll: true,
              publicPath: "../../",
            },
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
      template: path.resolve(__dirname, "server", "views", "layout.html"),
      filename: "views/layout.html",
      minify: false,
    }),
    new MiniCssExtractPlugin({
      filename: devMode
        ? "assets/css/[name].css"
        : "assets/css/[name].[hash].css",
      chunkFilename: devMode
        ? "assets/css/[id].css"
        : "assets/css/[id].[hash].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "client/i18n/translations", to: "assets/translations" },
        { from: "server/views", to: "views" },
      ],
    }),
  ],
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};

module.exports = client;
