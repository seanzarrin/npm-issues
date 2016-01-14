
var npmDoctor = require('./lib/npm-doctor');
var issueLogger = require('./lib/issue-logger');

npmDoctor.searchIssues()
    .then(issueLogger.printIssues);
