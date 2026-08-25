@echo off
echo 启动遛狗社交App服务器...
echo.

cd /d "%~dp0"

echo 当前目录: %CD%
echo.

echo 正在启动Python HTTP服务器...
echo 服务器地址: http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.

python -m http.server 8000

pause 