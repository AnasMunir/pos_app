
'use strict';
/* jshint node:true */

var electron = require('gulp-electron');
var gulp = require('gulp');
var util = require('gulp-util');

var packageJson = require('./src/package.json');

process.NODE_ENV = 'test';

gulp.task('electron', function() {

    gulp.src("")
    .pipe(electron({
        src: './src',
        packageJson: packageJson,
        release: './dist',
        cache: './cache',
        version: 'v0.37.6',
        rebuild: false,
        packaging: true,
        asar: true,
        platforms: ['win32-ia32', 'darwin-x64', 'linux-ia32', 'linux-x64', 'linux-arm'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version,
                icon: 'favicon.icns'
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'favicon.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
});

gulp.task('default', ['electron']);
