# 微信小程序 - 商品抢购系统

这是一个简单的微信小程序，实现了商品抢购功能，包含用户端和管理员后台。

## 功能特性

### 用户端功能
- 浏览商品列表
- 查看商品详情
- 参与商品抢购
- 实时库存显示
- 抢购倒计时

### 管理员功能
- 管理员登录验证
- 添加新商品
- 编辑商品信息
- 上架/下架商品
- 删除商品
- 库存管理

## 技术实现

- 使用原生微信小程序框架
- SQL Server数据库存储
- Node.js API服务器
- 简单的权限管理系统

## 数据库设置

### 数据库配置
- Server: yubian-db.database.windows.net
- Database: MinishopDB
- Username: yubian
- Password: bych+1995107

### 创建数据库表
运行 `DatabaseSchema.sql` 脚本创建所需的表结构。

## 服务器设置

### 安装依赖
```bash
npm install
```

### 启动服务器
```bash
npm start
```

服务器将在 `http://localhost:3000` 上运行。

## 使用说明

### 用户端
1. 打开小程序后自动进入商品列表页
2. 查看商品信息和库存情况
3. 在指定时间参与抢购活动
4. 点击"立即抢购"按钮完成购买

### 管理员端
1. 点击底部"管理"标签进入管理员页面
2. 如未登录会跳转到登录页面
3. 使用以下凭据登录：
   - 用户名: admin
   - 密码: admin123
4. 登录后可进行商品管理操作

## 文件结构

```
wechat-seckill-mall/
├── app.js              # 小程序入口文件
├── app.json            # 小程序全局配置
├── app.wxss            # 全局样式
├── sitemap.json        # 站点地图配置
├── package.json        # 服务器依赖配置
├── DatabaseSchema.sql  # 数据库表结构脚本
├── server/
│   ├── server.js       # API服务器主文件
│   └── database.js     # 数据库操作类
├── pages/              # 页面文件目录
│   ├── index/          # 首页（商品列表）
│   ├── detail/         # 商品详情页
│   ├── admin/          # 管理员后台
│   └── login/          # 管理员登录
├── utils/              # 工具类
│   └── api.js          # API 接口封装
└── images/             # 图片资源
```

## 注意事项

- 本项目使用SQL Server数据库存储数据
- 需要先启动Node.js API服务器才能正常使用
- 管理员登录凭据存储在数据库中
- 图片使用占位符链接，实际部署时请替换为真实图片地址