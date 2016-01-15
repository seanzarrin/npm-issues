'use strict';

var npmHelper = require('../helpers/npm-helper');
var githubHelper = require('../helpers/github-helper');

function searchIssues (query, depth) {
    return npmHelper.getRepos(depth)
        .then(function (repos) {
            return githubHelper.searchIssues(repos, query);
        });
}

module.exports = {
    searchIssues: searchIssues
};
