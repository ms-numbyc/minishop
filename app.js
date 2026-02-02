// app.js
App({
  onLaunch: function () {

  },
  globalData: {
    userInfo: null,
    isAdmin: false // 管理员状态
  },

  // 检查是否为管理员
  checkAdmin: function() {
    return this.globalData.isAdmin;
  }
})