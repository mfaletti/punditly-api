module.exports = function(grunt) {
	'use strict';
	var cssFiles = [],
	jsFiles = [],
	cssRoot = 'public/css/',
	jsRoot = 'public/js/';

	grunt.registerTask('default', ['clean', 'jshint', 'copy', 'shell']);

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-shell');

	// on watch events
  grunt.event.on('watch', function(action, filepath, target){
    grunt.config('shell.deploy.command', 'rsync -zR ' + filepath + ' ec2:/var/www/punditly-api');
  });

	grunt.initConfig({
		clean: ['build', 'dist'],
		jshint: {
			all: [
				'Gruntfile.js',
				'public/js/*.js'
			],
			options: {
				smarttabs: true,
				undef:true,
				unused:false,
				jquery:true,
				browser:true,
				curly:true,
				globals:{
					module:true,
					console:true
				}
			}
		},
		copy: {
			source : {
				files:[
					{expand: true, src: ['app/**/*', 'index.js', 'package.json'], dest: 'dist/' }
				]
			}
    },
		watch: {
      server: {
       files: ['app/**/*.js','app/**/*.ejs', 'index.js'],
       tasks: ['shell'],
       options: {
        spawn:false
       }
      },
      client: {
				files:['public/**'],
				tasks:['shell'],
				options: {
					spawn: false
				}
      }
    },
		shell: {
      deploy: {
        command: "rsync -avvrz --exclude-from '.gitignore' dist/ ec2:/var/www/punditly-api"
      }
    }
	});
};
