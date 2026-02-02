// utils/api.js
// Mock 数据存储
let goodsData = [
  {
    id: '1',
    name: 'iPhone 15',
    description: '全新苹果手机，性能强劲',
    price: 5999,
    stock: 10,
    image: 'https://via.placeholder.com/300x300.png?text=iPhone15',
    status: 'online'
  },
  {
    id: '2',
    name: 'MacBook Pro',
    description: '专业级笔记本电脑，适合设计师',
    price: 12999,
    stock: 5,
    image: 'https://via.placeholder.com/300x300.png?text=MacBook',
    status: 'online'
  },
  {
    id: '3',
    name: 'AirPods Pro',
    description: '无线降噪耳机，音质出色',
    price: 1999,
    stock: 20,
    image: 'https://via.placeholder.com/300x300.png?text=AirPods',
    status: 'online'
  }
];

// 获取所有商品
export function getGoodsList() {
  return goodsData.filter(goods => goods.status === 'online');
}

// 根据ID获取商品
export function getGoodsById(id) {
  return goodsData.find(goods => goods.id === id && goods.status === 'online');
}

// 抢购商品
export function seckill(goodsId) {
  const goods = goodsData.find(item => item.id === goodsId);
  
  if (!goods) {
    return {
      success: false,
      message: '商品不存在'
    };
  }
  
  if (goods.status !== 'online') {
    return {
      success: false,
      message: '商品未上架'
    };
  }
  
  if (goods.stock <= 0) {
    return {
      success: false,
      message: '商品已售罄'
    };
  }
  
  // 模拟并发情况下的库存检查
  goods.stock -= 1;
  
  return {
    success: true,
    message: '抢购成功',
    goods: goods
  };
}

// 添加商品
export function addGoods(goods) {
  // 生成唯一ID
  const newId = String(Date.now());
  
  const newGoods = {
    id: newId,
    ...goods
  };
  
  goodsData.push(newGoods);
  
  return {
    success: true,
    message: '添加成功',
    goods: newGoods
  };
}

// 更新商品
export function updateGoods(goods) {
  const index = goodsData.findIndex(item => item.id === goods.id);
  
  if (index === -1) {
    return {
      success: false,
      message: '商品不存在'
    };
  }
  
  goodsData[index] = { ...goodsData[index], ...goods };
  
  return {
    success: true,
    message: '更新成功',
    goods: goodsData[index]
  };
}

// 删除商品
export function deleteGoods(goodsId) {
  const index = goodsData.findIndex(item => item.id === goodsId);
  
  if (index === -1) {
    return {
      success: false,
      message: '商品不存在'
    };
  }
  
  goodsData.splice(index, 1);
  
  return {
    success: true,
    message: '删除成功'
  };
}

// 上架/下架商品
export function toggleGoodsStatus(goodsId) {
  const goods = goodsData.find(item => item.id === goodsId);
  
  if (!goods) {
    return {
      success: false,
      message: '商品不存在'
    };
  }
  
  goods.status = goods.status === 'online' ? 'offline' : 'online';
  
  return {
    success: true,
    message: goods.status === 'online' ? '商品已上架' : '商品已下架',
    goods: goods
  };
}

// 管理员登录
export function adminLogin(username, password) {
  // 这里是模拟验证，实际应用中应该有更安全的验证机制
  if (username === 'admin' && password === 'admin123') {
    return {
      success: true,
      message: '登录成功'
    };
  }
  
  return {
    success: false,
    message: '用户名或密码错误'
  };
}