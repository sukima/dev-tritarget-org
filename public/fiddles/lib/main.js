import $ from 'https://tritarget.org/cdn/simple-dom.js';
import { createMachine, interpret } from 'https://unpkg.com/xstate@4/dist/xstate.web.js';

const BASE_TITLE = $.element.title;
let suggestedFileName = 'new-fiddle.html';

const applicationMachine = createMachine({ // {{{1
  id: 'applicationMachine',
  type: 'parallel',
  on: {
    BROWSE_FILES: { actions: 'openFileBrowser' },
    SAVE: { actions: 'saveEditorContents' },
    SHARE: { actions: 'shareEditorContents' },
    SAVED: 'menu.closed',
    LOAD: { actions: 'loadEditorContents' },
    LOADED: 'menu.closed',
    MANUAL_UPDATE: { actions: 'updatePreview' },
  },
  states: {
    editorPreviewColumns: {
      initial: 'initialize',
      states: {
        initialize: {
          entry: 'updatePreview',
          always: 'twoColumns',
        },
        twoColumns: {
          entry: [
            'showEditorHalfWidth',
            'showPreviewHalfWidth',
            'activateEditorConfig',
            'activatePreviewConfig',
          ],
          on: {
            TOGGLE_EDITOR: 'oneColumnPreview',
            TOGGLE_PREVIEW: 'oneColumnEditor',
          },
        },
        oneColumnPreview: {
          entry: [
            'hideEditor',
            'showPreviewFullWidth',
            'deactivateEditorConfig',
            'activatePreviewConfig',
          ],
          on: {
            TOGGLE_EDITOR: 'twoColumns',
            TOGGLE_PREVIEW: 'oneColumnEditor',
          },
        },
        oneColumnEditor: {
          entry: [
            'showEditorFullWidth',
            'hidePreview',
            'activateEditorConfig',
            'deactivatePreviewConfig',
          ],
          on: {
            TOGGLE_EDITOR: 'oneColumnPreview',
            TOGGLE_PREVIEW: 'twoColumns',
          },
        },
      },
    },
    wordWrap: {
      initial: 'deactivated',
      states: {
        deactivated: {
          entry: ['deactivateWordWrapConfig', 'disableEditorWordWrap'],
          on: { TOGGLE_WORDWRAP: 'activated' },
        },
        activated: {
          entry: ['activateWordWrapConfig', 'enableEditorWordWrap'],
          on: { TOGGLE_WORDWRAP: 'deactivated' },
        },
      },
    },
    manualPreviewUpdate: {
      initial: 'deactivated',
      states: {
        deactivated: {
          entry: ['deactivateManualPreviewConfig', 'disableEditorManualPreview'],
          on: { TOGGLE_MANUAL_PREVIEW: 'activated' },
        },
        activated: {
          entry: ['activateManualPreviewConfig', 'enableEditorManualPreview'],
          on: { TOGGLE_MANUAL_PREVIEW: 'deactivated' },
        },
      },
    },
    menu: {
      initial: 'closed',
      states: {
        closed: {
          entry: 'closeMenu',
          on: { OPEN_MENU: 'open' },
        },
        open: {
          entry: 'openMenu',
          on: { CLOSE_MENU: 'closed' },
        },
      },
    },
  },
});

