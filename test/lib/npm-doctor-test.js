'use strict';

var sinon = require('sinon');
var chai = require('chai');
var q = require('q');
var chaiAsPromised = require('chai-as-promised');

var npmHelper = require('../../helpers/npm-helper');
var githubHelper = require('../../helpers/github-helper');
var npmDoctor = require('../../lib/npm-doctor');

var assert = chai.assert;

sinon.assert.expose(assert, {prefix: ''});
chai.use(chaiAsPromised);

describe('npm-doctor', function () {
    var getReposStub, searchIssuesStub, repos;

    beforeEach(function () {
        getReposStub = sinon.stub(npmHelper, 'getRepos');
        searchIssuesStub = sinon.stub(githubHelper, 'searchIssues');

        repos = ['repo1', 'repo2'];
        getReposStub.returns(q(repos));
    });

    afterEach(function () {
        getReposStub.restore();
        searchIssuesStub.restore();
    });

    describe('#searchIssues', function () {
        it('calls githubHelper#searchIssues with repos and a query', function () {
            var query = 'myquery';

            var promise = npmDoctor.searchIssues(query);

            return promise.then(function () {
                assert.calledWith(searchIssuesStub, repos, query);
            });
        });

        it('resolves to the result of githubHelper#searchIssues', function () {
            var query = 'myquery';

            searchIssuesStub.returns(q('result'));

            var promise = npmDoctor.searchIssues(query);

            return assert.becomes(promise, 'result');            
        });
    });
});
