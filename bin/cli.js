#!/usr/bin/env node
'use strict';

var minimist = require('minimist');
var npmDoctor = require('../lib/npm-doctor');

var options = minimist(process.argv.slice(2), {
    boolean: ['no-limit', 'norecursive']
});

npmDoctor.searchIssues(options);