class Application { // {{{1
  savedFilename = null;
  machine = interpret(applicationMachine.withConfig({
    actions: {
      openMenu: () => this.menu.open(),
      closeMenu: () => this.menu.close(),
      updatePreview: () => this.editor.update(),
      openFileBrowser: () => this.fileBrowser.open(),
      showEditorHalfWidth: () => this.columns.editor.halfWidth(),
      showEditorFullWidth: () => this.columns.editor.fullWidth(),
      hideEditor: () => this.columns.editor.hide(),
      showPreviewHalfWidth: () => this.columns.preview.halfWidth(),
      showPreviewFullWidth: () => this.columns.preview.fullWidth(),
      hidePreview: () => this.columns.preview.hide(),
      enableEditorWordWrap: () => this.editor.enableWordWrap(),
      disableEditorWordWrap: () => this.editor.disableWordWrap(),
      enableEditorManualPreview: () => this.editor.disableOnChangeEvents(),
      disableEditorManualPreview: () => this.editor.enableOnChangeEvents(),
      activateEditorConfig: () => this.buttons.editor.activate(),
      deactivateEditorConfig: () => this.buttons.editor.deactivate(),
      activatePreviewConfig: () => this.buttons.preview.activate(),
      deactivatePreviewConfig: () => this.buttons.preview.deactivate(),
      activateWordWrapConfig: () => this.buttons.wordWrap.activate(),
      deactivateWordWrapConfig: () => this.buttons.wordWrap.deactivate(),
      activateManualPreviewConfig: () => this.buttons.manualPreview.activate(),
      deactivateManualPreviewConfig: () => this.buttons.manualPreview.deactivate(),
      saveEditorContents: async () => {
        this.savedFilename = prompt(
          'Save As: Enter a file name',
          this.savedFilename || suggestedFileName,
        );
        let saver = FileSaver.create(this.savedFilename);
        saver.onDone(() => this.trigger('SAVED'));
        await this.editor.save(saver);
      },
      shareEditorContents: async () => {
        let saver = new FragmentSaver();
        saver.onDone(() => this.trigger('SAVED'));
        await this.editor.save(saver);
      },
      loadEditorContents: async (_, { loader }) => {
        await this.editor.load(loader);
        this.trigger('LOADED');
      },
    },
  }));

  constructor({ fileBrowser, menu, editor, columns, buttons }) {
    Object.assign(this, { fileBrowser, menu, editor, columns, buttons });
    this.machine.start();
  }

  trigger(...args) {
    this.machine.send(...args);
  }
}

class FileBrowser { // {{{1
  constructor(element) {
    this.element = element;
  }

  open() {
    this.element.click();
  }
}

class Menu { // {{{1
  constructor(element, triggerClose = noop) {
    this.element = element;
    this.triggerClose = triggerClose;
  }

  open() {
    this.element.dataset.state = 'open';
    requestAnimationFrame(() => this.attachDocumentEvents());
  }

  close() {
    this.element.dataset.state = 'closed';
    this.removeDocumentEvents();
  }

  attachDocumentEvents() {
    this.tearDownEvents = [
      $.on.click(event => {
        if (this.element.contains(event.target)) return;
        event.stopPropagation();
        this.triggerClose();
      }, true),
      $.on.keyup(event => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        this.triggerClose();
      }, true),
    ];
  }

  removeDocumentEvents() {
    this.tearDownEvents?.forEach(i => i());
  }
}

class Column { // {{{1
  constructor(element) {
    this.element = element;
  }

  halfWidth() {
    this.element.classList.remove('hide', 'full-width');
  }

  fullWidth() {
    this.element.classList.remove('hide');
    this.element.classList.add('full-width');
  }

  hide() {
    this.element.classList.remove('full-width');
    this.element.classList.add('hide');
  }
}

class Button { // {{{1
  constructor(element, label) {
    this.labelEl = element.querySelector('.label');
    this.labelText = label;
  }

  activate() {
    this.labelEl.innerHTML = `${this.labelText} &#x2713`;
  }

  deactivate() {
    this.labelEl.innerHTML = `${this.labelText}`;
  }
}

class Editor { // {{{1
  constructor(cmInstance, updateCallback) {
    this.codemirror = cmInstance;
    this.updateCallback = updateCallback;
    this.initialValue = this.currentValue;
    this.enableOnChangeEvents();
    this.attachEvents();
  }

  get currentValue() {
    return this.codemirror.getValue();
  }

  set currentValue(value) {
    this.codemirror.setValue(value);
  }

  get hasChanged() {
    return this.initialValue !== this.currentValue;
  }

  attachEvents() {
    let boundOnChange = () => this.handleChangeEvent();
    this.dettachEvents();
    this.dettachEvents = () => this.codemirror.off('change', boundOnChange);
    this.codemirror.on('change', boundOnChange);
  }

  dettachEvents() {}

  handleChangeEvent() {
    DataBrowserHook.from(this.hasChanged).prepare();
    this.onChange();
  }

  enableWordWrap() {
    this.codemirror.setOption('lineWrapping', true);
  }

  disableWordWrap() {
    this.codemirror.setOption('lineWrapping', false);
  }

  enableOnChangeEvents() {
    this.onChange = debounce(() => this.update(), 700);
  }

