const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const plugins = [
  new MiniCssExtractPlugin({
    filename: "[hash].css",
    chunkFilename: "[id].css"
  }),
  new HtmlWebPackPlugin({
    template: "index.html",
    filename: "index.html",
    minify: {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      useShortDoctype: true
    }
  }),
  new HtmlWebpackInlineSourcePlugin()
];

module.exports = (env, argv) => {
  let target = "debug";
  let cssLoader = "style-loader";
  if (argv.mode === "production") {
    target = "release";
    cssLoader = MiniCssExtractPlugin.loader;
  }
  return {
    context: path.resolve(__dirname, "src"),
    resolve: {
      alias: {
        rust: path.resolve(
          __dirname,
          `target/wasm32-unknown-emscripten/${target}`
        ),
        ruby: path.resolve(__dirname, "examples")
      }
    },
    entry: path.resolve(__dirname, "src/main.js"),
    output: {
      filename: "[hash].bundle.js",
      path: path.resolve(__dirname, "target/dist"),
      publicPath: "/"
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|wasm32)/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: path.resolve(
            __dirname,
            `target/wasm32-unknown-emscripten/${target}/playground.js`
          ),
          use: ["uglify-loader", "script-loader"]
        },
        {
          test: /\.css$/,
          use: [cssLoader, "css-loader"]
        },
        {
          test: /(logo|playground)\.png$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]"
              }
            },
            {
              loader: "image-webpack-loader"
            }
          ]
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          exclude: /(logo|playground)\.png$/,
          use: ["url-loader", "image-webpack-loader"]
        },
        {
          test: /@artichoke\/logo\/logo\.svg/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]"
              }
            },
            {
              loader: "svgo-loader"
            }
          ]
        },
        {
          test: /\.svg$/,
          exclude: /@artichoke\/logo\/logo\.svg/,
          use: ["svg-url-loader", "svgo-loader"]
        },
        {
          test: /\.rb$/,
          use: ["raw-loader"]
        },
        {
          test: /\.wasm$/,
          type: "javascript/auto",
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]"
              }
            }
          ]
        }
      ]
    },
    plugins,
    optimization: {
      minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin()]
    }
  };
};
