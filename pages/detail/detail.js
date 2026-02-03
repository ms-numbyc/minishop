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
  loadGoodsDetail: async function(goodsId) {
    wx.showLoading({
      title: '加载中...'
    });

    try {
      const goods = await getGoodsById(goodsId);

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
    } catch (error) {
      console.error('加载商品详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });

      // 返回上一页
      wx.navigateBack();
    } finally {
      wx.hideLoading();
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
  performSeckill: async function(goodsId) {
    wx.showLoading({
      title: '正在抢购...'
    });

    try {
      const result = await seckill(goodsId);

      if (result.success) {
        wx.showToast({
          title: '抢购成功！',
          icon: 'success'
        });

        // 刷新商品详情 - 使用返回的商品数据或重新加载
        if (result.data) {
          this.setData({
            goods: result.data
          });
        } else {
          await this.loadGoodsDetail(goodsId);
        }
      } else {
        wx.showToast({
          title: result.message || '抢购失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('抢购失败:', error);
      wx.showToast({
        title: '抢购失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  }
})