@echo off
chcp 65001 >nul
echo.
echo ===================================
echo     🐕 PawMate App 启动器
echo ===================================
echo.

echo 📂 切换到项目目录...
cd /d "%~dp0"

echo 🔍 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装，正在直接打开HTML文件...
    start app.html
    echo ✅ 已在浏览器中打开App
    echo 💡 注意：某些功能可能受限，建议安装Python
    pause
    exit /b 0
)

echo ✅ Python环境检查通过
echo.

echo 🚀 启动服务器...
echo 🌐 本地地址: http://localhost:8000/app.html
echo 📱 手机地址: http://你的电脑IP:8000/app.html
echo.

echo ⏰ 2秒后自动打开浏览器...
timeout /t 2 /nobreak >nul

start http://localhost:8000/app.html

echo.
echo 🎉 启动成功！按 Ctrl+C 停止服务器
echo.

python -m http.server 8000

pause 