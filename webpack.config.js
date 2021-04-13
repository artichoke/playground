const path = require("path");

const HtmlWebPackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const svgToMiniDataURI = require("mini-svg-data-uri");

const plugins = [
  new MonacoWebpackPlugin({ languages: ["ruby"] }),
  new MiniCssExtractPlugin({
    filename: "[contenthash].css",
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
      extensions: [".ts", ".js"],
    },
    entry: path.resolve(__dirname, "src/main.ts"),
    output: {
      filename: "[contenthash].bundle.js",
      path: path.resolve(__dirname, "target/dist"),
      publicPath: "/",
    },
    module: {
      rules: [
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
          include: [
            path.resolve(__dirname, "src", "assets"),
            path.resolve(__dirname, "node_modules", "@artichokeruby/logo/img"),
            path.resolve(
              __dirname,
              "node_modules",
              "@artichokeruby/logo/favicons"
            ),
          ],
          type: "asset/resource",
          use: "@hyperbola/svgo-loader",
          generator: {
            filename: "[name][ext]",
          },
        },
        {
          include: [
            path.resolve(__dirname, "src", "assets"),
            path.resolve(__dirname, "node_modules", "@artichokeruby/logo/img"),
            path.resolve(
              __dirname,
              "node_modules",
              "@artichokeruby/logo/favicons"
            ),
          ],
          exclude: /\.svg$/,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          include: path.resolve(
            __dirname,
            "node_modules",
            "@artichokeruby/logo/optimized"
          ),
          type: "asset",
        },
        {
          test: /\.svg$/,
          exclude: [
            path.resolve(__dirname, "src", "assets"),
            path.resolve(__dirname, "node_modules", "@artichokeruby/logo/img"),
            path.resolve(
              __dirname,
              "node_modules",
              "@artichokeruby/logo/favicons"
            ),
          ],
          type: "asset",
          use: "@hyperbola/svgo-loader",
          generator: {
            dataUrl: (content) => {
              content = content.toString();
              return svgToMiniDataURI(content);
            },
          },
        },
        {
          test: /\.html$/,
          include: path.resolve(__dirname, "src", "partials"),
          use: "html-loader",
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
    devServer: {
      compress: true,
      host: "127.0.0.1",
      port: 8989,
    },
  };
};

module.exports = config;
