@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    🐕 PawMate 遛狗社交应用启动器
echo ==========================================
echo.
echo 请选择启动方式：
echo.
echo 1. 启动主应用 (app.html)
echo 2. 启动测试页面 (测试页面.html)  
echo 3. 启动调试版本 (debug-app.html)
echo 4. 使用Python HTTP服务器启动
echo 5. 直接在默认浏览器中打开主应用
echo 6. 退出
echo.
set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" (
    echo.
    echo 🚀 正在启动主应用...
    start "" "app.html"
    goto end
)

if "%choice%"=="2" (
    echo.
    echo 🧪 正在启动测试页面...
    start "" "测试页面.html"
    goto end
)

if "%choice%"=="3" (
    echo.
    echo 🐛 正在启动调试版本...
    start "" "debug-app.html"
    goto end
)

if "%choice%"=="4" (
    echo.
    echo 🌐 正在启动Python HTTP服务器...
    echo 服务器将在 http://localhost:8000 启动
    echo 请在浏览器中访问该地址
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto end
)

if "%choice%"=="5" (
    echo.
    echo 🌍 正在在默认浏览器中打开...
    start "" "http://localhost:8000/app.html"
    echo 如果页面未加载，请先选择选项4启动服务器
    goto end
)

if "%choice%"=="6" (
    echo.
    echo 👋 再见！
    goto end
)

echo.
echo ❌ 无效选项，请重新运行脚本
pause

:end
echo.
echo ✅ 启动完成！
echo.
echo 💡 使用提示：
echo - 如果弹窗无法关闭，请按ESC键或点击弹窗外区域
echo - 遇到问题可以使用右上角的重置按钮
echo - 建议使用Chrome或Edge浏览器获得最佳体验
echo.
pause 