npm-doctor
==============================

npm-doctor is a command line tool that will search all of the github issues pages
of your locally installed npm modules, and give you the matching results of your query.

## Usage

For example, when this happens
```sh
npm install
npm start
RangeError: Maximum call stack size exceeded
# wait what... but this was working a second ago
```

do this,
```sh
npm-doctor "RangeError: Maximum call stack size exceeded"
found 1 result...

https://github.com/holman/a_bad_module/issues/109

the new version of a_bad_module is saying call stack size exceeded. Here's how I fixed it.
```

## Installation
```sh
npm install -g npm-doctor
```

## Bugs
When you find issues, please add an issue to the repo

## Contributions
Feel free to contribue. But please add tests and keep coverage at 100%. You can run tests by doing `npm test`, and view the coverage report at the bottom of the output.
