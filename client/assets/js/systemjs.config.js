(function(global) {

  // map tells the System loader where to look for things
  var map = {
    'app':                        './client/app', // 'dist',
    'rxjs':                       'config_scripts/rxjs',
    'angular2-in-memory-web-api': 'config_scripts/angular2-in-memory-web-api',
    '@angular':                   'config_scripts/@angular'
  };

  // packages tells the System loader how to load when no filename and/or no extension
 /* var packages = {
    'app':                        { main: 'main.js',  defaultExtension: 'js' },
    'rxjs':                       { defaultExtension: 'js' },
    'angular2-in-memory-web-api': { defaultExtension: 'js' },
  };*/
  var packages = {
    'app': { 
      main: './main.js',  
      defaultExtension: 'js' 
    },
    '@angular/core': {
      main: 'config_scripts/@angular/core.umd.js',
      defaultExtension: 'js'
    },
    '@angular/compiler': {
      main: 'config_scripts/@angular/compiler.umd.js',
      defaultExtension: 'js'
    },
    '@angular/common': {
      main: 'config_scripts/@angular/common.umd.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser-dynamic': {
      main: 'config_scripts/@angular/platform-browser-dynamic.umd.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser': {
      main: 'config_scripts/@angular/platform-browser.umd.js',
      defaultExtension: 'js'
    },
    rxjs: {
      defaultExtension: 'js'
    }
  };

  /*var packageNames = [
    '@angular/common',
    '@angular/compiler',
    '@angular/core',
    '@angular/http',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/router',
    '@angular/router-deprecated',
    '@angular/testing',
    '@angular/upgrade',
  ];

  // add package entries for angular packages in the form '@angular/common': { main: 'index.js', defaultExtension: 'js' }
  packageNames.forEach(function(pkgName) {
    packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
  });

  */
  
  var config = {
    map: map,
    packages: packages
  }

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) { global.filterSystemConfig(config); }

  System.config(config);

})(this);