import $ from 'https://tritarget.org/cdn/simple-dom.js';
import { createMachine, interpret } from 'https://unpkg.com/xstate@4/dist/xstate.web.js';

const BASE_TITLE = $.element.title;

const applicationMachine = createMachine({ // {{{1
  id: 'applicationMachine',
  type: 'parallel',
  on: {
    BROWSE_FILES: { actions: 'openFileBrowser' },
    SAVE: { actions: 'saveEditorContents' },
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
        let filename = prompt('Save As: Enter a file name', 'index.html');
        let saver = FileSaver.create(filename);
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
  constructor(element) {
    this.element = element;
  }

  open() {
    this.element.dataset.state = 'open';
  }

  close() {
    this.element.dataset.state = 'closed';
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
    this.element = element;
    this.label = label;
  }

  activate() {
    this.element.innerHTML = `${this.label} &#x2713`;
  }

  deactivate() {
    this.element.innerHTML = `${this.label}`;
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
    saver.save(blob);
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

class MsBlobSaver extends FileSaver { // {{{2
  save(blob) {
    window.navigator.msSaveBlob(blob, this.filename);
    this._onDoneCallback();
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
    });
  }
}

class UrlLoader { // {{{1
  constructor(url) {
    this.url = url;
  }

  async load() {
    let res = await fetch(this.url);
    let content = res.ok ? await res.text() : this.errorContent(res);
    return content.trim();
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
  $.element.title = `${BASE_TITLE} — ${subtitle}`;
}

function debounce(fn, delay = 10) { // {{{1
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const cm = CodeMirror.fromTextArea($['#editor'].element, { // {{{1
  lineNumbers: true,
  styleActiveLine: true,
  mode: 'text/html',
  theme: 'monokai',
});

const app = new Application({ // {{{1
  fileBrowser: new FileBrowser($['#file-open-input'].element),
  menu: new Menu($['#menu'].element),
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
    case 'B': return trigger('TOGGLE_WORDWRAP');
    case 'E': return trigger('TOGGLE_EDITOR');
    case 'W': return trigger('TOGGLE_PREVIEW');
    case 'M': return trigger('TOGGLE_MANUAL_PREVIEW');
    case 'U': return trigger('MANUAL_UPDATE');
    default: //
  }
});

// }}}1

function preloadRelativeContent() {
  let currentUrl = new URL(window.location);
  let { searchParams } = currentUrl;
  let event = searchParams.has('fiddle') ? 'LOAD' : 'NOOP';
  let fiddleUrl = new URL(searchParams.get('fiddle'), currentUrl.href);
  app.trigger(event, { loader: new UrlLoader(fiddleUrl) });
}

preloadRelativeContent();

// vim: et sw=2 fdm=marker
