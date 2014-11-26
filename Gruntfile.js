/*
 * grunt-copy-bower
 * https://github.com/yanni4night/grunt-copy-bower
 *
 * Copyright (c) 2014 yinyong
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['test/dest']
    },

    // Configuration to be run (and then tested).
    copy_bower: {
      all: {
        options: {
          shim: {
            'requirejs-text': {
              main: 'text.js',
              dest: 'test/dest/js/plugin/'
            },
            'underscore': {
              dest: 'test/dest/js/_.js'
            }
          }
        },
        dest: function(path) {
          if (/\.css$/i.test(path)) {
            return 'test/dest/css/';
          } else if (/\.js$/i.test(path)) {
            return 'test/dest/js/';
          } else {
            return 'test/bin';
          }
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');


  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'copy_bower', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};