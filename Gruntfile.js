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
        concat : {
            options: {
                separator: "\n\n"
            },
            dist : {
                src : [
                    '<banner:meta.banner>',
                    'src/js/*.js'
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
                curly : true,
                eqeqeq : true,
                immed : false,
                latedef : true,
                newcap : true,
                noarg : true,
                sub : true,
                undef : true,
                boss : true,
                eqnull : true,
                browser : true
            },
            globals : {},
            uses_defaults : [ 'Gruntfile.js', 'src/js/*.js', 'src/test-js/*.js' ]
        }
    });

    // Load local tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsversion');

    // Default task.
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('default', ['jshint', 'concat', 'jsversion', 'uglify']);

};