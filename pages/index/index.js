/**
 * pages/index/index.js
 * 商品列表页
 */

import { getGoodsList, seckill } from '../../utils/api.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    countdown: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadGoodsList();
    this.startCountdown();
  },

  /**
   * 加载商品列表
   */
  loadGoodsList: async function() {
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
    }
  },

  /**
   * 开始倒计时
   */
  startCountdown: function() {
    // 模拟抢购时间（每10分钟一次）
    const nextTime = new Date();
    const minutes = Math.floor(nextTime.getMinutes() / 10) * 10 + 10;
    if (minutes >= 60) {
      nextTime.setHours(nextTime.getHours() + 1);
      nextTime.setMinutes(minutes - 60);
    } else {
      nextTime.setMinutes(minutes);
    }
    nextTime.setSeconds(0);
    nextTime.setMilliseconds(0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = nextTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(this.countdownInterval);
        this.setData({ countdown: '抢购进行中...' });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let countdownStr = '';
      if (hours > 0) {
        countdownStr = `${hours}小时${minutes}分钟${seconds}秒`;
      } else {
        countdownStr = `${minutes}分钟${seconds}秒`;
      }

      this.setData({ countdown: countdownStr });
    };

    updateCountdown(); // 立即更新一次
    this.countdownInterval = setInterval(updateCountdown, 1000);
  },

  /**
   * 抢购按钮点击事件
   */
  onSeckillTap: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    const goods = this.data.goodsList.find(item => item.Id === goodsId);
    
    if (!goods) {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      });
      return;
    }

    if (goods.stock <= 0) {
      wx.showToast({
        title: '商品已售罄',
        icon: 'none'
      });
      return;
    }

    // 执行抢购操作
    this.performSeckill(goodsId);
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

        // 更新商品列表 - 可以使用返回的数据或重新加载
        await this.loadGoodsList();
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
  },

  /**
   * 刷新按钮点击事件
   */
  onRefreshTap: async function() {
    wx.showNavigationBarLoading();

    try {
      await this.loadGoodsList();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      });
    } catch (error) {
      console.error('刷新失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
})