  disableOnChangeEvents() {
    this.onChange = () => {};
  }

  async save(saver) {
    let { currentValue } = this;
    let blob = new Blob([currentValue], { type: 'text/html' });
    await saver.save(blob);
    this.initialValue = this.currentValue;
    this.handleChangeEvent();
  }

  async load(loader) {
    this.initialValue = await loader.load();
    this.currentValue = this.initialValue;
  }

  update() {
    this.updateCallback(this.currentValue);
  }
}

class DataBrowserHook { // {{{1
  static from(isDirty) {
    return isDirty ? new DirtyDataBrowserHook() : new CleanDataBrowserHook();
  }
}

class DirtyDataBrowserHook { // {{{2
  prepare() {
    window.onbeforeunload = (event = {}) => {
      event.preventDefault?.();
      event.returnValue = '';
      return 'Are you sure want to exit?';
    };
  }
}

class CleanDataBrowserHook { // {{{2
  prepare() {
    window.onbeforeunload = null;
  }
}

class FileSaver { // {{{1
  _onDoneCallback = () => {};

  constructor(filename) {
    this.filename = filename;
  }

  onDone(cb) {
    this._onDoneCallback = cb;
    return this;
  }

  static create(filename) {
    if (!filename) {
      return new CancelledSaver();
    }
    if (window.navigator.msSaveOrOpenBlob) {
      return new MsBlobSaver(filename);
    }
    return new LinkHrefSaver(filename);
  }
}

class CancelledSaver { // {{{2
  save() {}
}

class FragmentSaver extends FileSaver { // {{{2
  async save(blob) {
    let { LZString } = await import('./lz-string.js');
    let url = new URL(window.location);
    url.search = '';
    url.hash = LZString.compressToEncodedURIComponent(await blob.text());
    if (Navigator.clipboard) {
      Navigator.clipboard.writeText(url.toString());
    }
    if (history.replaceState) {
      history.replaceState({}, '', url);
    } else {
      window.location.href = url;
    }
    this._onDoneCallback();
    flash('URL updated and link saved to clipboard');
  }
}

class MsBlobSaver extends FileSaver { // {{{2
  save(blob) {
    window.navigator.msSaveBlob(blob, this.filename);
    this._onDoneCallback();
    flash('Saved to file');
  }
}

class LinkHrefSaver extends FileSaver { /// {{{2
  save(blob) {
    let elem = $.createElement('a');
    elem.href = URL.createObjectURL(blob);
    elem.download = this.filename;
    $.body.appendChild(elem);
    elem.click();
    $.body.removeChild(elem);
    URL.revokeObjectURL(blob);
    this._onDoneCallback();
    flash('Saved to file');
  }
}

class FileLoader { // {{{1
  constructor(file) {
    this.file = file;
  }

  load() {
    return new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(this.file);
    }).finally(() => {
      flash('Loaded from file');
    });
  }
}

class FragmentLoader { // {{{1
  constructor(hash) {
    this.hash = hash.slice(1);
  }

  async load() {
    let { LZString } = await import('./lz-string.js');
    try {
      return LZString.decompressFromEncodedURIComponent(this.hash);
    } finally {
      flash('Loaded contents from URL');
    }
  }
}

class UrlLoader { // {{{1
  constructor(url) {
    this.url = url;
  }

  async load() {
    let res = await fetch(this.url);
    let content = res.ok ? await res.text() : this.errorContent(res);
    try {
      return content.trim();
    } finally {
      flash(`Loaded contents from ${this.url}`);
    }
  }

  errorContent({ status, statusText }) {
    return `
<h1>Error loading content</h1>
<p>There was a problem loading <code>${this.url}</code>.</p>
<dl>
  <dt>Reason</dt> <dd>${statusText}</dd>
  <dt>Code</dt> <dd>${status}</dd>
</dl>
<style>
  dl { display: grid; grid: auto-flow / auto 1fr; }
  dt { font-weight: bold; }
</style>
    `;
  }
}

