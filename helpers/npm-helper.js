'use strict';

var spawn = require('child_process').spawn;
var q = require('q');

function _addRepository (repos, module) {
    var repoName;

    if (module.repository && module.repository.url) {
        repoName = getRepoName(module.repository.url);
        if (repoName) {
            repos[repoName] = true;
        }
    }
}

function getRepoName (url) {
    var regex = new RegExp('github.com/([^/]*/[^/]*)\.git');
    var matches = url.match(regex);
    return matches && matches[1];
}

function getRepos () {
    var deferred = q.defer();
    var proc = spawn('npm', ['ls', '--json', '--long']);
    var stdout = '';

    proc.stdout.on('error', function (err) {
        deferred.reject(err);
    });

    proc.stdout.on('data', function (chunk) {
        stdout += chunk;
    });

    proc.stdout.on('end', function () {
        var module = JSON.parse(stdout || '{}');

        // Mapping of module names to bug urls
        var repos = {};

        // Include the current module in collection of issues
        _addRepository(repos, module);

        var queue = [];
        var dependencies = module.dependencies;

        if (dependencies) {
            queue.push(dependencies);
        }

        while (queue.length) {
            dependencies = queue.pop();

            Object.keys(dependencies).forEach(function (dependency) {
                module = dependencies[dependency];

                if (module.dependencies) {
                    queue.push(module.dependencies);
                }

                _addRepository(repos, module);
            });
        }

        deferred.resolve(Object.keys(repos));
    });

    return deferred.promise;
}

module.exports = {
    getRepoName: getRepoName,
    getRepos: getRepos
};
