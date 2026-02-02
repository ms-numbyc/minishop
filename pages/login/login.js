/**
 * pages/login/login.js
 * 管理员登录页面
 */

import { adminLogin } from '../../utils/api.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 用户名输入处理
   */
  onUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
  },

  /**
   * 密码输入处理
   */
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  /**
   * 登录按钮点击事件
   */
  onLogin: function() {
    const { username, password } = this.data;
    
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }
    
    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    
    // 执行登录
    const result = adminLogin(username, password);
    
    if (result.success) {
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 设置全局管理员状态
      const app = getApp();
      app.globalData.isAdmin = true;
      
      // 跳转到管理员页面
      setTimeout(() => {
        wx.switchTab({
          url: '../admin/admin'
        });
      }, 1500);
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      });
    }
  }
})