function updatePreview(content) { // {{{1
  const fiddleParam = () => new URL(window.location).searchParams.get('fiddle');
  let previewFrame = $.createElement('iframe');
  let oldPreview = $['#preview'].element;
  let container = oldPreview.parentNode;

  oldPreview.remove();
  previewFrame.id = 'preview';
  container.appendChild(previewFrame);

  let preview = previewFrame.contentWindow.document;
  preview.open();
  preview.write(content);
  preview.close();

  let subtitle = preview.title || fiddleParam() || 'New Fiddle';
  suggestedFileName = `${dasherize(subtitle)}.html`;
  $.element.title = `${BASE_TITLE} — ${subtitle}`;
}

function debounce(fn, delay = 10) { // {{{1
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function dasherize(input) { // {{{1
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const cm = CodeMirror.fromTextArea($['#editor'].element, { // {{{1
  lineNumbers: true,
  styleActiveLine: true,
  mode: 'text/html',
  theme: 'monokai',
});

const app = new Application({ // {{{1
  fileBrowser: new FileBrowser($['#file-open-input'].element),
  menu: new Menu($['#menu'].element, () => app.trigger('CLOSE_MENU')),
  editor: new Editor(cm, updatePreview),
  columns: {
    editor: new Column($['.editor'].element),
    preview: new Column($['.preview'].element),
  },
  buttons: {
    editor: new Button($['#menu-show-editor'].element, 'Editor Window'),
    preview: new Button($['#menu-show-preview'].element, 'Preview Window'),
    wordWrap: new Button($['#menu-word-wrap'].element, 'Word Wrap'),
    manualPreview: new Button($['#menu-manual-preview'].element, 'Manual Preview'),
  },
});

// }}}1

// DOM Events {{{1
$['#file-open-input'].on.change(
  ({ target }) => app.trigger(
    'LOAD',
    { loader: new FileLoader(target.files[0]) }
  )
);

// Mouse Events {{{1
$['#menu-open'].on.click(() => app.trigger('OPEN_MENU'));
$['#menu-close'].on.click(() => app.trigger('CLOSE_MENU'));
$['#menu-open-file'].on.click(() => app.trigger('BROWSE_FILES'));
$['#menu-save-file'].on.click(() => app.trigger('SAVE'));
$['#menu-share'].on.click(() => app.trigger('SHARE'));
$['#menu-show-editor'].on.click(() => app.trigger('TOGGLE_EDITOR'));
$['#menu-show-preview'].on.click(() => app.trigger('TOGGLE_PREVIEW'));
$['#menu-word-wrap'].on.click(() => app.trigger('TOGGLE_WORDWRAP'));
$['#menu-manual-preview'].on.click(() => app.trigger('TOGGLE_MANUAL_PREVIEW'));

// Keyboard Events {{{1
$.on.keyup(event => {
  if (!(event.ctrlKey && event.shiftKey)) { return; }
  const trigger = (...args) => {
    event.preventDefault();
    app.trigger(...args);
  };
  switch (event.key) {
    case 'O': return trigger('BROWSE_FILES');
    case 'S': return trigger('SAVE');
    case 'L': return trigger('SHARE');
    case 'B': return trigger('TOGGLE_WORDWRAP');
    case 'E': return trigger('TOGGLE_EDITOR');
    case 'W': return trigger('TOGGLE_PREVIEW');
    case 'M': return trigger('TOGGLE_MANUAL_PREVIEW');
    case 'U': return trigger('MANUAL_UPDATE');
    default: //
  }
});

// }}}1
// Flash messages {{{1
const flash = (function () {
  let flashTimeout;

  $.flash['button'].on.click(() => $.flash.close());
  $.flash.on.keyup(({ key }) => {
    if (key === 'Escape') $.flash.close();
  });

  return function flash(message) {
    clearTimeout(flashTimeout);
    $.flash['.content'].textContent = message;
    $.flash.show();
    setTimeout(() => $.flash.close(), 8_000);
  }
})();

function preloadRelativeContent() {
  let currentUrl = new URL(window.location);
  let { searchParams } = currentUrl;

  if (searchParams.has('fiddle')) {
    let fiddleUrl = new URL(searchParams.get('fiddle'), currentUrl.href);
    app.trigger('LOAD', { loader: new UrlLoader(fiddleUrl) });
  } else if (window.location.hash) {
    app.trigger('LOAD', { loader: new FragmentLoader(window.location.hash) });
  }
}

preloadRelativeContent();

// vim: et sw=2 fdm=marker
