'use strict';

var sinon = require('sinon');
var chai = require('chai');
var chalk = require('chalk');
var rewire = require('rewire');

var issueLogger = rewire('../../lib/issue-logger');

var assert = chai.assert;

sinon.assert.expose(assert, {prefix: ''});

describe('issue-logger', function () {
    describe('#printIssues', function () {
        var issuesObject, consoleStub;

        beforeEach(function () {
            issuesObject = {
                total_count: 1,
                items: [{
                    html_url: 'issue_url',
                    text_matches: [
                        {
                            fragment: 'the fragment of text',
                            matches: [
                                {
                                    text: 'text'
                                }
                            ]
                        }

                    ]
                }]
            };

            consoleStub = sinon.stub();

            issueLogger.__set__('console', {
                log: consoleStub
            });
        });

        it('logs the total number of issues found in green', function () {
            issueLogger.log(issuesObject);
            assert.calledWith(consoleStub, chalk.green('Found 1 issues...\n'));
        });

        it('logs the issues urls with a blue background', function () {
            issueLogger.log(issuesObject);
            assert.calledWith(consoleStub, '\n' + chalk.bgBlue('issue_url') + '\n');
        });

        it('logs the fragment matches with matched text in a green background', function () {
            issueLogger.log(issuesObject);
            assert.calledWith(consoleStub, 'the fragment of ' + chalk.bgGreen('text'));
        });

        it('will log up to a number of issues if a limit is set', function () {
            issuesObject.items.push({
                html_url: 'issue_url',
                text_matches: [
                    {
                        fragment: 'the fragment of text',
                        matches: [
                            {
                                text: 'text'
                            }
                        ]
                    }
                ]
            });
            issueLogger.log(issuesObject, 1);
            assert.equal(consoleStub.callCount, 3);
        });

    });
});
