---
title: 退出登陆后报空值错误
createTime: 2025/08/29 14:55:34
permalink: /home/xxxqit57/
---


原因是“触发结构改变 + 注销时机”叠加导致的短暂空引用。

把“安全退出”的触发改为“整卡可点”后，触发结构从“内部元素触发”变成“包含式/整块触发”（原本`a-popconfirm` 只包裹“安全退出”的文字，后来我改成了`a-popconfirm`包裹 `card-item`整个卡片）。
AntD 的 Popconfirm 在确认时会先触发一次可见性变更（触发器区域会重渲），而我们在确认回调里立即把 `info` 清空（`setUserInfo(null)`）。这两件事在同一帧里交织，导致“触发器区域或信息卡片在重渲过程中读到了已被置空的 `info.name`”，从而出现瞬时的 cannot read properties of null (reading 'name')。

为何之前没问题的可能原因：
- 之前只重绘了不包含`info.name`的文字span区域
- 之前的触发点只在文字元素上，触发链更短，Popconfirm 收起的重渲范围更小，恰好没有踩中 info 被清空的这帧渲染窗口。

修复：
- 1.
  - 模板里为 `info` 相关插值加了空值保护（名字、邮箱）。
  - 为信息卡主体加 `v-if="info"`，避免 info 置空时再渲染其内部。
- 2.
  - 在 `logout()` 中先关闭信息卡，再等一帧再清空用户：
    - 先 `this.infoCardVisible = false`
    - `await this.$nextTick()` 等待信息卡与 Popconfirm 收起渲染完成
    - 再执行 `await userApi.logout()`、`this.$router.replace({ name: 'login' })`
    - 最后 `this['user/setUserInfo'](null)`（或放在路由完成后的回调里）
