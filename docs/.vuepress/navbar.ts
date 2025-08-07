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
      { text: '八股详解', link: '/home/a91to4hm/' }, 
      { text: '学习笔记', link: '/notes/note-a/' },
      { text: '我的面经', link: '/notes/note-a/' },
      { text: '手撕代码', link: '/home/ggege2um/' }, 
      { text: '算法解析', link: '/home/axpg0qc4/' },
      { text: '开源项目', link: '/notes/note-a/' },
      { text: '实习产出', link: '/notes/note-a/' },
    ],
  },
  { text: '博客', link: '/blog/' },
  { text: '标签', link: '/blog/tags/' },
  { text: '归档', link: '/blog/archives/' },
])
