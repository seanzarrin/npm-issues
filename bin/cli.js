#!/usr/bin/env node

var npmDoctor = require('../lib/npm-doctor');
var issueLogger = require('../lib/issue-logger');

var query = process.argv[2];

npmDoctor.searchIssues(query)
	.then(issueLogger.printIssues);
