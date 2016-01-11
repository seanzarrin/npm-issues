'use strict';

var Github = require('github');
var q = require('q');

var github = new Github({
    // required
    version: "3.0.0",
    // optional
    debug: false, // true
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "npm-doctor" // GitHub is happy with a unique user agent
    }
});

function searchIssues(owner, repo, query) {
	var deferred = q.defer();

	var msg = {};
	msg.headers = {
		Accept: 'application/vnd.github.v3.text-match+json'
	};

	msg.q = query;

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
