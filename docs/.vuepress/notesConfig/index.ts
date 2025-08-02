import { defineNotesConfig } from 'vuepress-theme-plume'
import rust from './rust.ts'
import typescript from './typescript.ts'
import noteA from './noteA.ts'
import demoNote from './demoNote.ts'

export default defineNotesConfig({
    // 声明所有笔记的目录，(默认配置，通常您不需要声明它)
    dir: '/notes/',
    link: '/',
    // 在这里添加 note 配置
    notes: [
        typescript,
        rust,
        noteA,
        demoNote,
    ]
})

/**
 * @see https://theme-plume.vuejs.press/guide/document/ 查看文档了解配置详情。
 *
 * Notes 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 *
 * 请注意，你应该先在这里配置好 Notes，然后再启动 vuepress，主题会在启动 vuepress 时，
 * 读取这里配置的 Notes，然后在与 Note 相关的 Markdown 文件中，自动生成 permalink。
 *
 * 如果你发现 侧边栏没有显示，那么请检查你的配置是否正确，以及 Markdown 文件中的 permalink
 * 是否是以对应的 note 配置的 link 的前缀开头。 是否展示侧边栏是根据 页面链接 的前缀 与 `note.link`
 * 的前缀是否匹配来决定。
 */

/**
 * 在受支持的 IDE 中会智能提示配置项。
 *
 * - `defineNoteConfig` 是用于定义单个 note 配置的帮助函数
 * - `defineNotesConfig` 是用于定义 notes 集合的帮助函数
 *
 * 通过 `defineNoteConfig` 定义的 note 配置，应该填入 `defineNotesConfig` 的 notes 数组中
 */

/**
 * 导出所有的 note
 * 每一个 note 都应该填入到 `notes.notes` 数组中
 * （DemoNote 为参考示例，如果不需要它，请删除）
 */
