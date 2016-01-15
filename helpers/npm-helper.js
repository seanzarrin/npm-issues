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

/**
 * Parses a repo name from a repo url
 * @param  {String} url - The url to parse the repo name from
 * @return {String} The repo name in format owner/repo. Undefined otherwise
 */
function getRepoName (url) {
    var regex = new RegExp('github.com/([^/]*/[^/]*)\.git');
    var matches = url.match(regex);
    return matches && matches[1];
}

/**
 * Find all modules locally installed in this package
 * @param  {number} depth - Optional argument to limit depth of installs to traverse
 * @return {Promise} A promise which resolves to a list of repo names
 */
function getRepos (depth) {
    var deferred = q.defer();
    var lsArgs = ['ls', '--json', '--long'];

    if (typeof depth !== 'undefined' && depth !== null) {
        lsArgs.push('--depth='+depth);
    }

    var proc = spawn('npm', lsArgs);
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
