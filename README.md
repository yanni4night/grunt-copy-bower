# grunt-copy-bower

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Build status][appveyor-image]][appveyor-url] [![Dependency status][david-dm-image]][david-dm-url] [![De vDependency status][david-dm-dev-image]][david-dm-dev-url] [![Coverage Status][coveralls-image]][coveralls-url] [ ![Codeship Status for yanni4night/grunt-copy-bower](https://codeship.com/projects/b693eb50-5817-0132-3f5a-5a2f44d2a21b/status)](https://codeship.com/projects/49996) [![Built with Grunt][grunt-image]][grunt-url]

> A grunt plugin that copies bower component files to wherever you want.

I found neither  _grunt-bowercopy_ nor _grunt-bower-copy_ does the intuitive things they should do.[Bower](http://bower.io/) is manager tool for front-end compoents.Every component has its own _bower.json_ which indicates the _main_ file,so copying operation requires no source file but the destination.So obvious!

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-copy-bower --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-copy-bower');
```

## The "copy_bower" task

### Overview
In your project's Gruntfile, add a section named `copy_bower` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  copy_bower: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  }
});
```

### Options

#### options.shim
Type: `Object`
Default value: `{}`

Override default copying behavier of a component

#### options.ignore
Type: `Function|Array|String|RegExp`
Default value: `[]`

A series of pattern to match the files you want to ignore.

#### options.install
Type: `Boolean`
Default value: `false`

If try to install bower components before copying.

### Usage Examples

In general,you should always define only one task,because all the src defined in bower will be copied if not in ignore pattern.

In shim,you could override the default copying behavier,e.g,

```js
grunt.initConfig({
  copy_bower: {
    options: {
      shim: {
        'requirejs-text': {
          main: 'text.js',
          dest: 'test/dest/plugin/'
        },
        'underscore': {
           dest: 'test/dest/us.js'
        }
      }
    },
    dest: 'test/dest/'
  }
});
```
All the files defined in bower will be copied into `test/dest` keeping the origin file name except _underscore.js_ to _us.js_,_text.js_ to _plugin/text.js_.Note that no main file defined will lead to a warning,so the _main_ defined for _requirejs-text_ is highly required.

You can also define _dest_ as a function:

```js
grunt.initConfig({
  copy_bower: {
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
});
```
But it's restricted that _dest_ in tasks does this,not the ones in _options.shim_.

There are some shortcuts for _dest_,e.g,

```js
grunt.initConfig({
  copy_bower: {
    dest: 'test/dest',
    cssDest: 'test/dest/css',
    jsDest: 'test/dest/js'
  }
});
```

_ignore_ could be patterns in **Array**/**Function**/**RegExp**/**String**,and nest of arrays is allowed,e.g,

```js
grunt.initConfig({
  copy_bower: {
    options: {
      shim: {
        bootstrap: {
              ignore: ['less/*.less', /\.(eot|svg|ttf|woff)$/i, functfilename) {
            if ('dist/js/bootstrap.js' === filename) {
              return true;
            }
          }]
        }
      },
      ignore: 'dist/js/bootstrap.css'
    },
    dest: 'test/dest/'
  }
});
```
_ignore_ in _options_ could work too.Note that the patterns only match the main file in bower,not the real file name or path.

Setting _options.install_ to _true_ will enable **installing** bower components before any copying.

```js
grunt.initConfig({
  copy_bower: {
    options: {
      shim: {
        install: true
      }
    },
    dest: 'test/dest/'
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 - 2014-11-27: Support basic copying operation


[npm-url]: https://npmjs.org/package/grunt-copy-bower
[downloads-image]: http://img.shields.io/npm/dm/grunt-copy-bower.svg
[npm-image]: http://img.shields.io/npm/v/grunt-copy-bower.svg
[travis-url]: https://travis-ci.org/yanni4night/grunt-copy-bower
[travis-image]: http://img.shields.io/travis/yanni4night/grunt-copy-bower.svg
[appveyor-image]:https://ci.appveyor.com/api/projects/status/y44cdve2kvcge3h3?svg=true
[appveyor-url]:https://ci.appveyor.com/project/yanni4night/grunt-copy-bower
[david-dm-url]:https://david-dm.org/yanni4night/grunt-copy-bower
[david-dm-image]:https://david-dm.org/yanni4night/grunt-copy-bower.svg
[david-dm-dev-url]:https://david-dm.org/yanni4night/grunt-copy-bower#info=devDependencies
[david-dm-dev-image]:https://david-dm.org/yanni4night/grunt-copy-bower/dev-status.svg
[coveralls-url]:https://coveralls.io/r/yanni4night/grunt-copy-bower
[coveralls-image]:https://coveralls.io/repos/yanni4night/grunt-copy-bower/badge.png
[grunt-url]:http://gruntjs.com/
[grunt-image]: https://cdn.gruntjs.com/builtwith.png
