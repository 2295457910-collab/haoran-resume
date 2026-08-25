# PawMate - 遛狗社交App

## 项目概览

PawMate是一款专为爱狗人士打造的社交应用，让每只狗狗都能找到朋友。通过地理位置服务，用户可以轻松找到附近的遛狗伙伴，分享美好时光，购买宠物用品。

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **样式**: Tailwind CSS
- **地图**: Leaflet + OpenStreetMap
- **图标**: Font Awesome
- **PWA**: Service Worker + Web App Manifest

## 文件结构

```
pawmate-app/
├── index.html         # 主应用页面（app.html的副本）
├── app.html          # 主应用页面
├── app.js            # 应用逻辑
├── web-app.js        # 网页应用核心逻辑
├── manifest.json     # PWA配置
├── sw.js             # Service Worker
├── package.json      # 项目配置
├── README.md         # 项目文档
├── home.html         # 原型参考-地图页面
├── discover.html     # 原型参考-发现页面
├── shop.html         # 原型参考-商城页面
├── assets/           # 静态资源
├── backend/          # 后端相关文件
├── pages/            # 小程序页面
└── 微信小程序/       # 微信小程序源码
```

## 主要功能

### 1. 地图社交
- 实时显示附近的遛狗用户
- 查看狗狗信息和主人资料
- 一键发起聊天和约玩邀请
- 智能筛选功能

### 2. 社交分享
- 发布狗狗日常动态
- 故事圈功能
- 点赞和评论互动
- 内容推荐算法

### 3. 即时通讯
- 实时聊天功能
- 群组约玩
- 消息通知
- 表情包和图片分享

### 4. 宠物商城
- 精选宠物用品
- 商品分类浏览
- 购物车和订单管理
- 用户评价系统

### 5. 个人中心
- 个人资料管理
- 宠物档案
- 约玩记录
- 设置中心

## 启动和运行

### 开发环境
```bash
npx server -l 5000
```

### 访问地址
- 开发环境: http://localhost:5000
- 主页面: index.html 或 app.html

## 核心代码文件说明

- **index.html/app.html**: 主应用入口，包含完整的单页应用结构
- **web-app.js**: 包含所有前端逻辑，包括地图、社交、消息、商城等功能
- **sw.js**: Service Worker，用于PWA功能和离线缓存
- **manifest.json**: PWA应用清单配置

## 开发规范

1. 使用原生HTML/CSS/JavaScript开发
2. 通过CDN引入外部依赖（Tailwind CSS、Font Awesome、Leaflet等）
3. 响应式设计，适配移动端
4. PWA支持，可安装到主屏幕
5. 使用本地存储保存用户数据

## 注意事项

1. 地图功能需要HTTPS环境或localhost才能正常获取位置
2. 部分功能需要用户授权（位置信息、通知等）
3. 这是一个前端演示项目，数据存储在本地
