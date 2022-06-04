# vite-html

html template for vite

[![NPM version](https://img.shields.io/npm/v/vite-html.svg?style=flat)](https://npmjs.org/package/vite-html)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-html.svg?style=flat)](https://npmjs.org/package/vite-html)

English | [简体中文](https://github.com/vite-plugin/vite-html/blob/main/README.zh-CN.md)

## Features

- Support [ejs](https://github.com/mde/ejs) template
- Html entry alias
- Inject js

## Usage

```js
import html from 'vite-html'
export default {
  plugins: [
    html(/* options */),
  ]
}
```

## API

```ts
export interface Options {
  /** Value of script src */
  inject?: string
  /**
   * Path of [name].html
   * 
   * e.g.
   * - 'public/index.html'
   * - { 'index.html': 'public/index.ejs' }
   */
  template?: string | { [entryAlias: string]: string }
  data?: Record<string, any>
  /** Finally value of `req.url` */
  _url?: string
}
```