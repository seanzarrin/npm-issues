'use strict';

var npmHelper = require('../helpers/npm-helper');
var githubHelper = require('../helpers/github-helper');

/**
 * Search for query in the issues pages for all repos locally installed
 * @param  {String} query - The query string to search for
 * @param  {number} depth - The maximum depth of node_modules to search for
 * @return {Promise} - A Promise which resolves with a response of matches issues from github api
 */
function searchIssues (query, depth) {
    return npmHelper.getRepos(depth)
        .then(function (repos) {
            return githubHelper.searchIssues(repos, query);
        });
}

module.exports = {
    searchIssues: searchIssues
};
