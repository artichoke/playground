import * as path from "path";
import * as webpack from "webpack";

import HtmlWebPackPlugin from "html-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";

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

const config: webpack.ConfigurationFactory = (env) => {
  let cssLoader = "style-loader";
  let optimization: webpack.Options.Optimization = {
    minimize: false,
  };
  if (env === "production") {
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
          use: "raw-loader",
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

export default config;
