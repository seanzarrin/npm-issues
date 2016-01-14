'use strict';

var Github = require('github');
var q = require('q');

var github = new Github({

    // required
    version: '3.0.0',

    // optional
    debug: false, // true
    protocol: 'https',
    host: 'api.github.com', // should be api.github.com for GitHub
    timeout: 5000,
    headers: {
        'user-agent': 'npm-doctor' // GitHub is happy with a unique user agent
    }
});

function searchIssues (repos, query) {
    var deferred = q.defer();

    var msg = {};

    msg.headers = {
        Accept: 'application/vnd.github.v3.text-match+json'
    };

    var reposQuery = repos.map(function (repo) {
        return 'repo:' + repo;
    }).join(' ');

    msg.q = query || '';

    if (reposQuery) {
        msg.q += ' ' + reposQuery;
    }

    github.search.issues(msg, function (err, res) {
        if (err) {
            deferred.reject(err);
        }

        deferred.resolve(res);
    });

    return deferred.promise;
}

module.exports = {
    searchIssues: searchIssues
};
