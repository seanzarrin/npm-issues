npm-issues
==============================
[![Build Status](https://travis-ci.org/seanzarrin/npm-issues.svg?branch=master)](https://travis-ci.org/seanzarrin/npm-issues)

npm-issues is a command that searches known issues of all your installed npm modules at once, and gives you the matching results of your query.

## Example

For example, when this happens
```sh
npm install
npm start
RangeError: Maximum call stack size exceeded
# wait what... but this was working a second ago
```

do this,
```sh
npm-issues "RangeError: Maximum call stack size exceeded"
found 1 result...

https://github.com/holman/a_bad_module/issues/109

the new version of a_bad_module is saying call stack size exceeded. Here's how I fixed it.
```

In the above example, a_bad_module was a dependency of my project, and my project was working fine. But when I ran `npm install` a newer version was pulled in that _shouldn't_ have broken anything, but did with a cryptic error message. Running `npm-issues` with the error message gave a text-snippet of an issue already filed against one of my dependencies, and includes the url to that issue.

## Installation
```sh
npm install -g npm-issues
```

## Usage
```sh
npm-issues [options] [query]
```

where the following options are available:  
`--depth [int]`           The maximum depth of your local node modules that should be included in the search  
`--limit [int]`           (defaults to `10`) The maximum number of results you would like logged to console  
`--nolimit`               Removes the default limit of 10 issues for logging  
`--module [module]`        Restricts searching to a submodule in the current module  
`--norecursive`            Will not recursively search submodules for dependencies  
`--state [open|closed]`   (defaults to `open`) Only include issues that are either `open` or `closed`.  

## Bugs
When you find issues with npm-issues, please file them here https://github.com/seanzarrin/npm-issues/issues

## Contributions
Feel free to contribue. But please add tests and keep coverage at 100%. You can run tests by doing `npm test`, and view the coverage report at the bottom of the output.

## License
MIT
