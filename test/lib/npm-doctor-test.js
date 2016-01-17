'use strict';

var sinon = require('sinon');
var chai = require('chai');
var q = require('q');
var chaiAsPromised = require('chai-as-promised');
var rewire = require('rewire');

var npmHelper = require('../../helpers/npm-helper');
var githubHelper = require('../../helpers/github-helper');
var issueLogger = require('../../lib/issue-logger');
var npmDoctor = rewire('../../lib/npm-doctor');

var assert = chai.assert;

sinon.assert.expose(assert, {prefix: ''});
chai.use(chaiAsPromised);

describe('npm-doctor', function () {
    // Stubs
    var getReposStub;
    var searchIssuesStub;
    var logIssuesStub;
    var consoleLogStub;
    var consoleErrorStub;

    var query;
    var repos;
    var options;
    var logIssuesResult;

    beforeEach(function () {
        getReposStub = sinon.stub(npmHelper, 'getRepos');
        searchIssuesStub = sinon.stub(githubHelper, 'searchIssues');
        logIssuesStub = sinon.stub(issueLogger, 'log');

        query = 'myquery';
        repos = ['repo1', 'repo2'];
        getReposStub.returns(q(repos));

        logIssuesResult = 'result';
        searchIssuesStub.returns(q(logIssuesResult));

        options = {
            _: [query]
        };

        consoleLogStub = sinon.stub();
        consoleErrorStub = sinon.stub();
        npmDoctor.__set__('console', {
            log: consoleLogStub,
            error: consoleErrorStub
        });
    });

    afterEach(function () {
        getReposStub.restore();
        searchIssuesStub.restore();
        logIssuesStub.restore();
    });

    describe('#searchIssues', function () {
        describe('- no options object is given', function () {
            assert.throws(function () {
                npmDoctor.searchIssues();
            }, Error, 'must specify an options object');
        });

        describe('- no query is given', function () {
            beforeEach(function () {
                options = {
                    _: []
                };
            });

            it('logs usage information', function () {
                npmDoctor.searchIssues(options);
                assert.calledWith(consoleLogStub, sinon.match(/Usage/));
            });

            it('returns a promise which resolves to undefined', function () {
                var returnValue = npmDoctor.searchIssues(options);
                return assert.becomes(returnValue, undefined);
            });
        });

        describe('- query is given', function () {
            it('calls githubHelper#searchIssues with repos, query, and default state of open', function () {
                var promise = npmDoctor.searchIssues(options);

                return promise.then(function () {
                    assert.calledWith(searchIssuesStub, repos, query, 'open');
                });
            });

            it('calls issueLogger#log with issues and a default limit of 10', function () {
                var promise = npmDoctor.searchIssues(options);

                return promise.then(function () {
                    assert.calledWith(logIssuesStub, logIssuesResult, 10);
                });
            });

            it('resolves to undefined', function () {
                var promise = npmDoctor.searchIssues(options);

                return assert.becomes(promise, undefined);            
            });

            it('logs any errors thrown to std.err', function () {
                var error = new Error('error');
                searchIssuesStub.throws(error);

                var promise = npmDoctor.searchIssues(options);

                return promise.then(function () {
                    assert.calledWith(consoleErrorStub, error);
                });
            });

            describe('- additional options are given', function () {
                it('calls npmHelper#getRepos with depth if one is given', function () {
                    options.depth = 5;
                    var promise = npmDoctor.searchIssues(options);

                    return promise.then(function () {
                        assert.calledWith(getReposStub, 5);
                    });
                });

                it('calls npmHelper#getRepos with module if one is given', function () {
                    options.module = 'mymodule';
                    var promise = npmDoctor.searchIssues(options);

                    return promise.then(function () {
                        assert.calledWith(getReposStub, undefined, 'mymodule');
                    });
                });

                it('calls npmHelper#getRepos with noRecursive as true if it is set', function () {
                    options.norecursive = true;
                    var promise = npmDoctor.searchIssues(options);

                    return promise.then(function () {
                        assert.calledWith(getReposStub, undefined, undefined, true);
                    });
                });

                it('calls issueLogger with a different limit if one is specified', function () {
                    options.limit = 20;
                    var promise = npmDoctor.searchIssues(options);

                    return promise.then(function () {
                        assert.calledWith(logIssuesStub, logIssuesResult, 20);
                    });
                });

                it('calls issueLogger with no limit if noLimit is set', function () {
                    options.nolimit = true;
                    var promise = npmDoctor.searchIssues(options);

                    return promise.then(function () {
                        assert.calledWith(logIssuesStub, logIssuesResult, undefined);
                    });
                });

                it('calls githubHelper#searchIssues with state if one is specified', function () {
                    options.state = 'closed';
                    var promise = npmDoctor.searchIssues(options);

                    return promise.then(function () {
                        assert.calledWith(searchIssuesStub, repos, query, 'closed');
                    });
                });

                describe('- with invalid options', function () {
                    it('prints an error when depth is set to non-number', function () {
                        options.depth = 'notanumber';

                        var promise = npmDoctor.searchIssues(options);

                        return promise.catch(function () {
                            assert.calledWith(consoleLogStub, '--depth must be a number');
                        });
                    });

                    it('prints an error when log is set to non-number', function () {
                        options.limit = 'notanumber';

                        var promise = npmDoctor.searchIssues(options);

                        return promise.catch(function () {
                            assert.calledWith(consoleLogStub, '--limit must be a number');
                        });
                    });

                    it('prints an error when module is set to non-string', function () {
                        options.module = 5;

                        var promise = npmDoctor.searchIssues(options);

                        return promise.catch(function () {
                            assert.calledWith(consoleLogStub, '--module must be a string');
                        });
                    });

                    it('prints an error when state is set to non-string', function () {
                        options.state = 5;

                        var promise = npmDoctor.searchIssues(options);

                        return promise.catch(function () {
                            assert.calledWith(consoleLogStub, '--state must be either "open" or "closed"');
                        });
                    });

                    it('prints an error when state is set to neither open or closed', function () {
                        options.state = 'notopen';

                        var promise = npmDoctor.searchIssues(options);

                        return promise.catch(function () {
                            assert.calledWith(consoleLogStub, '--state must be either "open" or "closed"');
                        });
                    });

                    it('rejects when options object is not constructed properly', function () {
                        options.module = 5;

                        var promise = npmDoctor.searchIssues(options);

                        return assert.isRejected(promise, /Invalid options object/);
                    });
                });
            });

        });
    });
});
