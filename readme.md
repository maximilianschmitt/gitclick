# gitclick

[![Travis Build](http://img.shields.io/travis/maximilianschmitt/gitclick.svg?style=flat)](https://travis-ci.org/maximilianschmitt/gitclick) [![Code Coverage](https://img.shields.io/coveralls/maximilianschmitt/gitclick.svg)](https://coveralls.io/r/maximilianschmitt/gitclick)

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

gitclick use <account>       Set <account> as default account
gitclick add                 Interactive prompt for creating a new account
gitclick remove <account>    Remove <account>
gitclick list                List your existing accountes
gitclick default             Displays default account
gitclick encrypt             Encrypt your configuration with a password
gitclick decrypt             Permanently decrypt your configuration

gitclick -v, --version       Output version number
gitclick -h, --help          Output usage information
```

## Examples

Assume that we are in a folder called `my-project`. We have added two accounts to gitclick: `personal` (default) and `work`.

**Create a repository called `my-project` on account `personal`:**

```
$ gitclick create
```

**Create a repository called `my-project` on account `work`:**

```
$ gitclick create on work
```

**Create a repository called `awesome-project` on account `personal`:**

```
$ gitclick create awesome-project
```

**Create a private repository with neither issues nor a wiki:**

```
$ gitclick create --no-issues --no-wiki --private
```

**Create a private repository called `secret-project` on account `work` and add it as remote origin afterwards:**

```
$ gitclick create secret-project on work --private --set-remote
```

**Create a repository called `my-project` and add it as remote secret afterwards:**

```
$ gitclick create secret-project on work --set-remote=secret
```

## Configuration

You can specify where gitclick should store its configuration through the environment variable `GITCLICK_STORAGE_PATH`. For example, if you would like to sync your gitclick configuration via Dropbox, you could add something like this to your `profile`:

```
export GITCLICK_STORAGE_PATH=~/Dropbox/.gitclick
```