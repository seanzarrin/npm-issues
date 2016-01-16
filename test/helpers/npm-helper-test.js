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
        procOn.withArgs('data').yields(JSON.stringify(npmInfo));

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

        it('calls spawn with a depth if one is specified', function () {
            procOn.withArgs('end').yields();

            return npmHelper.getRepos(3)
                .then(function () {
                    return assert.calledWith(spawn, 'npm', ['ls', '--json', '--long', '--depth=3']);
                });
        });

        it('calls spawn with a submodule if one is specified', function () {
            procOn.withArgs('end').yields();

            return npmHelper.getRepos(3, 'myrepo')
                .then(function () {
                    return assert.calledWith(spawn, 'npm', ['explore', 'myrepo', '--', 'npm', 'ls', '--json', '--long', '--depth=3']);
                });
        });

        it('rejects when spawn passes an error', function () {
            var error = new Error('sample error');

            procOn.withArgs('error').yields(error);

            var promise = npmHelper.getRepos();

            assert.isRejected(promise, /sample error/);
        });

        it('resolves with names of repos for dependencies', function () {
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

        it('does not throw if a repo has no url', function () {
            delete npmInfo.dependencies.package2.repository.url;
            procOn.withArgs('data').yields(JSON.stringify(npmInfo));
            procOn.withArgs('end').yields();

            var promise = npmHelper.getRepos();

            return assert.isFulfilled(promise);   
        });

        it('does not throw if a repo has no repository entry in package.json', function () {
            delete npmInfo.dependencies.package2.repository;
            procOn.withArgs('data').yields(JSON.stringify(npmInfo));
            procOn.withArgs('end').yields();

            var promise = npmHelper.getRepos();

            return assert.isFulfilled(promise); 
        });

        it('resolves only with the root package if noRecursive is true', function () {
            procOn.withArgs('end').yields();

            var promise = npmHelper.getRepos(undefined, undefined, true);

            return assert.becomes(promise, ['owner1/repo1']);
        });

        it('resolves only with the root package if there are no modules installed', function () {
            delete npmInfo.dependencies;
            procOn.withArgs('data').yields(JSON.stringify(npmInfo));
            procOn.withArgs('end').yields();

            var promise = npmHelper.getRepos();

            return assert.becomes(promise, ['owner1/repo1']);
        });

        it('resolves with an empty array if npm command prints nothing to stdout', function () {
            procOn.withArgs('data').yields('');
            procOn.withArgs('end').yields();

            var promise = npmHelper.getRepos();

            return assert.becomes(promise, []);
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