// utils/api.js
const API_BASE_URL = 'http://localhost:3000/api'; // 服务器地址

// 获取所有商品
export async function getGoodsList() {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/goods`,
      method: 'GET'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      return response.data.data;
    } else {
      console.error('获取商品列表失败:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('请求失败:', error);
    return [];
  }
}

// 根据ID获取商品
export async function getGoodsById(id) {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/goods/${id}`,
      method: 'GET'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      return response.data.data;
    } else {
      console.error('获取商品详情失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}

// 抢购商品
export async function seckill(goodsId, quantity = 1) {
  try {
    // 这里应该获取用户的唯一标识，这里简化处理
    const userId = wx.getStorageSync('userId') || 'default_user_id';
    
    const response = await wx.request({
      url: `${API_BASE_URL}/seckill`,
      method: 'POST',
      data: {
        userId: userId,
        goodsId: goodsId,
        quantity: quantity
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('抢购请求失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
}

// 管理员登录
export async function adminLogin(username, password) {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/admin/login`,
      method: 'POST',
      data: {
        username: username,
        password: password
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('登录请求失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
}

// 添加商品
export async function addGoods(goods) {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/goods`,
      method: 'POST',
      data: goods
    });
    
    return response.data;
  } catch (error) {
    console.error('添加商品请求失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
}

// 更新商品
export async function updateGoods(goods) {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/goods/${goods.id}`,
      method: 'PUT',
      data: goods
    });
    
    return response.data;
  } catch (error) {
    console.error('更新商品请求失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
}

// 删除商品
export async function deleteGoods(goodsId) {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/goods/${goodsId}`,
      method: 'DELETE'
    });
    
    return response.data;
  } catch (error) {
    console.error('删除商品请求失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
}

// 上架/下架商品
export async function toggleGoodsStatus(goodsId) {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/goods/${goodsId}/status`,
      method: 'PUT'
    });
    
    return response.data;
  } catch (error) {
    console.error('切换商品状态请求失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
}