@echo off
setlocal enabledelayedexpansion

echo 切换到项目根目录...
cd /d "%~dp0"

echo.
echo 🚀 开始构建文档...
call pnpm docs:build

if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败！错误代码: %errorlevel%
    pause
    exit /b %errorlevel%
)

echo.
echo 📦 添加文件到暂存区...
git add .
if %errorlevel% neq 0 (
    echo.
    echo ❌ 添加文件失败！错误代码: %errorlevel%
    pause
    exit /b %errorlevel%
)

echo.
set /p commit_msg="💬 请输入提交信息： "
if "!commit_msg!"=="" (
    echo ⚠️ 未输入提交信息，使用默认信息
    for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set d=%%c-%%b-%%a
    set t=%time:~0,8%
    set commit_msg=自动更新文档 !d! !t!
)

echo.
echo 📝 提交更改...
git commit -m "!commit_msg!"
if %errorlevel% neq 0 (
    echo.
    echo ❌ 提交失败！错误代码: %errorlevel%
    pause
    exit /b %errorlevel%
)

echo.
echo 🚀 推送到远程仓库...
git push origin master
if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失败！错误代码: %errorlevel%
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ 部署完成！
echo.
pause