#!/usr/bin/env node
'use strict';

var minimist = require('minimist');
var npmIssues = require('../lib/npm-issues');

var options = minimist(process.argv.slice(2), {
    boolean: ['no-limit', 'norecursive']
});

npmIssues.searchIssues(options);
