// server/database.js
const sql = require('mssql');

// 数据库配置
const config = {
  user: 'yubian',
  password: 'bych+1995107',
  server: 'yubian-db.database.windows.net',
  database: 'MinishopDB',
  options: {
    encrypt: true, // 使用Azure SQL数据库时需要加密
    trustServerCertificate: false // 改为false以确保安全性
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

class DatabaseService {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = await sql.connect(config);
      console.log('数据库连接成功');
      return this.pool;
    } catch (err) {
      console.error('数据库连接失败:', err);
      throw err;
    }
  }

  async disconnect() {
    try {
      await sql.close();
      console.log('数据库连接已关闭');
    } catch (err) {
      console.error('关闭数据库连接时出错:', err);
    }
  }

  // 获取所有上架的商品
  async getAllGoods() {
    try {
      const result = await this.pool.request()
        .query(`
          SELECT Id, Name, Description, Price, Stock, ImageUrl, Status, CreatedAt, UpdatedAt
          FROM Goods
          WHERE Status = 'online'
          ORDER BY CreatedAt DESC
        `);
      return result.recordset;
    } catch (err) {
      console.error('获取商品列表失败:', err);
      throw err;
    }
  }

  // 根据ID获取商品
  async getGoodById(id) {
    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, id)
        .query(`
          SELECT Id, Name, Description, Price, Stock, ImageUrl, Status, CreatedAt, UpdatedAt
          FROM Goods
          WHERE Id = @id AND Status = 'online'
        `);
      return result.recordset[0];
    } catch (err) {
      console.error('获取商品详情失败:', err);
      throw err;
    }
  }

  // 执行抢购操作
  async seckill(userId, goodsId, quantity = 1) {
    try {
      const transaction = new sql.Transaction(this.pool);
      await transaction.begin();

      try {
        // 查询商品信息并锁定行
        const goodsResult = await transaction.request()
          .input('goodsId', sql.NVarChar, goodsId)
          .query(`
            SELECT Id, Name, Price, Stock, Status
            FROM Goods WITH (UPDLOCK, ROWLOCK)
            WHERE Id = @goodsId
          `);

        const goods = goodsResult.recordset[0];
        if (!goods) {
          await transaction.rollback();
          return { success: false, message: '商品不存在' };
        }

        if (goods.Status !== 'online') {
          await transaction.rollback();
          return { success: false, message: '商品未上架' };
        }

        if (goods.Stock < quantity) {
          await transaction.rollback();
          return { success: false, message: '库存不足' };
        }

        // 更新库存
        await transaction.request()
          .input('goodsId', sql.NVarChar, goodsId)
          .input('quantity', sql.Int, quantity)
          .query(`
            UPDATE Goods
            SET Stock = Stock - @quantity,
                UpdatedAt = GETDATE()
            WHERE Id = @goodsId AND Stock >= @quantity
          `);

        // 检查是否更新成功（防止并发问题）
        const rowsAffected = transaction.lastRequest.rowsAffected[0];
        if (rowsAffected === 0) {
          await transaction.rollback();
          return { success: false, message: '库存不足（并发控制）' };
        }

        // 记录抢购订单
        await transaction.request()
          .input('goodsId', sql.NVarChar, goodsId)
          .input('userId', sql.NVarChar, userId)
          .input('quantity', sql.Int, quantity)
          .query(`
            INSERT INTO SeckillRecords (GoodsId, UserId, Quantity, Status)
            VALUES (@goodsId, @userId, @quantity, 'success')
          `);

        await transaction.commit();
        return {
          success: true,
          message: '抢购成功',
          goods: { ...goods, Stock: goods.Stock - quantity }
        };
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      console.error('抢购操作失败:', err);
      return { success: false, message: '抢购失败: ' + err.message };
    }
  }

  // 添加商品
  async addGood(good) {
    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, good.id || Date.now().toString())
        .input('name', sql.NVarChar, good.name)
        .input('description', sql.NVarChar, good.description)
        .input('price', sql.Decimal, good.price)
        .input('stock', sql.Int, good.stock)
        .input('imageUrl', sql.NVarChar, good.imageUrl)
        .input('status', sql.NVarChar, good.status || 'online')
        .query(`
          INSERT INTO Goods (Id, Name, Description, Price, Stock, ImageUrl, Status)
          VALUES (@id, @name, @description, @price, @stock, @imageUrl, @status)
        `);
      
      return { success: true, message: '添加成功' };
    } catch (err) {
      console.error('添加商品失败:', err);
      return { success: false, message: '添加失败: ' + err.message };
    }
  }

  // 更新商品
  async updateGood(good) {
    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, good.id)
        .input('name', sql.NVarChar, good.name)
        .input('description', sql.NVarChar, good.description)
        .input('price', sql.Decimal, good.price)
        .input('stock', sql.Int, good.stock)
        .input('imageUrl', sql.NVarChar, good.imageUrl)
        .input('status', sql.NVarChar, good.status)
        .query(`
          UPDATE Goods
          SET Name = @name,
              Description = @description,
              Price = @price,
              Stock = @stock,
              ImageUrl = @imageUrl,
              Status = @status,
              UpdatedAt = GETDATE()
          WHERE Id = @id
        `);
      
      if (result.rowsAffected[0] > 0) {
        return { success: true, message: '更新成功' };
      } else {
        return { success: false, message: '商品不存在' };
      }
    } catch (err) {
      console.error('更新商品失败:', err);
      return { success: false, message: '更新失败: ' + err.message };
    }
  }

  // 删除商品
  async deleteGood(goodId) {
    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, goodId)
        .query(`DELETE FROM Goods WHERE Id = @id`);
      
      if (result.rowsAffected[0] > 0) {
        return { success: true, message: '删除成功' };
      } else {
        return { success: false, message: '商品不存在' };
      }
    } catch (err) {
      console.error('删除商品失败:', err);
      return { success: false, message: '删除失败: ' + err.message };
    }
  }

  // 切换商品状态（上架/下架）
  async toggleGoodStatus(goodId) {
    try {
      // 首先获取当前状态
      const currentResult = await this.pool.request()
        .input('id', sql.NVarChar, goodId)
        .query(`SELECT Status FROM Goods WHERE Id = @id`);
      
      if (!currentResult.recordset[0]) {
        return { success: false, message: '商品不存在' };
      }
      
      const currentStatus = currentResult.recordset[0].Status;
      const newStatus = currentStatus === 'online' ? 'offline' : 'online';
      
      const result = await this.pool.request()
        .input('id', sql.NVarChar, goodId)
        .input('status', sql.NVarChar, newStatus)
        .query(`UPDATE Goods SET Status = @status, UpdatedAt = GETDATE() WHERE Id = @id`);
      
      if (result.rowsAffected[0] > 0) {
        return {
          success: true,
          message: newStatus === 'online' ? '商品已上架' : '商品已下架',
          newStatus: newStatus
        };
      } else {
        return { success: false, message: '操作失败' };
      }
    } catch (err) {
      console.error('切换商品状态失败:', err);
      return { success: false, message: '操作失败: ' + err.message };
    }
  }

  // 管理员登录验证
  async validateAdmin(username, password) {
    try {
      // 注意：在实际应用中，应该对密码进行哈希比较
      // 这里仅为演示目的
      const result = await this.pool.request()
        .input('username', sql.NVarChar, username)
        .query(`
          SELECT Id, Username, IsActive
          FROM AdminUsers
          WHERE Username = @username AND IsActive = 1
        `);
      
      if (result.recordset.length > 0) {
        // 实际应用中应验证密码哈希
        // 这里简化处理，仅检查用户名是否存在
        return { success: true, message: '登录成功', admin: result.recordset[0] };
      } else {
        return { success: false, message: '用户名或密码错误' };
      }
    } catch (err) {
      console.error('管理员验证失败:', err);
      return { success: false, message: '验证失败: ' + err.message };
    }
  }
}

module.exports = DatabaseService;