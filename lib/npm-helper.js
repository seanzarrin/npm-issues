'use strict';

var sys = require('sys');
var spawn = require('child_process').spawn;
var path = require('path');
var q = require('q');

function repoSyntax(url) {
	var regex = new RegExp('github.com/([^/]*)/([^/]*)\.git');
	var matches = url.match(regex);
	return {
		owner: matches[1],
		repo: matches[2]
	};
}


function getRepos () {
	var deferred = q.defer();
	var proc = spawn('npm', ['ls', '--json', '--long']);
	var stdout = '';

	proc.stdout.on("data", function(chunk) {
		stdout += chunk;
	});

	proc.stdout.on("end", function() {
		var module = JSON.parse(stdout);

		// Mapping of module names to bug urls
		var moduleBugs = {};

		// Include the current module in collection of issues
		if (module.name && module.repository && module.repository.url) {
			moduleBugs[module.name] = repoSyntax(module.repository.url);
		}

		var queue = [];
		var dependencies = module.dependencies;
		queue.push(dependencies);

		while (queue.length) {
			dependencies = queue.pop();

			Object.keys(dependencies).forEach(function (dependency) {
				module = dependencies[dependency];

				if (module.dependencies) {
					queue.push(module.dependencies);
				}

				if (module.name && module.repository && module.repository.url) {
					moduleBugs[module.name] = repoSyntax(module.repository.url);
				}
			});
		}

		deferred.resolve(moduleBugs);
	});

	return deferred.promise;
}

module.exports = {
	getRepos: getRepos
};
