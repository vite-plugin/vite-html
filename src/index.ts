import {
  Plugin,
  ResolvedConfig,
  normalizePath,
} from 'vite'
import { cleanUrl } from 'vite-plugin-utils'

export interface Options {
  /** Value of script src */
  entry?: string
  /**
   * Path of [name].html
   * 
   * e.g.
   * - 'public/index.html'
   * - { 'index.html': 'public/index.ejs' }
   */
  template?: string | { [entryAlias: string]: string }
}

export default function viteHtml(options: Options | Options[] = {}): Plugin[] {
  const opts = Array.isArray(options) ? options : [options]
  let config: ResolvedConfig

  return [
    {
      name: 'vite-html',
      apply: 'serve',
      configResolved(_config) {
        config = _config
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          let url = req.url ? cleanUrl(req.url) : ''
          if (url === '/') {
            url = '/index.html'
          }
          const opt = opts.find(
            opt => opt.template && mappingTemplate(opt.template)[url.slice(1)],
          )
          if (opt) {
            const [, template] = Object.entries(opt.template)[0]
            // `template.replace()` for support absolute path
            req.url = normalizePath('/' + template.replace(config.root, ''))
          }

          next()
        })
      },
    },
    {
      name: 'vite-html',
      apply: 'build',
      // TODO: vite build
    }
  ]
}

// Mapping 'public/[name].html' to { '[name].html': 'public/[name].html' }
function mappingTemplate(template: Options['template']): Record<string, string> {
  if (typeof template !== 'string') {
    return template
  }
  const lastIndex = template.lastIndexOf('/')
  const name = lastIndex > -1 ? template.slice(lastIndex + 1) : template
  return { [name]: template }
}