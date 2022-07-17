import { defineConfig } from 'vite'
import html from '..'

export default defineConfig({
  root: __dirname,
  plugins: [
    html([
      {
        template: 'public/foo.html',
        inject: '/src/foo.js',
      },
      {
        template: {
          // Alias
          'bar.html': 'public/bar.ejs.html',
        },
        inject: '/src/bar.js',
        data: {
          // `ejs` template data
          templateData: {
            name: 'Kevin',
            age: '25',
          },
        },
      },
    ]),
  ],
})
