// pages/index/index.js
Page({
  data: {},
  
  onLoad() {
    console.log('首页加载');
    // 自动跳转到地图页面
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/map/map'
      });
    }, 1000);
  },

  goToMap() {
    wx.switchTab({
      url: '/pages/map/map'
    });
  }
});
