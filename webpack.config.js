const path = require("path");
const CnameWebpackPlugin = require("cname-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const plugins = [
  new MonacoWebpackPlugin({ languages: ["ruby"] }),
  new MiniCssExtractPlugin({
    filename: "[hash].css",
    chunkFilename: "[id].css",
  }),
  new HtmlWebPackPlugin({
    template: "index.html",
    filename: "index.html",
    minify: {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      useShortDoctype: true,
    },
  }),
  new CnameWebpackPlugin({
    domain: "artichoke.run",
  }),
];

module.exports = (env, argv) => {
  let target = "debug";
  let cssLoader = "style-loader";
  let optimization = {
    minimize: false,
  };
  if (argv.mode === "production") {
    target = "release";
    cssLoader = MiniCssExtractPlugin.loader;
    optimization = {
      minimize: true,
      minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin()],
    };
  }
  return {
    context: path.resolve(__dirname, "src"),
    resolve: {
      alias: {
        assets: path.resolve(__dirname, "assets"),
        rust: path.resolve(
          __dirname,
          "target",
          "wasm32-unknown-emscripten",
          target
        ),
        ruby: path.resolve(__dirname, "examples"),
      },
    },
    entry: path.resolve(__dirname, "src/main.js"),
    output: {
      filename: "[hash].bundle.js",
      path: path.resolve(__dirname, "target/dist"),
      publicPath: "/",
    },
    node: {
      fs: "empty",
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/,
          use: [cssLoader, "css-loader"],
        },
        {
          test: /\.ttf$/,
          use: "file-loader",
        },
        {
          test: new RegExp(path.resolve(__dirname, "assets")),
          use: {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
            },
          },
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          exclude: new RegExp(path.resolve(__dirname, "assets")),
          use: {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        },
        {
          test: /\.svg$/,
          exclude: new RegExp(path.resolve(__dirname, "assets")),
          use: ["file-loader", "svgo-loader"],
        },
        {
          test: /\.rb$/,
          use: ["raw-loader"],
        },
        {
          test: /\.wasm$/,
          type: "javascript/auto",
          use: {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
            },
          },
        },
      ],
    },
    plugins,
    optimization,
  };
};
