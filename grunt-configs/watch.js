module.exports = {
  options: {
    interrupt: true,
    debounceDelay: 250
  },
  dev: {
    files: [
      `${gruntConfig.src.js}/**`,
      `${gruntConfig.src.static}/**`
    ],
    tasks: [
      "build"
    ]
  }
};
