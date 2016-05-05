System.config({
  //map tells the System loader where to look for things
  map: {
    'app':                        'dist',
    'rxjs':                       'rxjs_temp', // temporary solution exposed from node_modules
    'angular2-in-memory-web-api': 'config_scripts/angular2-in-memory-web-api',
    '@angular':                   'config_scripts/@angular'
  },
  //packages defines our app package
  packages: {
    app: {
      main: './main.js',
      defaultExtension: 'js'
    },
    '@angular/core': {
      main: '../core.umd.js',
      defaultExtension: 'js'
    },
    '@angular/compiler': {
      main: '../compiler.umd.js',
      defaultExtension: 'js'
    },
    '@angular/common': {
      main: '../common.umd.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser-dynamic': {
      main: '../platform-browser-dynamic.umd.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser': {
      main: '../platform-browser.umd.js',
      defaultExtension: 'js'
    },
    'rxjs': {
      defaultExtension: 'js'
    }
  }
});