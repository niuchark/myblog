/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  {
    text: '笔记',
    items: [
      { text: '前端八股', link: '/notes/home/' }, 
      { text: '学习笔记', link: '/notes/note-a/' },
      { text: '面经合集', link: '/notes/note-a/' },
      { text: '手撕代码', link: '/notes/shousi/' }, 
      { text: '高频算法', link: '/notes/suanfa/' },
      { text: '开源项目', link: '/notes/note-a/' },
      { text: '实习产出', link: '/notes/note-a/' },
      { text: '其他', link: '/notes/note-a/' },
    ],
  },
  { text: '博客', link: '/blog/' },
  { text: '标签', link: '/blog/tags/' },
  { text: '归档', link: '/blog/archives/' },
])
