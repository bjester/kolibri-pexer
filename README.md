# kolibri-pexer
A tool for quickly running many Kolibri .pex files

## Usage
```bash
$ pexer --help
pexer <command>

Commands:
  pexer init <pex>    initialize a home directory for a Kolibri pex
  pexer manage <pex>  manage a Kolibri pex
  pexer rm <pex>      removes a home directory for a Kolibri pex
  pexer run <pex>     run a Kolibri pex

Options:
  --version     Show version number                                    [boolean]
  --verbose     enable verbose output                 [boolean] [default: false]
  --python, -p  python binary to use                                    [string]
  --help        Show help                                              [boolean]
```

## Customization
Add an `.pexerrc` file to your home directory. The config is JSON and is as follows:
```json
{
  "homeDirectory": "/path/to/directory/where/all/homes/will/be/created",
  "homeTemplate": "/path/to/existing/home/used/as/template",
  "contentDirectory": "/path/to/content/directory",
  "python": "python",
  "runMode": "blaine"
}
```
Defaults are:
```json
{
  "homeDirectory": "~/.kolibri-pexer",
  "homeTemplate": "~/.kolibri",
  "contentDirectory": "~/.kolibri/content",
  "python": "python",
  "runMode": "test"
}
