/*global module:false*/

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
        remotefile : {
            dist: {
                url:'http://m1.daumcdn.net/svc/original/U03/cssjs/userAgent/userAgent-1.0.11.min.js',
                dest:'dependency/userAgent.js'    
            }
        },
        concat : {
            options: {
                separator: "\n\n"
            },
            forTest : {
                src : [
                    '<banner:meta.banner>',
                    '<%= remotefile.dist.dest%>',
                    'lib/*.js'
                ],
                dest : 'dist/<%= pkg.name %>-<%= pkg.version %>.forTest.js'
            },
            dist : {
                src : [
                    '<banner:meta.banner>',
                    'lib/*.js'
                ],
                dest : 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        jsversion : {
            dist : {
                namespace : 'daumtools',
                src : '<%= concat.dist.dest %>',
                dest : 'dist/<%= pkg.name %>-<%= pkg.version %>.v.js'
            }  
        },
        uglify : {
            dist : {
                src : [
                    '<%= meta.banner %>', 
                    '<%= jsversion.dist.dest %>'
                ],
                dest : 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        jshint : {
            options : {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                loopfunc: true,
                globals: {
                    node: true,
                    exports: true,
                    require: true,
                    describe: true,
                    it: true,
                    beforeEach: true,
                    before: true,
                    expect: true
                }
            },
            uses_defaults : [ 'Gruntfile.js', 'lib/*.js', 'test/*.js' ]
        },
        jasmine: {
            dist: {
                src: '<%= concat.forTest.dest %>',
                options: {
                    specs: ['test/web2app_spec.js'],
                    outfile: 'web2app_spec.html'
                }
            }
        }
    });

    // Load local tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jsversion');
    grunt.loadNpmTasks('grunt-remotefile');

    // Default task.
    grunt.registerTask('test', ['jshint', 'concat', 'jasmine']);
    grunt.registerTask('default', ['remotefile', 'jshint', 'concat', 'jasmine', 'jsversion', 'uglify']);
};