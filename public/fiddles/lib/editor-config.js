import * as CodeMirror from '/cdn/codemirror.js';

const {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
} = CodeMirror.view;
const { EditorState } = CodeMirror.state;
const {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} = CodeMirror.language;
const { defaultKeymap, history, historyKeymap } = CodeMirror.commands;
const { searchKeymap, highlightSelectionMatches } = CodeMirror.search;
const { autocompletion, completionKeymap } = CodeMirror.autocomplete;
const { lintKeymap } = CodeMirror.lint;

export const editorConfig = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
  bracketMatching(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];
