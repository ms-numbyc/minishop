/**
 * pages/admin/admin.js
 * 管理员后台页面
 */

import { getGoodsList, addGoods, updateGoods, deleteGoods, toggleGoodsStatus } from '../../utils/api.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    showEditModal: false,
    editingGoods: {
      id: '',
      name: '',
      description: '',
      price: '',
      stock: '',
      image: '',
      status: 'online'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否为管理员身份
    const app = getApp();
    if (!app.globalData.isAdmin) {
      wx.redirectTo({
        url: '../login/login'
      });
      return;
    }

    this.loadGoodsList();
  },

  /**
   * 加载商品列表
   */
  loadGoodsList: function() {
    const goodsList = getGoodsList();
    this.setData({
      goodsList: goodsList
    });
  },

  /**
   * 添加商品
   */
  addGoods: function() {
    this.setData({
      showEditModal: true,
      editingGoods: {
        id: '',
        name: '',
        description: '',
        price: '',
        stock: '',
        image: 'https://via.placeholder.com/300x300.png',
        status: 'online'
      }
    });
  },

  /**
   * 编辑商品
   */
  editGoods: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    const goods = this.data.goodsList.find(item => item.id === goodsId);
    
    if (goods) {
      this.setData({
        showEditModal: true,
        editingGoods: { ...goods }
      });
    }
  },

  /**
   * 删除商品
   */
  deleteGoods: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？此操作不可恢复',
      success: (res) => {
        if (res.confirm) {
          deleteGoods(goodsId);
          this.loadGoodsList();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 上架/下架商品
   */
  toggleStatus: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    const result = toggleGoodsStatus(goodsId);
    
    if (result.success) {
      this.loadGoodsList();
      wx.showToast({
        title: result.message,
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      });
    }
  },

  /**
   * 显示编辑弹窗
   */
  showEditModal: function() {
    this.setData({
      showEditModal: true
    });
  },

  /**
   * 关闭编辑弹窗
   */
  closeModal: function() {
    this.setData({
      showEditModal: false
    });
  },

  /**
   * 输入处理函数
   */
  onNameInput: function(e) {
    const editingGoods = this.data.editingGoods;
    editingGoods.name = e.detail.value;
    this.setData({
      editingGoods: editingGoods
    });
  },

  onDescInput: function(e) {
    const editingGoods = this.data.editingGoods;
    editingGoods.description = e.detail.value;
    this.setData({
      editingGoods: editingGoods
    });
  },

  onPriceInput: function(e) {
    const editingGoods = this.data.editingGoods;
    editingGoods.price = e.detail.value;
    this.setData({
      editingGoods: editingGoods
    });
  },

  onStockInput: function(e) {
    const editingGoods = this.data.editingGoods;
    editingGoods.stock = e.detail.value;
    this.setData({
      editingGoods: editingGoods
    });
  },

  onImageInput: function(e) {
    const editingGoods = this.data.editingGoods;
    editingGoods.image = e.detail.value;
    this.setData({
      editingGoods: editingGoods
    });
  },

  /**
   * 保存商品
   */
  saveGoods: function() {
    const goods = this.data.editingGoods;

    // 验证输入
    if (!goods.name.trim()) {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'none'
      });
      return;
    }

    if (!goods.price || isNaN(parseFloat(goods.price)) || parseFloat(goods.price) <= 0) {
      wx.showToast({
        title: '请输入正确的价格',
        icon: 'none'
      });
      return;
    }

    if (!goods.stock || isNaN(parseInt(goods.stock)) || parseInt(goods.stock) < 0) {
      wx.showToast({
        title: '请输入正确的库存数量',
        icon: 'none'
      });
      return;
    }

    // 保存商品
    let result;
    if (goods.id) {
      // 更新现有商品
      result = updateGoods(goods);
    } else {
      // 添加新商品
      result = addGoods({
        name: goods.name,
        description: goods.description,
        price: parseFloat(goods.price),
        stock: parseInt(goods.stock),
        image: goods.image || 'https://via.placeholder.com/300x300.png',
        status: 'online'
      });
    }

    if (result.success) {
      this.setData({
        showEditModal: false
      });

      this.loadGoodsList();

      wx.showToast({
        title: goods.id ? '更新成功' : '添加成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      });
    }
  },

  /**
   * 退出登录
   */
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出管理员模式吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.isAdmin = false;

          wx.redirectTo({
            url: '../login/login'
          });
        }
      }
    });
  }
})