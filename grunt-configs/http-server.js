module.exports = {
  dev: {
    root: gruntConfig.dir.build,
    port: process.env.PORT || 3000,
    host: process.env.HOSTNAME || "127.0.0.1",
    cache: 0,
    showDir: true,
    autoIndex: true,
    ext: "html",
    runInBackground: true,
    openBrowser: false
  }
};
