#!/usr/bin/env node
'use strict';

var npmDoctor = require('../lib/npm-doctor');
var issueLogger = require('../lib/issue-logger');

var query = process.argv[2];

npmDoctor.searchIssues(query)
    .then(issueLogger.log);
