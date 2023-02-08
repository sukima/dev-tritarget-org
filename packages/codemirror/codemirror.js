// Core
import * as codemirror from 'codemirror';
import * as view from '@codemirror/view';
import * as state from '@codemirror/state';
import * as commands from '@codemirror/commands';
import * as language from "@codemirror/language"
import * as search from "@codemirror/search"
import * as autocomplete from "@codemirror/autocomplete"
import * as lint from "@codemirror/lint"

// Extensions
import * as solarized from '@uiw/codemirror-theme-solarized';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { vim } from "@replit/codemirror-vim"
import { color } from '@uiw/codemirror-extensions-color';

const emmet = (key = 'Cmd-e') => view.keymap.of({ key, run: expandAbbreviation });
const languages = { html, css, javascript };
const extensions = { emmet, vim, color };
const themes = { solarized };

export {
  codemirror,
  view,
  state,
  commands,
  language,
  search,
  autocomplete,
  lint,
  languages,
  extensions,
  themes,
};
