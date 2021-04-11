module.exports = {
  entry: "src/index",
  output: {
    publicUrl: ".",
  },
  plugins: [
    {
      resolve: "@poi/plugin-typescript",
    },
  ],
};
