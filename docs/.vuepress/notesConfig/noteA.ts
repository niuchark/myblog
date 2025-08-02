import { defineNoteConfig } from 'vuepress-theme-plume'

export default defineNoteConfig({
    dir: 'noteA',
    link: '/note-a/',
    sidebar: [
        { text: 'one item', link: 'one' },
        { text: 'two item', link: 'two' },
    ]
})