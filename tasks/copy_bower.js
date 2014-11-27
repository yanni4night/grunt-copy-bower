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
  fs = require('fs'),
  async = require('async'),
  util = require('util');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('copy_bower', 'A grunt plugin that copies bower component files to wherever you want.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      shim: {
        /*'requirejs-text': {
          main: 'text.js',
          ignore: [],
          dest: 'test/dest/js/plugin/'
        }*/
      },
      ignore: [],
      install: false
    });

    var self = this;
    var oDest = self.data.dest;
    var oShim = options.shim || {};

    /**
     * @param  {Mixed}  f
     * @return {Boolean}
     * @since 0.1.0
     */
    var isFunction = function(f) {
      return 'function' === typeof f;
    };

    /**
     * @param  {Mixed}  str
     * @return {Boolean}
     * @since 0.1.0
     */
    var isNonEmptyString = function(str) {
      return str && str.constructor === String;
    };

    /**
     * If a file path looks like a direcotry
     * @param  {String} filepath
     * @return {Boolean}
     * @since 0.1.0
     */
    var likeDirectory = function(filepath) {
      return isNonEmptyString(filepath) && !path.extname(filepath); //new RegExp(path.sep + '[\\w\-]*$').test(path);
    };

    /**
     * If key should be ignored according to ignore pattern.
     *
     * @param  {Mixed} ignore pattern
     * @param  {String} key
     * @return {Boolean}
     * @since 0.1.0
     */
    var shouldIgnored = function(ignore, key) {

      if (!ignore || !isNonEmptyString(key)) {
        return false;
      } else if (Array.isArray(ignore)) {
        return ignore.some(function(ig) {
          return shouldIgnored(ig, key);
        });
      } else if (util.isRegExp(ignore)) {
        if (ignore.test(key)) {
          return true;
        }
      } else if (isNonEmptyString(ignore)) {
        if (grunt.file.match(ignore, key)) {
          return true;
        }
      } else if (isFunction(ignore)) {
        if (true === ignore.call(self, key)) {
          return true;
        }
      } else {
        grunt.log.warn('Illegal ignore:' + ignore);
      }

      return false;
    };

    /**
     * Get the lowercase form of ext.
     *
     * @param  {String} filename
     * @return {String}
     * @since 0.1.0
     */
    var getExt = function(filename) {
      return (path.extname(filename) || '').replace(/^\./, '').toLowerCase();
    };

    /**
     * Detect the file type.
     *
     * @type {Object}
     * @since 0.1.0
     */
    var fileTypeDetector = {
      _ext: function(ext, filename) {
        if (Array.isArray(ext)) {
          ext = '(' + ext.join('|') + ')';
        }
        return new RegExp('\\.' + ext + '$', 'i').test(path.extname(filename));
      },
      /**
       * If a file name could be deteced.
       *
       * @param  {String} filename
       * @return {String|Undefined}
       * @since 0.1.0
       */
      detected: function(filename) {
        var types = Object.keys(this).filter(function(func) {
          return /^is\w+$/.test(func) && isFunction(this[func]);
        }, this);

        for (var i = 0, len = types.length; i < len; ++i) {
          if (this[types[i]].call(this, filename)) {
            return types[i].slice(2).toLowerCase();
          }
        }
      },
      isHtml: function(filename) {
        return this._ext.bind(this, ['html', 'htm', 'shtml']).apply(this, arguments);
      },
      isImage: function(filename) {
        return this._ext.bind(this, ['jpg', 'jpeg', 'ico', 'bmp', 'png', 'gif', 'webp']).apply(this, arguments);
      },
      isFont: function(filename) {
        return this._ext.bind(this, ['eot', 'svg', 'ttf', 'woff']).apply(this, arguments);
      }
    };

    //dest could be a function
    if (!isFunction(oDest) && !likeDirectory(oDest)) {
      grunt.fail.warn('"dest" should be a directory path');
    }

    var done = this.async(); //This task is asynchronous

    /**
     * @param  {Object} pkg
     * @param  {Array} depsCollection
     * @since 0.1.0
     */
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

          if (oShim[key]) {
            main = main || oShim[key].main;
            if (shouldIgnored(oShim[key].ignore, main) || shouldIgnored(options.ignore, main)) {
              grunt.log.debug('"' + main + '" is ignored');
              return;
            }
          }

          if (!main) {
            grunt.log.warn('No main file found in component "' + key + '"');
            return;
          }

          depsCollection.push({
            dir: dep.canonicalDir,
            main: main,
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
          var dst, src = path.join(dep.dir, dep.main),
            fileType, ext, filename = path.basename(dep.main);

          //Lookup shim
          if (oShim[dep.name] && oShim[dep.name].dest) {

            if (likeDirectory(oShim[dep.name].dest)) {
              //dest for a single could be a directory
              dst = path.join(oShim[dep.name].dest, filename);
            } else {
              //or a file
              dst = oShim[dep.name].dest;
            }

          } else if ((ext = getExt(src)) && likeDirectory(self.data[ext + 'Dest'])) {
            dst = path.join(self.data[ext + 'Dest'], filename);
          } else if ((fileType = fileTypeDetector.detected(src)) && likeDirectory(self.data[fileType + 'Dest'])) {
            dst = path.join(self.data[fileType + 'Dest'], filename);
          } else {
            dst = path.join(isFunction(oDest) ? oDest.call(self, dep.main) : oDest, path.basename(dep.main));
          }
          grunt.file.copy(src, dst);
        } else {
          grunt.fail.warn('No main file found in component "' + dep.name + '"');
        }
      });
    };

    async.series([
      //Install first
      function(cb) {
        if (!options.install) {
          return cb();
        }
        grunt.log.debug('Installing bower components...');
        bower.commands.install().on('end', function() {
          cb();
        }).on('error', cb);
      },
      //Then list the components
      function(cb) {
        bower.commands.list(null, {
          offline: true //We do not check new version(s) due to speed
        }).on('end', function(installed) {
          var depsCollection = [];
          try {
            pushDependency(installed, depsCollection);
            copy(depsCollection);
          } catch (e) {
            return cb(e);
          }
          return cb();
        }).on('error', cb);
      }
    ], function(err) {
      if (err) {
        grunt.fail.fatal(err);
      }
      done();
    });
  });
};