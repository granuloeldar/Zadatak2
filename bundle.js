var SystemBuilder = require('systemjs-builder');
var argv = require('yargs').argv;
var builder = new SystemBuilder();

builder.loadConfig('./client/assets/js/config.js')
  .then(function(){
	  var outputFile = argv.prod ? 'client/app/assets/js/bundle.min.js' : 'dist/assets/js/bundle.js';
	  return builder.buildStatic('app', outputFile, {
		  minify: argv.prod,
		  mangle: argv.prod,
		  rollup: argv.prod
	  });
  })
  .then(function(){
	  console.log('bundle built successfully!');
  });