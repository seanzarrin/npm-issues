#!/usr/bin/env node
'use strict';

var minimist = require('minimist');
var npmDoctor = require('../lib/npm-doctor');
var issueLogger = require('../lib/issue-logger');

var options = minimist(process.argv.slice(2));

var query = options._[0];
var depth = options.depth;
var limit = options.limit;

if (!query) {
    console.log([
        '',
        'Usage: npm-doctor [options] [query]',
        '',
        'Examples: npm-doctor "An issue that I need to search for"',
        '          npm-doctor --depth 2 "An issue that I need to search for"',
        '          npm-doctor --depth 2 --limit 10 "An issue that I need to search for"',
        '',
        'Options:',
        '--depth [int]    The maximum depth of your local node modules that should be included in the search',
        '--limit [int]    The maximum number of results you would like logged to console'
    ].join('\n'));

    return;
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
