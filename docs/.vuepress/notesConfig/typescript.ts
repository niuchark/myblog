import { defineNoteConfig } from 'vuepress-theme-plume'

export default defineNoteConfig({
    dir: 'typescript',
    link: '/typescript/',
    sidebar: [
        '/guide/intro.md',
        '/guide/getting-start.md',
        '/config/config-file.md',
    ]
})