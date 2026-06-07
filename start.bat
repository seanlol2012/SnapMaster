@echo off
chcp 65001 >nul
title SnapMaster - AI 摄影助手

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   📸 SnapMaster 摄影助手                  ║
echo ╚═══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM ====== 清理旧进程（避免端口占用） ======
echo [0/4] 清理残留进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo    端口已释放

REM ====== 检查 node_modules ======
if not exist "node_modules\" (
    echo [1/4] 首次运行，正在安装依赖...
    call npm install
    echo.
) else (
    echo [1/4] 依赖已就绪
)

REM ====== 检查 .env ======
if not exist ".env" (
    echo [2/4] 未找到 .env，正在创建配置模板...
    if exist ".env.example" (
        copy .env.example .env >nul
    ) else (
        echo # SnapMaster 环境变量 > .env
        echo # 请填入至少一个 API Key 后重新运行 >> .env
        echo ZHIPU_API_KEY=你的key >> .env
    )
    echo.
    echo ╔═══════════════════════════════════════════╗
    echo ║  ⚠️  请先编辑 .env 文件填入 API Key！     ║
    echo ║  然后再次双击 start.bat 启动              ║
    echo ╚═══════════════════════════════════════════╝
    echo.
    pause
    start notepad .env
    exit /b
) else (
    echo [2/4] 配置文件 .env 已找到
)

REM ====== 预编译 ======
if not exist ".next\" (
    echo [3/4] 首次启动，正在初始化...
)

echo [4/4] 启动服务中...
echo.
echo   前端页面: http://localhost:3000
echo   API 服务: http://localhost:3001
echo.
echo   按 Ctrl+C 停止，或双击 stop.bat 一键关闭
echo ═══════════════════════════════════════════
echo.

REM 启动
call npm start

REM 退出后自动清端口
echo.
echo 正在清理端口...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 " ^| findstr "LISTENING" 2^>nul') do taskkill /F /PID %%a >nul 2>&1
echo 服务已停止，所有端口已释放。
echo.
pause
