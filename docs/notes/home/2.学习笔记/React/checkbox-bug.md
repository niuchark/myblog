---
title: React受控组件
createTime: 2025/08/29 15:16:00
permalink: /home/88lqhi1r/
---
在完成todeList练手项目时，在完成/未完成任务复选框上碰到如下问题：

报错版本：
```jsx
import type { Task } from "../type"
import { useRef, useContext, useState } from "react"
import { TaskDispatchContext } from "../TasksContext"
export default function TaskItem({ task }: { task: Task }) {
    const [isEditing, setIsEditing] = useState(false)
    const checkRef = useRef<HTMLInputElement>(null)
    const [newContent, setNewContent] = useState(task.content)
    const taskDispatch = useContext(TaskDispatchContext)
    const handleDlete = () => {
        taskDispatch({
            type: 'remove',
            id: task.id,
        })
    }
    const handleSave = () => {
        taskDispatch({
            type: 'change',
            id: task.id,
            content: newContent,
            isDone: checkRef.current?.checked || false
        })
        setIsEditing(false)
    }
    return (
        <div>
            <span>{task.id}. </span>
            {isEditing ? (
                <input value={newContent} onChange={e => setNewContent(e.target.value)} />
            ) : (
                task.content
            )}
            {task.isDone ? <span>完成</span> : <span>未完成</span>}
            {isEditing ? (
                <>
                    <input type="checkbox" checked={task.isDone} ref={checkRef} />
                    <button onClick={handleSave}>保存</button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)}>编辑</button>
            )}
            <button onClick={handleDlete}>删除</button>
        </div>
    )
}
```

报错：You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.

原因是：复选框 <input type="checkbox" checked={task.isDone} ref={checkRef} /> 设置了 checked 属性，但没有 onChange，导致它是只读的。普通的复选框（没有设置 checked 属性）是非受控组件，由浏览器自己管理状态，所以可以直接勾选或取消勾选，无需 onChange。当你设置了 checked={...}，复选框就变成了受控组件，状态完全由 React 决定，必须配合 onChange 来更新状态，否则它会变成只读，无法交互。

解决方法：
如果希望复选框可编辑，应该用 onChange 和本地状态控制它。
如果只是展示状态，可以用 readOnly 或 defaultChecked。

最终实现：

```tsx
import type { Task } from "../type"
import { useContext, useState } from "react"
import { TaskDispatchContext } from "../TasksContext"
export default function TaskItem({ task }: { task: Task }) {
    const [isEditing, setIsEditing] = useState(false)

    const [newContent, setNewContent] = useState(task.content)
    const [isChecked, setIsChecked] = useState(task.isDone)

    const taskDispatch = useContext(TaskDispatchContext)
    const handleDlete = () => {
        taskDispatch({
            type: 'remove',
            id: task.id,
        })
    }
    const handleSave = () => {
        taskDispatch({
            type: 'change',
            id: task.id,
            content: newContent,
            isDone: isChecked
        })
        setIsEditing(false)
    }
    return (
        <div className="task-item">
            <span>{task.id}. </span>
            {isEditing ? (
                <input value={newContent} onChange={e => setNewContent(e.target.value)} />
            ) : (
                task.content
            )}
            {task.isDone ? <span className="done">完成</span> : <span className="undone">未完成</span>}
            {isEditing ? (
                <>
                    <input type="checkbox" checked={isChecked} onChange={e => setIsChecked(e.target.checked)} />
                    <button onClick={handleSave}>保存</button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)}>编辑</button>
            )}
            <button onClick={handleDlete}>删除</button>
        </div>
    )
}
```