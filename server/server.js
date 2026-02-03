// server/server.js
const express = require('express');
const cors = require('cors');
const DatabaseService = require('./database');

const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(cors());

// 初始化数据库服务
const dbService = new DatabaseService();

// 连接数据库
dbService.connect().catch(err => {
  console.error('无法连接到数据库:', err);
});

// API 路由

// 获取所有商品
app.get('/api/goods', async (req, res) => {
  try {
    const goods = await dbService.getAllGoods();
    res.json({ success: true, data: goods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个商品
app.get('/api/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const good = await dbService.getGoodById(id);
    if (good) {
      res.json({ success: true, data: good });
    } else {
      res.status(404).json({ success: false, message: '商品不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 抢购商品
app.post('/api/seckill', async (req, res) => {
  try {
    const { userId, goodsId, quantity } = req.body;
    
    if (!userId || !goodsId) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    const result = await dbService.seckill(userId, goodsId, quantity || 1);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 管理员登录
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }
    
    const result = await dbService.validateAdmin(username, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 添加商品 (需要管理员权限)
app.post('/api/goods', async (req, res) => {
  try {
    const good = req.body;
    
    // 这里应该有管理员身份验证
    // 为了简化，暂时不实现
    
    const result = await dbService.addGood(good);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新商品
app.put('/api/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const good = req.body;
    good.id = id;
    
    // 这里应该有管理员身份验证
    
    const result = await dbService.updateGood(good);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除商品
app.delete('/api/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 这里应该有管理员身份验证
    
    const result = await dbService.deleteGood(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 切换商品状态（上架/下架）
app.put('/api/goods/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 这里应该有管理员身份验证
    
    const result = await dbService.toggleGoodStatus(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});