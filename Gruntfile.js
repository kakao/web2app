/*jshint node: true */

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta : {
            banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + 
                '<%= grunt.template.today("yyyy-mm-dd") %>\\n' + 
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + 
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.copyright %>;' + 
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        concat : {
            options: {
                separator: "\n\n"
            },
            standalone : {
                src : [
                    'bower_components/ua_parser/src/js/userAgent.js',
                    '<%= meta.banner %>',
                    'lib/*.js'
                ],
                dest : 'dist/<%= pkg.name %>-standalone-<%= pkg.version %>.js'
            },
            dist : {
                src : [
                    '<%= meta.banner %>',
                    'lib/*.js'
                ],
                dest : 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        jsversion : {
            standalone : {
                namespace : 'daumtools',
                src : '<%= concat.standalone.dest %>',
                dest : '<%= concat.standalone.dest %>'
            },
            dist : {
                namespace : 'daumtools',
                src : '<%= concat.dist.dest %>',
                dest : '<%= concat.dist.dest %>'
            }
        },
        uglify : {
            standalone : {
                src : [
                    '<%= jsversion.standalone.dest %>'
                ],
                dest : 'dist/<%= pkg.name %>-standalone-<%= pkg.version %>.min.js'
            },
            dist : {
                src : [
                    '<%= jsversion.dist.dest %>'
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
    grunt.loadNpmTasks('grunt-jsversion');
    grunt.loadNpmTasks('grunt-remotefile');

    // Default task.
    grunt.registerTask('test', ['jshint', 'concat', 'jasmine']);
    grunt.registerTask('build', ['clean', 'jshint', 'concat', 'jasmine', 'jsversion', 'uglify']);
};