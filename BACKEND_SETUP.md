# 后端API服务设置指南

由于微信小程序无法直接连接数据库，需要搭建一个后端API服务作为中间层。

## 数据库配置

服务器信息：
- 服务器名称：yubian-db.database.windows.net
- 数据库名：MinishopDB
- 用户名：yubian
- 密码：bych+1995107

## API端点设计

### 商品相关API

#### GET /api/goods
获取所有商品列表
响应体：
```javascript
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "iPhone 15",
      "description": "全新苹果手机，性能强劲",
      "price": 5999,
      "stock": 10,
      "image": "https://via.placeholder.com/300x300.png?text=iPhone15",
      "status": "online"
    }
  ]
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

#### GET /api/goods/{id}
根据ID获取商品详情
响应体：
```javascript
{
  "success": true,
  "data": {
    "id": "商品ID",
    "name": "商品名称",
    "description": "商品描述",
    "price": 价格,
    "stock": 库存数量,
    "image": "图片URL",
    "status": "online"
  }
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

#### POST /api/goods
添加新商品
请求体：
```javascript
{
  "name": "商品名称",
  "description": "商品描述",
  "price": 999,
  "stock": 10,
  "image": "图片URL",
  "status": "online"
}
```

响应体：
```javascript
{
  "success": true,
  "message": "添加成功",
  "data": {
    "id": "新商品ID",
    "name": "商品名称",
    "description": "商品描述",
    "price": 999,
    "stock": 10,
    "image": "图片URL",
    "status": "online"
  }
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

#### PUT /api/goods/{id}
更新商品信息
请求体：
```javascript
{
  "name": "商品名称",
  "description": "商品描述",
  "price": 999,
  "stock": 10,
  "image": "图片URL",
  "status": "online"
}
```

响应体：
```javascript
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "商品ID",
    "name": "商品名称",
    "description": "商品描述",
    "price": 999,
    "stock": 10,
    "image": "图片URL",
    "status": "online"
  }
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

#### DELETE /api/goods/{id}
删除商品
响应体：
```javascript
{
  "success": true,
  "message": "删除成功"
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

#### POST /api/goods/{id}/seckill
执行抢购操作
请求体：
```javascript
{
  "goodsId": "商品ID"
}
```

响应体：
```javascript
{
  "success": true,
  "message": "抢购成功",
  "data": {
    // 更新后的商品信息
    "id": "商品ID",
    "name": "商品名称",
    "description": "商品描述",
    "price": 价格,
    "stock": 库存数量,
    "image": "图片URL",
    "status": "online"
  }
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

#### POST /api/goods/{id}/toggle-status
切换商品上下架状态
响应体：
```javascript
{
  "success": true,
  "message": "商品已上架" 或 "商品已下架",
  "data": {
    "id": "商品ID",
    "status": "online" 或 "offline"
  }
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

### 认证相关API

#### POST /api/auth/admin-login
管理员登录
请求体：
```javascript
{
  "username": "admin用户名",
  "password": "admin密码"
}
```

响应体：
```javascript
{
  "success": true,
  "message": "登录成功"
}
```
或
```javascript
{
  "success": false,
  "message": "错误信息"
}
```

## Node.js + Express 示例实现

```javascript
// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(cors());

// 数据库配置
const config = {
  user: 'yubian',
  password: 'bych+1995107',
  server: 'yubian-db.database.windows.net',
  database: 'MinishopDB',
  options: {
    encrypt: true, // 对于Azure SQL数据库必需
    trustServerCertificate: false // 在生产环境中应设为false
  }
};

// 连接数据库
async function connectToDatabase() {
  try {
    await sql.connect(config);
    console.log('成功连接到SQL Server数据库');
  } catch (err) {
    console.error('数据库连接失败:', err);
  }
}

connectToDatabase();

// API路由

// 获取所有商品
app.get('/api/goods', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Goods WHERE Status = \'online\'');
    res.json({ data: result.recordset, success: true });
  } catch (err) {
    console.error('查询商品列表失败:', err);
    res.status(500).json({ success: false, message: '查询失败' });
  }
});

// 根据ID获取商品
app.get('/api/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql.query`SELECT * FROM Goods WHERE Id = ${id}`;
    
    if (result.recordset.length > 0) {
      res.json({ data: result.recordset[0], success: true });
    } else {
      res.status(404).json({ success: false, message: '商品不存在' });
    }
  } catch (err) {
    console.error('查询商品详情失败:', err);
    res.status(500).json({ success: false, message: '查询失败' });
  }
});

