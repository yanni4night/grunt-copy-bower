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
        'test/*_test.js'
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
      options: {
        shim: {
          'requirejs-text': {
            main: 'text.js'
          }
        }
      },
      default: {
        dest: 'test/dest'
      },
      custom_component_dest: {
        options: {
          shim: {
            'requirejs-text': {
              main: 'text.js',
              dest: 'test/dest/plugin/'
            },
            'underscore': {
              dest: 'test/dest/_.js'
            }
          }
        },
        dest: 'test/dest'
      },
      function_dest: {
        dest: function(path) {
          if (/\.(c|le)ss$/i.test(path)) {
            return 'test/dest/css/';
          } else if (/\.js$/i.test(path)) {
            return 'test/dest/js/';
          } else {
            return 'test/dest/bin';
          }
        }
      }
    },

    // Unit tests.
    nodeunit: {
      default: ['test/default_test.js'],
      custom_component_dest: ['test/custom_component_dest_test.js'],
      function_dest: ['test/function_dest_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');


  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'copy_bower:default', 'nodeunit:default', 'clean', 'copy_bower:custom_component_dest','nodeunit:custom_component_dest','clean', 'copy_bower:function_dest','nodeunit:function_dest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};