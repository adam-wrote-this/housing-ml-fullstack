@echo off
setlocal enabledelayedexpansion

REM Docker验收脚本 - 自动修复并启动ml-service
REM 需要Docker Desktop已启动

echo ========================================
echo   ML-Service Docker 验收启动脚本
echo ========================================
echo.

REM 检查Docker是否可用
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 命令未找到
    echo.
    echo 请确保：
    echo 1. Docker Desktop 已安装
    echo 2. Docker Desktop 应用已启动（状态栏右下角看Docker图标）
    echo 3. 如果刚安装，请关闭并重新打开这个终端窗口
    echo.
    pause
    exit /b 1
)

echo ✓ Docker 已就绪
docker --version
echo.

REM 进入项目目录
cd /d "%~dp0"
echo 项目目录: %cd%
echo.

REM 清理旧容器和镜像
echo ⏳ 清理Docker缓存...
docker system prune -f >nul 2>&1
echo ✓ 缓存已清理
echo.

REM 构建镜像
echo ⏳ 正在构建 ml-service 镜像（首次构建需要1-3分钟）...
docker compose build ml-service
if errorlevel 1 (
    echo ❌ 镜像构建失败！
    echo.
    echo 可能的原因：
    echo - Docker Desktop 未启动
    echo - 网络连接问题
    echo - 磁盘空间不足
    echo.
    pause
    exit /b 1
)
echo.

REM 启动服务
echo ✓ 镜像构建成功！
echo.
echo ⏳ 正在启动 ml-service...
echo.
docker compose up ml-service

REM 用户按Ctrl+C停止服务后
echo.
echo ========================================
echo   服务已停止
echo ========================================
echo.
echo 验收完成！
echo.
pause
