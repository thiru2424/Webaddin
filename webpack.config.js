/* eslint-disable no-undef */
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const urlDev = "https://localhost:3000/";
const urlProd = urlDev; // or set your actual production URL here

module.exports = async (env, options) => {
  const dev = options.mode === "development";

  return {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      taskpane: ["./src/taskpane/taskpane.ts", "./src/taskpane/taskpane.html"],
      commands: "./src/commands/commands.ts",
      popup: "./src/dialogues/popup.js",
      exRate: "./src/dialogues/exRate.ts",
      buildNew: "./src/dialogues/buildNew.ts",
    },
    output: {
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js", ".json"],
      fallback: {
        child_process: false,
        https: require.resolve("https-browserify"),
        url: require.resolve("url/"),
        http: require.resolve("stream-http"),
        buffer: require.resolve("buffer/"),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-typescript"],
            },
          },
        },
        {
          test: /\.html$/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane"],
      }),
      new HtmlWebpackPlugin({
        filename: "popup.html",
        template: "./src/dialogues/popup.html",
        chunks: ["polyfill", "popup"],
      }),
      new HtmlWebpackPlugin({
        filename: "exRate.html",
        template: "./src/dialogues/exRate.html",
        chunks: ["polyfill", "exRate"],
      }),
      new HtmlWebpackPlugin({
        filename: "buildNew.html",
        template: "./src/dialogues/buildNew.html",
        chunks: ["polyfill", "buildNew"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext]",
          },
          {
            from: "manifest*.xml",
            to: "[name][ext]",
            transform(content) {
              return dev ? content : content.toString().replace(new RegExp(urlDev, "g"), urlProd);
            },
          },
        ],
      }),
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: await devCerts.getHttpsServerOptions(),
      },
      port: 3000,
    },
  };
};
