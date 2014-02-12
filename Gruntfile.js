module.exports = function (grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: [
				'Gruntfile.js',
				'dist/jquery.overscroll.js',
				'test/*.js',
				'test/modules/*.js',
				'test/drift-canvas/js/app.js'
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

		uglify: {
			overscroll: {
				options: {
					preserveComments: 'some',
					sourceMap: 'dist/jquery.overscroll.map'
				},
				files: {
					'dist/jquery.overscroll.min.js': ['dist/jquery.overscroll.js']
				}
			}
		},

		connect: {
			server: {
				options: {
					port: 9000,
					base: './'
				}
			},
			driftcanvas: {
				options: {
					port: 8999,
					base: './test/',
					keepalive: true
				}
			}
		},

		casperjs: {
			files: ['test/*.js']
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-casperjs');

	grunt.registerTask('test', [
		'jshint',
		'connect:server',
		'casperjs'
	]);

	grunt.registerTask('min', [
		'jshint',
		'uglify'
	]);

	grunt.registerTask('default', [
		'test'
	]);

};