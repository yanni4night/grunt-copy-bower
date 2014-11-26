/**
 * Copyright (C) 2014 yanni4night.com
 * copy_bower.js
 *
 * changelog
 * 2014-11-26[11:43:14]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */


'use strict';

var bower = require('bower'),
  path = require('path'),
  fs = require('fs');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('copy_bower', 'A grunt plugin that copies bower component files to wherever you want.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      shim: {
        /*'requirejs-text': {
          main: 'text.js',
          dest: 'test/dest/js/plugin/'
        }*/
      }
    });

    var self = this;
    var uniformDest = self.data.dest;

    /**
     * If a file path looks like a direcotry
     * @param  {String} filepath
     * @return {Boolean}
     * @since 0.1.0
     */
    var likeDirectory = function(filepath) {
      return filepath && filepath.constructor === String && !path.extname(filepath); //new RegExp(path.sep + '[\\w\-]*$').test(path);
    };

    //dest could be a function
    if ('function' !== typeof uniformDest && !likeDirectory(uniformDest)) {
      grunt.fail.warn('"dest" should be a directory path');
    }

    var done = this.async(); //This task is asynchronous

    var pushDependency = function(pkg, depsCollection) {
      var deps = pkg.dependencies || {};
      var keys = Object.keys(deps);
      keys.forEach(function(key, idx) {
        var dep = deps[key];
        var mains = [];

        dep.pkgMeta = dep.pkgMeta || {};
        //main could be an array
        mains = Array.isArray(dep.pkgMeta.main) ? dep.pkgMeta.main : [dep.pkgMeta.main];

        mains.forEach(function(main) {
          depsCollection.push({
            dir: dep.canonicalDir,
            main: main || (options.shim[key] ? options.shim[key].main : undefined),
            version: dep.pkgMeta.version,
            name: key
          });
        });
        pushDependency(dep, depsCollection);
      });

      return depsCollection;
    };
    /**
     * Copy all dependencies to destination.
     *
     * @param  {Array} depsCollection
     * @since 0.1.0
     */
    var copy = function(depsCollection) {

      depsCollection.forEach(function(dep) {
        if (dep.main) {
          var dst, src = path.join(dep.dir, dep.main);

          //Lookup shim
          if (options.shim[dep.name] && options.shim[dep.name].dest) {

            if (likeDirectory(options.shim[dep.name].dest)) {
              //dest for a single could be a directory
              dst = path.join(options.shim[dep.name].dest, path.basename(dep.main));
            } else {
              //or a file
              dst = options.shim[dep.name].dest;
            }

          } else {
            dst = path.join('function' === typeof uniformDest ? uniformDest.call(self, dep.main) : uniformDest, path.basename(dep.main));
          }
          grunt.file.write(dst, grunt.file.read(src));
        } else {
          grunt.fail.warn('No main file found in component "' + dep.name + '"');
        }
      });
    };

    bower.commands.list(null, {
      offline: true
    }).on('end', function(installed) {
      var depsCollection = [];
      pushDependency(installed, depsCollection);
      copy(depsCollection);
      done();
    });

  });

};