npm-issues
==============================
[![Build Status](https://travis-ci.org/seanzarrin/npm-issues.svg?branch=master)](https://travis-ci.org/seanzarrin/npm-issues)

npm-issues is a command that lets you search known issues of all your installed npm modules at once

## Example

![Alt text](/../images/npm-issues.gif?raw=true "When npm install breaks something")

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
`--module [module]`       Restricts searching to a submodule in the current module  
`--norecursive`           Will not recursively search submodules for dependencies  
`--state [open|closed]`   (defaults to `open`) Only include issues that are either `open` or `closed`.  
`--global`                Search issues for modules that have been globally installed  

## More Examples
`npm-issues "Null pointer"`  
Will search for open issues of any of the dependencies installed in the current folder (and the nested dependencies), matching the text `"Null pointer"`  

`npm-issues --module eslint "Null pointer"`  
Will search for open issues of eslint (assuming it is installed in this folder) and eslint's dependencies, matching the text `"Null pointer"`

`npm-issues --global --module npm "Null pointer"`  
Will search for open issues with npm matching the text `"Null pointer"`, along with any issues of npm's dependencies and nested dependencies  

`npm-issues --global --module npm --norecursive "Null pointer"`  
Will search only for open issues with npm matching the text `"Null pointer"`. It will not search for issues of npm's dependencies  

`npm-issues --state closed "RangeError"`  
Will search for closed issues of the dependencies installed in the current folder (and the nested dependencies), matching the text `"RangeError"`.

## FAQ
_Why do I keep seeing this message: "GitHub rate limits requests, so you may have to wait a minute to try again"?_  
`npm-issues` uses GitHub's api to search for issues, which is rate limited based on your IP. The limit refreshes every minute, so try again after a minute passes. If you keep seeing this, you probably have a lot of modules installed, which means more requests per search. To reduce this amount, and see this error less, try using the `--norecursive` or `--depth` options.

## Bugs
When you find issues with npm-issues, please file them here https://github.com/seanzarrin/npm-issues/issues

## Contributions
Feel free to contribue. But please add tests and keep coverage at 100%. You can run tests by doing `npm test`, and view the coverage report at the bottom of the output.

## License
MIT
