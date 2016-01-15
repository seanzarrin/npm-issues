npm-doctor
==============================
[![Build Status](https://travis-ci.org/seanzarrin/npm-doctor.svg?branch=master)](https://travis-ci.org/seanzarrin/npm-doctor)

npm-doctor is a command that searches known issues of all your installed npm modules at once, and gives you the matching results of your query.

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
npm-doctor "RangeError: Maximum call stack size exceeded"
found 1 result...

https://github.com/holman/a_bad_module/issues/109

the new version of a_bad_module is saying call stack size exceeded. Here's how I fixed it.
```

In the above example, a_bad_module was a dependency of my project, and my project was working fine. But when I ran `npm install` a newer version was pulled in that _shouldn't_ have broken anything, but did with a cryptic error message.

## Installation
```sh
npm install -g npm-doctor
```

## Usage
```sh
npm-doctor [options] [query]
```

where the following options are available:  
`--depth [int]`    The maximum depth of your local node modules that should be included in the search  
`--limit [int]`    The maximum number of results you would like logged to console

## Bugs
When you find issues with npm-doctor, please file them here https://github.com/seanzarrin/npm-doctor/issues

## Contributions
Feel free to contribue. But please add tests and keep coverage at 100%. You can run tests by doing `npm test`, and view the coverage report at the bottom of the output.

## License
MIT
