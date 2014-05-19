## Installation

```
npm install gitclick -g
```

## Usage

### Initial Setup: Configuring gitclick

```
gitclick config
```

### Creating boxes

```
gitclick box add
```

Starts interactive prompt to configure a new box:

* box name (could be "github-personal" or "bitbucket-work")
* provider module (e.g. "github" or "bitbucket")
* provider username
* provider password
* default issues (y/n)
* default wiki (y/n)
* default private (y/n)

### Listing boxes

```
gitclick box list
```

### Removing boxes

```
gitclick box remove <box-name>
```

### Creating remote repositories

```
gitclick remote <box-name>
```

Creates remote repo for specified box with current folder name as repo name.

```
gitclick remote <box-name>:<repo-name>
```

Creates remote repo for specified box with specified name as repo name.

#### Options

* `--issues <true/false>` (boolean)
* `--wiki <true/false>` (boolean)
* `-r --private` as private repo
* `-o --public` as public repo
* `-w` with wiki
* `-i` with issues

## Planned features

* Optional data encryption using master password + crypto
* OAuth authentication
* Make provider authentication (fields) provider responsibility