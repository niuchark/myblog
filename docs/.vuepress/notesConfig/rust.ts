import { defineNoteConfig } from 'vuepress-theme-plume'

export default defineNoteConfig({
    dir: 'rust',
    link: '/rust/',
    sidebar: [
        '/guide/intro.md',
        '/guide/getting-start.md',
        '/config/config-file.md',
    ]
})