//set up global constants for all grunt tasks
const src = "./src";
const build = "./build";
global.gruntConfig = {
  dir: {
    src,
    build
  },
  src: {
    js: `${src}/js/lesson/1`,
    "static": `${src}/static`
  },
  out: {
    js: `${build}/app.js`
  }
};

//dependencies
const loadTasks = require("load-grunt-tasks");
const requireDir = require("require-dir");
const _ = require("lodash");
//grunt tasks
const config = requireDir("./grunt-configs");
const tasks = requireDir("./grunt-tasks");

module.exports = function (grunt) {
  //load grunt tasks from package.json
  loadTasks(grunt);
  //initialize the config for various loaded tasks
  grunt.config.init(config);
  //set up entry-point tasks
  _.forOwn(tasks, (subTasks, name) => grunt.registerTask(name, subTasks));
};
