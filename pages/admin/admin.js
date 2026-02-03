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
  loadGoodsList: async function() {
    wx.showLoading({
      title: '加载中...'
    });

    try {
      const goodsList = await getGoodsList();
      this.setData({
        goodsList: goodsList
      });
    } catch (error) {
      console.error('加载商品列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
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
  deleteGoods: async function(e) {
    const goodsId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？此操作不可恢复',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          });

          try {
            const result = await deleteGoods(goodsId);

            if (result.success) {
              await this.loadGoodsList();
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: result.message || '删除失败',
                icon: 'error'
              });
            }
          } catch (error) {
            console.error('删除商品失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  /**
   * 上架/下架商品
   */
  toggleStatus: async function(e) {
    const goodsId = e.currentTarget.dataset.id;

    wx.showLoading({
      title: '处理中...'
    });

    try {
      const result = await toggleGoodsStatus(goodsId);

      if (result.success) {
        await this.loadGoodsList();
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
    } catch (error) {
      console.error('切换商品状态失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
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
  saveGoods: async function() {
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

    wx.showLoading({
      title: goods.id ? '更新中...' : '添加中...'
    });

    try {
      let result;
      if (goods.id) {
        // 更新现有商品
        result = await updateGoods(goods);
      } else {
        // 添加新商品
        result = await addGoods({
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

        await this.loadGoodsList();

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
    } catch (error) {
      console.error('保存商品失败:', error);
      wx.showToast({
        title: goods.id ? '更新失败' : '添加失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
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