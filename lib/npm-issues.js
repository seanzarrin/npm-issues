'use strict';

var chalk = require('chalk');
var q = require('q');

var npmHelper = require('../helpers/npm-helper');
var githubHelper = require('../helpers/github-helper');
var issueLogger = require('../lib/issue-logger');

function isValidOptions (options) {
    if (!options) {
        throw new Error('must specify an options object');
    }

    if (options.depth && typeof options.depth !== 'number') {
        console.log('--depth must be a number');
        return false;
    }

    if (options.limit && typeof options.limit !== 'number') {
        console.log('--limit must be a number');
        return false;
    }

    if (options.module && typeof options.module !== 'string') {
        console.log('--module must be a string');
        return false;
    }

    if (options.state) {
        if (typeof options.state !== 'string' || (options.state !== 'open' && options.state !== 'closed')) {
            console.log('--state must be either "open" or "closed"');
            return false;
        }
    }

    return true;
}

/**
 * Search for query in the issues pages for all repos locally installed, and log them
 * @param  {Object} options - Options specified from command line
 * @return {Promise} - A Promise which resolves when finished with logging issues
 */
function searchIssues (options) {
    options = options;

    if (!isValidOptions(options)) {
        var deferred = q.defer();
        deferred.reject('Invalid options object');
        return deferred.promise;
    }

    var query = options._[0];
    var depth = options.depth;
    var limit = options.limit;
    var noLimit = options.nolimit;
    var submodule = options.module;
    var state = options.state;
    var noRecursive = options.norecursive;
    var state = options.state;
    var isGlobal = options.global;

    if (!query) {
        console.log([
            '',
            'Usage: npm-issues [options] [query]',
            '',
            'Examples: npm-issues "An issue that I need to search for"',
            '          npm-issues --nolimit "An issue that I need to search for"',
            '          npm-issues --depth 2 "An issue that I need to search for"',
            '          npm-issues --depth 2 --limit 10 "An issue that I need to search for"',
            '          npm-issues --module lodash --depth 0 "An issue that I need to search for"',
            '',
            'Options:',
            '--depth [int]           The maximum depth of your local node modules that should be included in the search',
            '--limit [int]           (defaults to 10) The maximum number of results you would like logged to console',
            '--nolimit               Removes the default limit of 10 issues for logging',
            '--module [module]       Restricts searching to a submodule',
            '--norecursive           Will not recursively search submodules for dependencies',
            '--state [open|closed]   (defaults to open) Only include issues that are either open or closed.',
            '--global                Search issues for modules that have been globally installed'
        ].join('\n'));

        return q();
    }

    // Default limit is 10
    if (!noLimit && !limit) {
        console.log(chalk.green('Using default limit of 10. To increase this, choose a limit or specify nolimit'));
        limit = 10;
    }

    // Default state is open
    if (!state) {
        state = 'open';
    }

    return npmHelper.getRepos(depth, submodule, noRecursive, isGlobal)
        .then(function (repos) {
            return githubHelper.searchIssues(repos, query, state);
        })
        .then(function (issues) {
            issueLogger.log(issues, limit);
        })
        .catch(function (err) {
            console.error(err);
        });
}

module.exports = {
    searchIssues: searchIssues
};
