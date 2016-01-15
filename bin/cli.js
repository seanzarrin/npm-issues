#!/usr/bin/env node
'use strict';

var minimist = require('minimist');
var npmDoctor = require('../lib/npm-doctor');
var issueLogger = require('../lib/issue-logger');
var chalk = require('chalk');

var options = minimist(process.argv.slice(2), {
    boolean: 'no-limit'
});

var query = options._[0];
var depth = options.depth;
var limit = options.limit;
var noLimit = options['nolimit'];

if (!query) {
    console.log([
        '',
        'Usage: npm-doctor [options] [query]',
        '',
        'Examples: npm-doctor "An issue that I need to search for"',
        '          npm-doctor --nolimit "An issue that I need to search for"',
        '          npm-doctor --depth 2 "An issue that I need to search for"',
        '          npm-doctor --depth 2 --limit 10 "An issue that I need to search for"',
        '',
        'Options:',
        '--depth [int]    The maximum depth of your local node modules that should be included in the search',
        '--limit [int]    (defaults to 10) The maximum number of results you would like logged to console',
        '--nolimit        Removes the default limit of 10 issues for logging'
    ].join('\n'));

    return;
}

// Default limit is 10
if (!noLimit && !limit) {
    console.log(chalk.green('Using default limit of 10. To increase this, choose a limit or specify nolimit'));
    limit = 10;
}

npmDoctor.searchIssues(query, depth)
    .then(function (issues) {
        issueLogger.log(issues, limit);
    })
    .catch(function (err) {
        console.error([
            'GitHub rate limits requests, so you may have to wait a minute to try again',
            'If you keep seeing this message, try with a smaller depth (ie: npm-doctor --depth 1)',
            'If you still keep seeing this, report a bug at https://github.com/seanzarrin/npm-doctor/issues'

        ].join('\n'));
    });
