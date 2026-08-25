# 🐕 PawMate - 遛狗社交App

## 项目简介

PawMate是一款专为爱狗人士打造的社交应用，让每只狗狗都能找到朋友。通过地理位置服务，用户可以轻松找到附近的遛狗伙伴，分享美好时光，购买宠物用品。

## ✨ 主要功能

### 🗺️ 地图社交
- 实时显示附近的遛狗用户
- 查看狗狗信息和主人资料
- 一键发起聊天和约玩邀请
- 智能筛选功能

### 📱 社交分享
- 发布狗狗日常动态
- 故事圈功能
- 点赞和评论互动
- 内容推荐算法

### 💬 即时通讯
- 实时聊天功能
- 群组约玩
- 消息通知
- 表情包和图片分享

### 🛒 宠物商城
- 精选宠物用品
- 商品分类浏览
- 购物车和订单管理
- 用户评价系统

### 👤 个人中心
- 个人资料管理
- 宠物档案
- 约玩记录
- 设置中心

## 🚀 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: Tailwind CSS
- **地图**: Leaflet + OpenStreetMap
- **图标**: Font Awesome
- **PWA**: Service Worker + Web App Manifest
- **部署**: 静态文件部署

## 📱 支持平台

- **移动端**: iOS Safari, Android Chrome
- **桌面端**: Chrome, Firefox, Safari, Edge
- **PWA安装**: 支持添加到主屏幕

## 🔧 本地运行

### 方法一：Python服务器（推荐）
```bash
# 确保已安装Python
python -m http.server 3000

# 打开浏览器访问
http://localhost:3000/app.html
```

### 方法二：Node.js服务器
```bash
# 安装live-server
npm install -g live-server

# 启动服务器
live-server --port=3000

# 自动打开浏览器
```

### 方法三：直接打开
直接双击 `app.html` 文件在浏览器中打开（某些功能可能受限）

## 📦 文件结构

```
pawmate-app/
├── app.html          # 主应用页面
├── app.js            # 应用逻辑
├── manifest.json     # PWA配置
├── sw.js             # Service Worker
├── package.json      # 项目配置
├── README.md         # 项目文档
├── home.html         # 原型参考-地图页面
├── discover.html     # 原型参考-发现页面
├── messages.html     # 原型参考-消息页面
├── shop.html         # 原型参考-商城页面
└── index.html        # 原型展示页面
```

## 🌟 PWA特性

### 可安装性
- 支持添加到手机主屏幕
- 独立窗口运行，类似原生应用
- 自定义启动画面和图标

### 离线功能
- Service Worker缓存核心资源
- 离线浏览已加载内容
- 网络恢复后自动同步

### 推送通知
- 支持消息推送通知
- 约玩邀请提醒
- 后台同步功能

## 🎨 设计特色

### 现代化UI
- iPhone原生风格设计
- 流畅的动画效果
- 响应式布局
- 深色模式友好

### 用户体验
- 直观的导航设计
- 快速响应的交互
- 智能推荐算法
- 无障碍访问支持

## 🔒 隐私与安全

- 位置信息仅在授权后使用
- 用户数据本地存储
- 可选择性分享个人信息
- 符合数据保护法规

## 📱 使用指南

### 1. 首次启动
- 允许位置访问权限
- 完善个人资料
- 添加宠物信息

### 2. 寻找朋友
- 查看地图上的用户标记
- 点击头像查看详细信息
- 发起聊天或约玩邀请

### 3. 发布动态
- 切换到发现页面
- 点击相机图标发布内容
- 添加文字描述和标签

### 4. 购物体验
- 浏览商城页面
- 选择心仪商品
- 加入购物车结算

## 🔮 未来规划

### 短期目标（1-3个月）
- [ ] 用户注册登录系统
- [ ] 实时聊天功能完善
- [ ] 支付系统集成
- [ ] 推送通知服务

### 中期目标（3-6个月）
- [ ] AI智能推荐
- [ ] 视频通话功能
- [ ] 社区活动组织
- [ ] 宠物健康档案

### 长期目标（6-12个月）
- [ ] 多语言支持
- [ ] 宠物医疗服务
- [ ] AR互动功能
- [ ] 区块链积分体系

## 🤝 贡献指南

欢迎对项目做出贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📞 联系我们

- **项目负责人**: PawMate Team
- **技术支持**: tech@pawmate.app
- **用户反馈**: feedback@pawmate.app
- **商务合作**: business@pawmate.app

## 📄 开源协议

本项目采用 MIT 开源协议。详情请参考 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有为项目做出贡献的开发者和用户！

特别感谢：
- [Leaflet](https://leafletjs.com/) - 开源地图库
- [Tailwind CSS](https://tailwindcss.com/) - 实用工具优先的CSS框架
- [Font Awesome](https://fontawesome.com/) - 图标库
- [Unsplash](https://unsplash.com/) - 高质量图片素材

---

**让每只狗狗都有朋友！🐕💕** 