module.exports = function(grunt) {
	grunt.loadNpmTasks("grunt-sass");

	grunt.initConfig({
		sass: {
			options: {
				implementation: sass,
				sourceMap: true
			},
			style: {
				files: {
					'main.css': 'main.scss'
				}
			}
		}
	});
};