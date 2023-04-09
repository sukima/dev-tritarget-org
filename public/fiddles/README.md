# TriTarget.org Fiddles

This is a single page application for client side in browser code editor.

This is similar to many like CodePen, JSFiddle, JSBin, etc. but runs 100% in
the browser without any backend.

It consists of `index.html` and the files under `lib/`.

## Dependencies

* Modern broswer with HTML5, ES6, CSS3, and JavaScript Module support
* [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html)
* [XState](https://xstate.js.org) ― https://tritarget.org/cdn/xstate.js
* [CodeMirror](https://codemirror.net/) ― https://tritarget.org/cdn/codemirror.js
* [Simple DOM](https://tritarget.org/cdn/simple-dom.js) ― https://tritarget.org/cdn/simple-dom.js

## Usage

Load the `index.html` in your broser via a web server (you may need to use
HTTPS).

### Query Params

* `?fiddle=` ― will load any HTML file served by the server relative to the
  current path

### Share links

You can also save to URL by means of ls-ztring which will become the URL
fragment.

### Save to hard drive

You can save files to the hard drive and then load them later.

## License (MIT)

    Copyright (c) 2013 Devin Weaver <suki@tritarget.org>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
