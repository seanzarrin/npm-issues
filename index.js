
var npmHelper = require('./lib/npm-helper');
var githubHelper = require('./lib/github-helper');
var _ = require('lodash');
var q = require('q');
var chalk = require('chalk');

function printIssues(repos) {
	var repoNames = Object.keys(repos);

	var promises = repoNames.map(function (repoName) {
		var owner = repos[repoName].owner;
		return githubHelper.searchIssues(owner, repoName, 'error');
	});

	return q.all(promises)
		.then(function (results) {
			results.forEach(function (result, index) {
				console.log(chalk.blue(repoNames[index]));

				var matches = result.items.map(function (match) {
					return match.body;
				});

				console.log(matches);
			});
		})
		.catch(function (err) {
			console.error(err);
		});
}

npmHelper.getRepos()
	.then(printIssues);
