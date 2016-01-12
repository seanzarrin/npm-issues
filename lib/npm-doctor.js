'use strict';

var npmHelper = require('./npm-helper');
var githubHelper = require('./github-helper');

function searchIssues(query) {

	return npmHelper.getRepos()
		.then(function (repos) {
			return githubHelper(repos, query);
		});
}

module.exports = {
	searchIssues: searchIssues
};
