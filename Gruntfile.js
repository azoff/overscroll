module.exports = function (grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: [
				'Gruntfile.js',
				// 'src/*.js',
				'test/*.js'
			],
			options: {
				// options here to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},

		connect: {
			server: {
				options: {
					port: 9000,
					base: './'
				}
			}
		},

		casper: {
			options: {
				test: true
			},
			test: {
				src: ['test/test.js']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-casper');

	grunt.registerTask('test', [
		'jshint',
        'connect:server',
        'casper'
	]);
	grunt.registerTask('default', [
		'test'
	]);

};