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
	var github; 

	beforeEach(function () {
		github = {
			search: {
				issues: sinon.stub()
			}
		};

		githubHelper.__set__('github', github);
	});

	describe('#searchIssues', function () {

		it('Rejects with error if github.search.issues passes an error', function () {
			var error = new Error('sample error');
			github.search.issues.yields(error);

			var promise = githubHelper.searchIssues([], '');
			return assert.isRejected(promise, /sample error/);
		});

		it('Resolves with the response that github.search.issues passes', function () {
			var response = 'sample response';
			github.search.issues.yields(undefined, response);

			var promise = githubHelper.searchIssues([], '');
			return assert.isFulfilled(promise, 'sample response');
		});

		it('Calls github#searchIssues with a properly formatted github api request', function () {
			github.search.issues.yields();
			var promise = githubHelper.searchIssues(['repo1', 'repo2'], 'query');

			var expectedRequest = {
				headers: {
					Accept: 'application/vnd.github.v3.text-match+json'
				},
				q: 'query repo:repo1 repo:repo2'
			};

			promise.then(function () {
				assert.calledWith(github.search.issues, expectedRequest);
			});
		});

		describe('without repos', function () {
			it('Calls github#searchIssues with a request without repo names', function () {
				github.search.issues.yields();
				var promise = githubHelper.searchIssues([], 'query');

				var expectedRequest = {
					headers: {
						Accept: 'application/vnd.github.v3.text-match+json'
					},
					q: 'query'
				};

				return promise.then(function () {
					assert.calledWith(github.search.issues, expectedRequest);
				});
			});
		});

		describe('without a query', function () {
			it('Calls github#searchIssues with a request without a query', function () {
				github.search.issues.yields();
				var promise = githubHelper.searchIssues(['repo1', 'repo2']);

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
	});


});