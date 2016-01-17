'use strict';

var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var rewire = require('rewire');

var githubHelper = rewire('../../helpers/github-helper');

var assert = chai.assert;

sinon.assert.expose(assert, {prefix: ''});
chai.use(chaiAsPromised);

describe('github-helper', function () {
    var github, sampleResponse, repos;

    beforeEach(function () {
        github = {
            search: {
                issues: sinon.stub()
            }
        };

        sampleResponse = {
            total_count: 0,
            items: []
        };

        repos = ['repo1', 'repo2'];

        github.search.issues.yields(null, sampleResponse);

        githubHelper.__set__('github', github);
    });

    describe('#searchIssues', function () {

        it('Rejects with error if github.search.issues passes an error', function () {
            var error = new Error('sample error');
            github.search.issues.yields(error);

            var promise = githubHelper.searchIssues(repos, '');
            return assert.isRejected(promise, /sample error/);
        });

        it('Resolves with the response that github.search.issues passes', function () {
            var promise = githubHelper.searchIssues(repos, '');
            return assert.isFulfilled(promise, 'sample response');
        });

        it('Calls github.search.issues with a properly formatted github api request', function () {
            var promise = githubHelper.searchIssues(repos, 'query');

            var expectedRequest = {
                headers: {
                    Accept: 'application/vnd.github.v3.text-match+json'
                },
                q: 'query repo:repo1 repo:repo2'
            };

            return promise.then(function () {
                assert.calledWith(github.search.issues, expectedRequest);
            });
        });

        it('Calls github.search.issues with a state if one is given', function () {
            var promise = githubHelper.searchIssues(repos, 'query', 'open');

            var expectedRequest = {
                headers: {
                    Accept: 'application/vnd.github.v3.text-match+json'
                },
                q: 'query state:open repo:repo1 repo:repo2'
            };

            return promise.then(function () {
                assert.calledWith(github.search.issues, expectedRequest);
            });
        });

        describe('without repos', function () {
            it('Rejects with an error message', function () {
                var promise = githubHelper.searchIssues([], 'query');

                return assert.isRejected(promise, 'Could not find any issues urls to search through');
            });
        });

        describe('without a query', function () {
            it('Calls github.search.issues with a request without a query', function () {
                var promise = githubHelper.searchIssues(repos);

                var expectedRequest = {
                    headers: {
                        Accept: 'application/vnd.github.v3.text-match+json'
                    },
                    q: ' repo:repo1 repo:repo2'
                };

                return promise.then(function () {
                    assert.calledWith(github.search.issues, expectedRequest);
                });
            });
        });

        describe('with a huge query', function () {
            var repos;

            beforeEach(function () {
                repos = [];

                for (var i = 0; i < 500; i++) {
                    repos.push('random_repo');
                }

                github.search.issues.yields(null, {
                    total_count: 1,
                    items: ['item']
                });
            });

            it('Calls github.search.issues multiple times to fit url limit', function () {
                var promise = githubHelper.searchIssues(repos, 'query');

                return promise.then(function () {
                    assert.equal(github.search.issues.callCount, 9);
                });
            });

            it('Concatenates the results of the multiple requests', function () {
                var promise = githubHelper.searchIssues(repos, 'query');

                var expectedItems = [];

                for (var i = 0; i < 9; i++) {
                    expectedItems.push('item');
                }

                return assert.becomes(promise, {
                    total_count: 9,
                    items: expectedItems
                });
            });
        });
    });


});