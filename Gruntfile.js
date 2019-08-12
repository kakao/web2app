/*jshint node: true */

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta : {
            banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + 
                '<%= grunt.template.today("yyyy-mm-dd") %>\\n' + 
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + 
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.copyright %>;' + 
                ' Licensed <%= _.map(pkg.licenses, "type").join(", ") %> */'
        },
        concat : {
            options: {
                separator: "\n\n"
            },
            standalone : {
                src : [
                    'node_modules/ua_parser/src/js/ua_parser.js',
                    '<%= meta.banner %>',
                    'lib/web2app.js',
                    'lib/jsversion.js'
                ],
                dest : 'dist/<%= pkg.name %>-standalone-<%= pkg.version %>.js'
            },
            dist : {
                src : [
                    '<%= meta.banner %>',
                    'lib/web2app.js',
                    'lib/jsversion.js'
                ],
                dest : 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        preprocess : {
          options: {
            context : {
              VERSION: '<%= pkg.version %>'
            }
          },
          multifile : {
            files : {
              '<%= concat.standalone.dest %>' : '<%= concat.standalone.dest %>',
              '<%= concat.dist.dest %>'   : '<%= concat.dist.dest %>'
            }
          },
        },
        uglify : {
            standalone : {
                src : [
                    '<%= concat.standalone.dest %>'
                ],
                dest : 'dist/<%= pkg.name %>-standalone-<%= pkg.version %>.min.js'
            },
            dist : {
                src : [
                    '<%= concat.dist.dest %>'
                ],
                dest : 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        jshint : {
            options : {
                jshintrc: '.jshintrc'
            },
            uses_defaults : [ 'Gruntfile.js', 'lib/*.js', 'test/*.js' ]
        },
        jasmine: {
            dist: {
                src: '<%= concat.standalone.dest %>',
                options: {
                    specs: ['test/web2app_spec.js'],
                    outfile: 'web2app_spec.html'
                }
            }
        },
        clean: {
            build: ['dist']
        }
    });

    // Load local tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-preprocess');

    // Default task.
    grunt.registerTask('test', ['jshint', 'concat', 'jasmine']);
    grunt.registerTask('build', ['clean', 'jshint', 'concat', 'jasmine', 'preprocess', 'uglify']);
    grunt.registerTask('default', ['clean', 'jshint', 'concat', 'jasmine', 'preprocess', 'uglify']);
};