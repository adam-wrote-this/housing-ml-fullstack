# 🐳 Docker Desktop 安装指南

## 问题诊断
您当前系统中**未安装Docker Desktop**。这是进行Docker验收所必需的。

---

## 📥 安装步骤（Windows）

### 第1步：下载Docker Desktop
访问官方下载页面：
**https://www.docker.com/products/docker-desktop**

点击 **"Download for Windows"** 按钮（会自动检测您的系统版本）

### 第2步：运行安装程序
1. 找到下载的 `Docker Desktop Installer.exe`
2. 双击运行
3. 按照安装向导的默认选项完成安装
4. 安装过程可能需要重启计算机

### 第3步：启动Docker Desktop
- 安装完成后，在开始菜单搜索 "Docker Desktop"
- 点击启动应用
- 首次启动可能需要1-2分钟进行初始化
- 完成后您会在Windows状态栏（右下角）看到Docker图标

### 第4步：验证安装
打开 PowerShell 或 CMD，执行以下命令：

```powershell
docker --version
docker compose version
```

**预期输出**应显示版本号，例如：
```
Docker version 24.0.0, build xxxxxx
Docker Compose version v2.20.0
```

---

## ⚙️ 安装后的配置

### 检查系统要求
Docker Desktop 需要：
- ✅ Windows 10/11 Pro、Enterprise 或 Education 版本（不支持Home）
- ✅ 至少 4GB RAM
- ✅ 20GB 可用磁盘空间
- ✅ CPU 支持虚拟化（通常默认支持）

### 如果使用 Windows 10 Home
需要使用 **WSL 2（Windows Subsystem for Linux 2）**：

1. 打开 PowerShell（管理员）
2. 执行以下命令启用WSL2：
```powershell
wsl --install
```
3. 重启计算机
4. 再次安装 Docker Desktop

---

## 🚀 Docker 启动后验收ml-service

当Docker Desktop成功启动后，执行：

```bash
# 进入项目目录
cd housing-ml-fullstack

# 构建并启动ml-service
docker compose up --build ml-service
```

---

## 🆘 常见问题

### Q: 下载太慢或无法访问官方网站？
A: 可以尝试阿里云镜像源：
https://mirrors.aliyun.com/docker-ce/

### Q: 安装过程中提示需要管理员权限？
A: 右键点击安装程序，选择 "以管理员身份运行"

### Q: Docker Desktop启动后进程占用高CPU？
A: 这是正常的初始化过程，等待1-2分钟后应该会降低

### Q: 提示 "Docker daemon is not running"？
A: 需要启动Docker Desktop应用，不仅仅是命令行工具

### Q: Windows 11 更新后Docker无法启动？
A: 尝试更新Docker Desktop到最新版本

---

## 📞 获取帮助

如安装过程遇到问题，可以：

1. 查看 [Docker官方文档](https://docs.docker.com/desktop/install/windows-install/)
2. 访问 [Docker Community Slack](https://dockr.ly/community)
3. 查看 [Docker GitHub Issues](https://github.com/docker/for-win/issues)

---

## ✅ 验证安装成功

Docker安装成功的标志：
- ✅ 能执行 `docker --version` 显示版本号
- ✅ 能执行 `docker compose version` 显示版本号
- ✅ Windows状态栏可见Docker图标
- ✅ 能执行 `docker run hello-world` 显示欢迎信息

---

## 🎯 安装完成后

1. 启动Docker Desktop
2. 等待Docker daemon就绪（通常30秒内）
3. 打开 PowerShell 或 CMD
4. 进入项目目录：`cd housing-ml-fullstack`
5. 执行验收命令：`docker compose up --build ml-service`

---

**安装Docker Desktop后就可以开始验收阶段1了！** 🚀
