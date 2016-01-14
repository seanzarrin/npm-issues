'use strict';

var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var rewire = require('rewire');
var npmHelper = rewire('../../helpers/npm-helper');

var assert = chai.assert;

sinon.assert.expose(assert, {prefix: ''});
chai.use(chaiAsPromised);

describe('npm-helper', function () {
	var spawn, procOn, npmInfo;

	beforeEach(function () {
		npmInfo = {
			repository: {
				url: 'git://github.com/owner1/repo1.git'
			},
			dependencies: {
				package2: {
					repository: {
						url: 'git://github.com/owner2/repo2.git'
					}
				},
				package3: {
					repository: {
						url: 'git://github.com/owner3/repo3.git'
					},
					dependencies: {
						package4: {
							repository: {
								url: 'git://github.com/owner4/repo4.git4'
							},
							dependencies: {}
						}
					}
				}
			}
		};

		procOn = sinon.stub();

		spawn = sinon.stub().returns({
			stdout: {
				on: procOn
			}
		});

		npmHelper.__set__('spawn', spawn);
	});

	describe('#getRepos', function () {

		it('calls spawn with the proper arguments to npm', function () {
			procOn.withArgs('end').yields();

			return npmHelper.getRepos()
				.then(function () {
					return assert.calledWith(spawn, 'npm', ['ls', '--json', '--long']);
				});
		});

		it('rejects when spawn passes an error', function () {
			var error = new Error('sample error');

			procOn.withArgs('error').yields(error);

			var promise = npmHelper.getRepos();

			assert.isRejected(promise, /sample error/);
		});

		it('resolves with names of repos for dependencies', function () {
			procOn.withArgs('data').yields(JSON.stringify(npmInfo));
			procOn.withArgs('end').yields();

			var promise = npmHelper.getRepos();

			return promise.then(function (repoNames) {
				assert.sameMembers(repoNames, ['owner1/repo1', 'owner2/repo2', 'owner3/repo3', 'owner4/repo4']);
			});
		});

		it('does not include repo names that are not parseable', function () {
			npmInfo.dependencies.package2.repository.url = 'notarepo';

			procOn.withArgs('data').yields(JSON.stringify(npmInfo));
			procOn.withArgs('end').yields();

			var promise = npmHelper.getRepos();

			return promise.then(function (repoNames) {
				assert.sameMembers(repoNames, ['owner1/repo1', 'owner3/repo3', 'owner4/repo4']);
			});
		});
	});

	describe('#getRepoName', function () {
		it('retrieves the repo name from a github url', function () {
			var url = 'git://github.com/owner/repo.git';

			var repoName = npmHelper.getRepoName(url);

			assert.equal(repoName, 'owner/repo');
		});

		it('returns undefined if it is unable to parse a repo name', function () {
			var url = 'theresnoreponamehere';

			var repoName = npmHelper.getRepoName(url);

			assert.isNull(repoName);
		});
	});
});