// 添加商品
app.post('/api/goods', async (req, res) => {
  try {
    const { name, description, price, stock, image, status } = req.body;
    const id = Date.now().toString(); // 简单的ID生成
    
    const result = await sql.query`
      INSERT INTO Goods (Id, Name, Description, Price, Stock, Image, Status)
      VALUES (${id}, ${name}, ${description}, ${price}, ${stock}, ${image}, ${status || 'online'})
    `;
    
    res.json({ 
      success: true, 
      message: '添加成功',
      data: { id, name, description, price, stock, image, status: status || 'online' }
    });
  } catch (err) {
    console.error('添加商品失败:', err);
    res.status(500).json({ success: false, message: '添加失败' });
  }
});

// 更新商品
app.put('/api/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image, status } = req.body;
    
    const result = await sql.query`
      UPDATE Goods SET 
        Name = ${name}, 
        Description = ${description}, 
        Price = ${price}, 
        Stock = ${stock},
        Image = ${image},
        Status = ${status}
      WHERE Id = ${id}
    `;
    
    if (result.rowsAffected[0] > 0) {
      res.json({ 
        success: true, 
        message: '更新成功',
        data: { id, name, description, price, stock, image, status }
      });
    } else {
      res.status(404).json({ success: false, message: '商品不存在' });
    }
  } catch (err) {
    console.error('更新商品失败:', err);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 删除商品
app.delete('/api/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql.query`DELETE FROM Goods WHERE Id = ${id}`;
    
    if (result.rowsAffected[0] > 0) {
      res.json({ success: true, message: '删除成功' });
    } else {
      res.status(404).json({ success: false, message: '商品不存在' });
    }
  } catch (err) {
    console.error('删除商品失败:', err);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 抢购商品
app.post('/api/goods/:id/seckill', async (req, res) => {
  try {
    const { id } = req.params;
    // 前端传递的goodsId参数
    const { goodsId } = req.body;

    // 验证路径参数和请求体中的商品ID是否一致
    if (id !== goodsId) {
      return res.status(400).json({ success: false, message: '商品ID不匹配' });
    }

    // 使用事务确保库存扣减的原子性
    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      // 查询当前库存和商品状态
      const queryResult = await transaction.request()
        .input('id', sql.VarChar, id)
        .query('SELECT Stock, Status FROM Goods WHERE Id = @id');

      if (queryResult.recordset.length === 0) {
        await transaction.rollback();
        return res.json({ success: false, message: '商品不存在' });
      }

      const goods = queryResult.recordset[0];

      if (goods.Status !== 'online') {
        await transaction.rollback();
        return res.json({ success: false, message: '商品未上架' });
      }

      if (goods.Stock <= 0) {
        await transaction.rollback();
        return res.json({ success: false, message: '商品已售罄' });
      }

      // 扣减库存
      const updateResult = await transaction.request()
        .input('id', sql.VarChar, id)
        .query('UPDATE Goods SET Stock = Stock - 1 WHERE Id = @id AND Stock > 0 AND Status = \'online\'');

      if (updateResult.rowsAffected[0] === 0) {
        await transaction.rollback();
        return res.json({ success: false, message: '抢购失败，可能是因为库存不足或商品状态变更' });
      }

      // 获取更新后的商品信息
      const updatedQueryResult = await transaction.request()
        .input('id', sql.VarChar, id)
        .query('SELECT * FROM Goods WHERE Id = @id');

      await transaction.commit();

      res.json({
        success: true,
        message: '抢购成功',
        data: updatedQueryResult.recordset[0]
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('抢购商品失败:', err);
    res.status(500).json({ success: false, message: '抢购失败' });
  }
});

// 切换商品状态
app.post('/api/goods/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql.query`
      UPDATE Goods SET Status = 
        CASE WHEN Status = 'online' THEN 'offline' 
             ELSE 'online' 
        END
      WHERE Id = ${id}
    `;
    
    if (result.rowsAffected[0] > 0) {
      // 获取更新后的状态
      const updatedResult = await sql.query`SELECT Status FROM Goods WHERE Id = ${id}`;
      const newStatus = updatedResult.recordset[0].Status;
      
      res.json({ 
        success: true, 
        message: newStatus === 'online' ? '商品已上架' : '商品已下架',
        data: { id, status: newStatus }
      });
    } else {
      res.status(404).json({ success: false, message: '商品不存在' });
    }
  } catch (err) {
    console.error('切换商品状态失败:', err);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

// 管理员登录
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 实际应用中应使用更安全的认证机制
    if (username === 'admin' && password === 'admin123') {
      res.json({ success: true, message: '登录成功' });
    } else {
      res.json({ success: false, message: '用户名或密码错误' });
    }
  } catch (err) {
    console.error('管理员登录失败:', err);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
```

## 部署选项

1. **云函数**：使用腾讯云云函数服务
2. **Web服务器**：部署到任何支持Node.js的服务器
3. **容器化**：使用Docker部署

## 安全注意事项

1. 不要在前端代码中暴露数据库连接信息
2. 实现适当的认证和授权机制
3. 验证和清理所有用户输入
4. 使用HTTPS加密传输
5. 限制API访问频率

## 依赖安装

```bash
npm install express mssql cors
```