# Give Up GitHub

This project has given up GitHub.  ([See Software Freedom Conservancy's *Give
Up  GitHub* site for details](https://GiveUpGitHub.org).)

You can now find this project at
[SourceHut](https://git.sr.ht/~sukima/tritarget.org) instead.

Any use of this project's code by GitHub Copilot, past or present, is done
without our permission.  We do not consent to GitHub's use of this project's
code in Copilot.

Join us; you can [give up GitHub](https://GiveUpGitHub.org) too!

![Logo of the GiveUpGitHub campaign](https://sfconservancy.org/img/GiveUpGitHub.png)

---

**A blog of personal quality**

Official source is available at: https://git.sr.ht/~sukima/tritarget.org

Contributions, feedback, and especially patches are enthusiastically welcomed.

## Directories

| Directory        | Description |
|------------------|-------------|
| `config`         | Build configuration files |
| `tiddlers`       | Place where all your TiddlyWiki tiddlers reside |
| `themes`         | Custom themes to be added to TiddlyWiki |
| `plugins`        | Custom plugins to be added to TiddlyWiki |
| `packages`       | Vite bundles of NPM packages I maintain in the CDN directory |
| `scripts`        | Custom static scripts to be included as static assets |
| `public`         | Static assets to be deployed with the built TiddlyWiki |
| `public/cdn`     | JavaScript modules maintained for ESM imports |
| `public/fiddles` | Single page code editor and previewer |

## Configurations

| Configuration            | Description |
|--------------------------|-------------|
| `config/tiddlywiki.info` | Base [TiddlyWiki info file](http://tiddlywiki.com/#TiddlyWikiFolders) |
| `config/includes.json`   | Extra plugins/themes to include based on production/development |
| `config/libraries.json`  | 3rd Party libraries to merge into plugins/scripts |

## Commands

| Command          | Description |
|------------------|-------------|
| `make`           | Build the main wiki as a single index.html and static files |
| `make server`    | Run the TiddlyWiki as a server at `http://localhost:8080/` |
| `make clean`     | Clean any build files |
| `make deploy`    | Deploy to a server via rsync |
| `make certs`     | Make self signed dev certs for development |
| `make devpublic` | Serves the public directory for development |
