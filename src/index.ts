import {
  Plugin,
  ResolvedConfig,
  normalizePath,
} from 'vite'
import { cleanUrl } from 'vite-plugin-utils'
import template from 'lodash.template'

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

export default function viteHtml(options: Options | Options[] = {}): Plugin[] {
  const opts = mappingTemplate(Array.isArray(options) ? options : [options])
  let config: ResolvedConfig

  const plugin: Plugin = {
    name: 'vite-html',
    configResolved(_config) {
      config = _config
    },
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, ctx) {
        const opt = opts.find(opt => opt._url === ctx.path) || {}

        // Inject js
        if (opt.inject) {
          // TODO: inject js to anywhere
          html = html.replace(
            '</body>',
            `  <script src="${opt.inject}" type="module"></script>\n  </body>`,
          )
        }

        // It's ejs template
        if (html.includes('<%')) {
          html = template(html)(opt.data)
        }

        return html

      }
    },
  }

  return [
    {
      ...plugin,
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          let url = req.url ? cleanUrl(req.url) : ''
          if (url === '/') {
            url = '/index.html'
          }
          const opt = opts.find(opt => opt.template && opt.template[url.slice(1)])
          if (opt) {
            const [, template] = Object.entries(opt.template)[0]
            // `template.replace()` for support absolute path
            req.url = normalizePath('/' + template.replace(config.root, ''))
            // Useful in `transformIndexHtml` hook
            opt._url = req.url
          }

          next()
        })
      },
    },
    {
      ...plugin,
      apply: 'build',
      // TODO: vite build
    }
  ]
}

function mappingTemplate(options: Options[]): Options[] {
  return options.map(opts => {
    const { template } = opts
    if (typeof template === 'string') {
      const lastIndex = template.lastIndexOf('/')
      const name = lastIndex > -1 ? template.slice(lastIndex + 1) : template
      // Mapping 'public/[name].html' to { '[name].html': 'public/[name].html' }
      opts.template = { [name]: template }
    }
    return opts
  })
}