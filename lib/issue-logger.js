'use strict';

var chalk = require('chalk');

function colorMatches (textMatch) {
    var fragment = textMatch.fragment;

    textMatch.matches.forEach(function (match) {
        fragment = fragment.replace(match.text, chalk.bgGreen(match.text));
    });

    return fragment;
}

/**
 * log issues in a nice format for the console
 * @param  {Object} issues - Object of issues with the following format:
 *   total_count - number of issues
 *   items - an array of objects with the following format:
 *        html_url - url of the issue
 *        text_matches - an array of objects of the format
 *          fragment - snippet of text containing a match to the query
 *          matches - an array of objects of the following format
 *            text - the match to the query
 * @param  {Object} limit - The maximum number of results to log
 */
function log (issues, limit) {
    var numIssues = issues.total_count;

    console.log(chalk.green('Found ' + numIssues + ' issues...\n'));

    var issuesToLog = issues.items.length;

    if (typeof limit !== 'undefined' && limit !== null && limit < issuesToLog) {
        issuesToLog = limit;
    }

    var issue;

    for (var index = 0; index < issuesToLog; index++) {
        issue = issues.items[index];
        console.log('\n' + chalk.bgBlue(issue.html_url) + '\n');

        issue.text_matches.forEach(function (textMatch) {
            console.log(colorMatches(textMatch));
        });
    }}

module.exports = {
    log: log
};
