'use strict';

var Github = require('github');
var q = require('q');

var MAX_URL_LENGTH = 1000; // Keep url length at reasonable size so request is not rejected

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

/**
 * Adds repo to list of repos in github query
 * @param  {String} query - The string to search for
 * @param  {String} repo - An additional repo to search through
 * @return {String} - The resulting query with repo added
 */
function _appendRepoToQuery (query, repo) {
    return query + ' repo:' + repo;
}

/**
 * Creates a request object to search for github issues containing query
 * @param  {String} query - The string to search for
 * @param  {Object} headers - The headers to send with the request
 * @return {Object} The request object
 */
function _createGithubRequest (query, headers) {
    return {
        headers: headers,
        q: query
    };
}

/**
 * Creates an array of request objects for searching github issues, split up so not to pass url limit
 * @param  {String[]} repos - An array of repo names to search through
 * @param  {String} query - The string to search through issues with
 * @param  {Object} headers - The header to include in the request
 * @return {Object[]} - The array of request objects
 */
function _createGithubRequests (repos, query, headers) {
    query = query || '';
    var requests = [];
    var currentQuery = query;

    repos.forEach(function (repo) {
        var newQuery = _appendRepoToQuery(currentQuery, repo);

        if (newQuery.length > MAX_URL_LENGTH) {
            requests.push(_createGithubRequest(currentQuery, headers));

            currentQuery = _appendRepoToQuery(query, repo);
        }
        else {
            currentQuery = newQuery;
        }
    });

    requests.push(_createGithubRequest(currentQuery, headers));

    return requests;
}

/**
 * Search repos on github for issues containing query
 * @param  {String[]} repos - An array of repo names formatted as owner/repo
 * @param  {String} query - A query to search for in the issues
 * @return {Promise} A promise which resolves with the concatenated result from github api
 */
function searchIssues (repos, query, state) {
    if (!repos.length) {
        var deferred = q.defer();
        deferred.reject('Could not find any issues urls to search through');
        return deferred.promise;
    }

    var headers = {
        Accept: 'application/vnd.github.v3.text-match+json'
    };

    if (state) {
        query += ' state:' + state;
    }

    var requests = _createGithubRequests(repos, query, headers);

    var promises = requests.map(function (request) {
        var deferred = q.defer();

        github.search.issues(request, function (err, res) {
            if (err) {
                deferred.reject(err);
            }

            deferred.resolve(res);
        });

        return deferred.promise;
    });

    var concatenatedResult = {};
    concatenatedResult.total_count = 0;
    concatenatedResult.items = [];

    return q.all(promises)
        .then(function (responses) {
            responses.forEach(function (response) {
                concatenatedResult.total_count += response.total_count;
                concatenatedResult.items = concatenatedResult.items.concat(response.items);           
            });

            return concatenatedResult;
        });
}

module.exports = {
    searchIssues: searchIssues
};
