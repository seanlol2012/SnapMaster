@echo off
chcp 65001 >nul
title 关闭 SnapMaster

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   🛑 正在关闭 SnapMaster...               ║
echo ╚═══════════════════════════════════════════╝
echo.

REM 杀端口 3000 和 3001 上的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    echo   关闭前端服务 (PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 " ^| findstr "LISTENING" 2^>nul') do (
    echo   关闭 API 服务 (PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)

REM 兜底：清掉所有 node 子进程
taskkill /F /IM node.exe >nul 2>&1

echo.
echo   ✅ 已关闭！所有端口已释放。
echo.
pause
