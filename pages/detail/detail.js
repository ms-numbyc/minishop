/**
 * pages/detail/detail.js
 * 商品详情页
 */

import { getGoodsById, seckill } from '../../utils/api.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    goods: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const goodsId = options.id;
    this.loadGoodsDetail(goodsId);
  },

  /**
   * 加载商品详情
   */
  loadGoodsDetail: function(goodsId) {
    const goods = getGoodsById(goodsId);
    
    if (goods) {
      this.setData({
        goods: goods
      });
    } else {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      });
      
      // 返回上一页
      wx.navigateBack();
    }
  },

  /**
   * 抢购按钮点击事件
   */
  onSeckillTap: function() {
    if (!this.data.goods) return;

    if (this.data.goods.stock <= 0) {
      wx.showToast({
        title: '商品已售罄',
        icon: 'none'
      });
      return;
    }

    // 执行抢购操作
    this.performSeckill(this.data.goods.id);
  },

  /**
   * 执行抢购
   */
  performSeckill: function(goodsId) {
    wx.showLoading({
      title: '正在抢购...'
    });

    setTimeout(() => {
      const result = seckill(goodsId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '抢购成功！',
          icon: 'success'
        });

        // 刷新商品详情
        this.loadGoodsDetail(goodsId);
      } else {
        wx.showToast({
          title: result.message || '抢购失败',
          icon: 'none'
        });
      }
    }, 1000);
  }
})