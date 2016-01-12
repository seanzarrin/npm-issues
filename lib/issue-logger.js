'use strict';

var chalk = require('chalk');

function printIssues(issues) {
	var numIssues = issues.total_count;

	console.log(chalk.green('Found ' + numIssues + ' issues...\n'));

	issues.items.forEach(function (issue) {
		console.log('\n' + chalk.bgBlue(issue.html_url) + '\n');

		issue.text_matches.forEach(function (textMatch) {
			console.log(textMatch.fragment);
		});
	});
}

module.exports = {
	printIssues: printIssues
};
