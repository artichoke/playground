"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const monaco_editor_webpack_plugin_1 = __importDefault(require("monaco-editor-webpack-plugin"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const optimize_css_assets_webpack_plugin_1 = __importDefault(require("optimize-css-assets-webpack-plugin"));
const plugins = [
    new monaco_editor_webpack_plugin_1.default({ languages: ["ruby"] }),
    new mini_css_extract_plugin_1.default({
        filename: "[hash].css",
        chunkFilename: "[id].css",
    }),
    new html_webpack_plugin_1.default({
        template: "index.html",
        filename: "index.html",
    }),
];
const config = (env) => {
    let cssLoader = "style-loader";
    let optimization = {
        minimize: false,
    };
    if (env === "production") {
        cssLoader = mini_css_extract_plugin_1.default.loader;
        optimization = {
            minimize: true,
            minimizer: [new terser_webpack_plugin_1.default(), new optimize_css_assets_webpack_plugin_1.default()],
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
exports.default = config;
