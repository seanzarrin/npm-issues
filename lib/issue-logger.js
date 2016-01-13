'use strict';

var chalk = require('chalk');

function colorMatches(textMatch) {
	var fragment = textMatch.fragment;

	textMatch.matches.forEach(function (match) {
		fragment = fragment.replace(match.text, chalk.bgGreen(match.text));
	});

	return fragment;
}

function printIssues(issues) {
	var numIssues = issues.total_count;

	console.log(chalk.green('Found ' + numIssues + ' issues...\n'));

	issues.items.forEach(function (issue) {
		console.log('\n' + chalk.bgBlue(issue.html_url) + '\n');

		issue.text_matches.forEach(function (textMatch) {
			console.log(colorMatches(textMatch));
		});
	});
}

module.exports = {
	printIssues: printIssues
};
