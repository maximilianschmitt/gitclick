# gitclick

[![Travis Build](http://img.shields.io/travis/maximilianschmitt/gitclick.svg?style=flat)](https://travis-ci.org/maximilianschmitt/gitclick)

Create remote repositories on GitHub/Bitbucket from your terminal.

## Screencast

[Click here to watch a short 3-minute screencast on YouTube.](https://www.youtube.com/watch?v=Q1fFY4cGfmI)

## Installation

```
$ npm i gitclick -g
```

## Usage

```
gitclick create [<repository>] [on <account>] [options]

  <repository>    Defaults to the name of the current folder
  <account>       Defaults to the default account

  --set-remote    Add the created repo as remote ('origin' if not set to anything else)
  --no-issues     Create the repository without issues
  --no-wiki       Create the repository without a wiki
  --private       Create the repository privately

gitclick add                 Interactive prompt for creating a new account
gitclick list                List your existing accountes
gitclick use <account>       Set <account> as default account
gitclick remove <account>    Remove <account>
gitclick default             Displays default account

gitclick -v, --version       Output version number
gitclick -h, --help          Output usage information
```

## Configuration

You can specify where gitclick should store its configuration through the environment variable `GITCLICK_STORAGE_PATH`. For example, if you would like to sync your gitclick configuration via Dropbox, you could add something like this to your `profile`:

```
export GITCLICK_STORAGE_PATH=~/Dropbox/.gitclick
```

## Todo

* Write more tests
* Maybe: add optional encryption (should be easy with something like bcrypt)