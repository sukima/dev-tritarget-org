## Directories

| Directory  | Description |
|------------|-------------|
| `config`   | Build configuration files. |
| `tiddlers` | Place where all your TiddlyWiki tiddlers reside. |
| `themes`   | Custom themes to be added to TiddlyWiki. |
| `plugins`  | Custom plugins to be added to TiddlyWiki. |
| `scripts`  | Custom static scripts to be included as static assets. |
| `public`   | Static assets to be deployed with the built TiddlyWiki. |

## Configurations


| Configuration            | Description |
|--------------------------|-------------|
| `config/tiddlywiki.info` | Base [TiddlyWiki info file](http://tiddlywiki.com/#TiddlyWikiFolders). |
| `config/includes.json`   | Extra plugins/themes to include based on production/development. |
| `config/libraries.json`  | 3rd Party libraries to merge into plugins/scripts. |

## Commands

| Command          | Description |
|------------------|-------------|
| `npm start`      | Run the TiddlyWiki as a server at `http://localhost:8080/`. |
| `npm run build`  | Build the main wiki as a single index.html and static files. |
| `npm run clean`  | Clean any build files. |
| `npm run deploy` | Deploy to a server via rsync. |
