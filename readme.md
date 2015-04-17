# gitclick

```
Usage:
  
  gitclick create [<repository>] [on <account>] [--no-issues] [--no-wiki] [--private]

    Creates a public repository with issues and wiki by default
    <repository> defaults to the name of the current folder
    <account> defaults to the default account

  gitclick list                List your existing accountes
  gitclick use <account>       Set <account> as default account
  gitclick add                 Interactive prompt for creating a new account
  gitclick remove <account>    Remove <account>

  gitclick -v, --version       Output version number
  gitclick -h, --help          Output usage information
```

## Todo

* Write more tests
* Setup .gitclick config-file in home directory
* Allow setting of home directory through environment variables

### Maybe

* Add optional encryption (should be easy with something like bcrypt)