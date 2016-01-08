'use strict';

var sys = require('sys');
var exec = require('child_process').exec;
var path = require('path');
var q = require('q');


function getBugUrls () {
	var deferred = q.defer();

	exec('npm ls --json --long', function (err, stdout, stderr) {
		if (err) {
			deferred.reject(err);
		}

		var module = JSON.parse(stdout);

		// Mapping of module names to bug urls
		var moduleBugs = {};

		// Include the current module in collection of issues
		if (module.name && module.bugs) {
			moduleBugs[module.name] = module.bugs.url;
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

				if (module.name && module.bugs) {
					moduleBugs[module.name] = module.bugs.url;
				}
			});
		}

		deferred.resolve(moduleBugs);

	});

	return deferred.promise;
}

module.exports = {
	getBugUrls: getBugUrls
};
