const path = require("path");
const webpack = "webpack";

const HtmlWebPackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const svgToMiniDataURI = require("mini-svg-data-uri");

const plugins = [
  new MonacoWebpackPlugin({ languages: ["ruby"] }),
  new MiniCssExtractPlugin({
    filename: "[hash].css",
    chunkFilename: "[id].css",
  }),
  new HtmlWebPackPlugin({
    template: "index.html",
    filename: "index.html",
  }),
];

const config = (_env, argv) => {
  let cssLoader = "style-loader";
  let optimization = {
    minimize: false,
    chunkIds: "deterministic",
    moduleIds: "deterministic",
  };
  if (argv.mode === "production") {
    cssLoader = MiniCssExtractPlugin.loader;
    optimization.minimize = true;
    optimization.minimizer = ["...", new CssMinimizerPlugin()];
  }
  return {
    context: path.resolve(__dirname, "src"),
    resolve: {
      alias: {
        assets: path.resolve(__dirname, "assets"),
      },
      extensions: [".ts", ".js"],
    },
    entry: path.resolve(__dirname, "src/main.ts"),
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
          use: "babel-loader",
        },
        {
          test: /\.tsx?/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
        {
          test: /\.css$/,
          use: [cssLoader, "css-loader"],
        },
        {
          test: /\.ttf$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
        {
          test: /\.svg$/,
          include: new RegExp(path.resolve(__dirname, "assets")),
          type: "asset/resource",
          use: "svgo-loader",
          generator: {
            filename: "[name][ext]",
          },
        },
        {
          include: new RegExp(path.resolve(__dirname, "assets")),
          exclude: /\.svg$/,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          exclude: new RegExp(path.resolve(__dirname, "assets")),
          type: "asset",
        },
        {
          test: /\.svg$/,
          exclude: new RegExp(path.resolve(__dirname, "assets")),
          type: "asset",
          use: "svgo-loader",
          generator: {
            dataUrl: (content) => {
              content = content.toString();
              return svgToMiniDataURI(content);
            },
          },
        },
        {
          test: /\.rb$/,
          type: "asset/source",
        },
        {
          test: /\.wasm$/,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
      ],
    },
    plugins,
    optimization,
  };
};

module.exports = config;
