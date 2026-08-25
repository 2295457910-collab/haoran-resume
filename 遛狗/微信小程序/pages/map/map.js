// pages/map/map.js
const app = getApp();

Page({
  data: {
    userLocation: {
      latitude: 39.9042,
      longitude: 116.4074
    },
    markers: [],
    selectedUser: null,
    showUserCard: false,
    showFilter: false,
    showMapGuide: false,
    isWalking: false,
    distanceFilter: 'all',
    timeFilter: 'all',
    nearbyUsers: [],
    filteredUsers: []
  },

  onLoad() {
    console.log('地图页面加载');
    this.initPage();
  },

  onShow() {
    this.refreshData();
    
    // 恢复遛狗状态
    const isWalking = wx.getStorageSync('isWalking') || false;
    this.setData({ isWalking });
    if (isWalking) {
      this.addUserToMap();
    }
    
    // 检查是否需要显示地图引导
    if (app.shouldShowGuide('map')) {
      setTimeout(() => {
        this.setData({ showMapGuide: true });
      }, 1000); // 延迟显示，等地图加载完成
    }
  },

  // 初始化页面
  initPage() {
    this.getUserLocation();
    this.loadNearbyUsers();
  },

  // 获取用户位置
  getUserLocation() {
    const that = this;
    
    // 先检查权限状态
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          // 已授权，直接获取位置
          that.getLocationData();
        } else {
          // 未授权，请求授权
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.getLocationData();
            },
            fail() {
              that.showLocationPermissionDialog();
            }
          });
        }
      },
      fail() {
        that.useDefaultLocation();
      }
    });
  },

  // 获取位置数据
  getLocationData() {
    const that = this;
    
    wx.showLoading({
      title: '正在定位...',
      mask: true
    });

    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 10000,
      success(res) {
        console.log('位置获取成功:', res);
        wx.hideLoading();
        
        that.setData({
          userLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        
        // 基于真实位置重新生成附近用户
        that.generateNearbyUsersAroundLocation(res.latitude, res.longitude);
        that.updateMarkers();
        
        // 保存位置到本地存储
        wx.setStorageSync('lastKnownLocation', {
          latitude: res.latitude,
          longitude: res.longitude,
          timestamp: Date.now(),
          accuracy: res.accuracy
        });
        
        wx.showToast({
          title: `定位成功 (精度${Math.round(res.accuracy)}m)`,
          icon: 'success',
          duration: 2000
        });
      },
      fail(err) {
        console.error('位置获取失败:', err);
        wx.hideLoading();
        
        // 尝试使用缓存位置
        const lastLocation = wx.getStorageSync('lastKnownLocation');
        if (lastLocation && (Date.now() - lastLocation.timestamp < 30 * 60 * 1000)) {
          // 使用30分钟内的缓存位置
          that.setData({
            userLocation: {
              latitude: lastLocation.latitude,
              longitude: lastLocation.longitude
            }
          });
          that.generateNearbyUsersAroundLocation(lastLocation.latitude, lastLocation.longitude);
          that.updateMarkers();
          
          wx.showToast({
            title: '使用缓存位置',
            icon: 'none'
          });
        } else {
          that.showLocationErrorDialog(err);
        }
      }
    });
  },

  // 显示位置权限对话框
  showLocationPermissionDialog() {
    const that = this;
    wx.showModal({
      title: '需要位置权限',
      content: '为了为您推荐附近的遛狗用户，需要获取您的位置信息。请点击"去设置"开启位置权限。',
      confirmText: '去设置',
      cancelText: '使用默认',
      success(res) {
        if (res.confirm) {
          wx.openSetting({
            success(settingRes) {
              if (settingRes.authSetting['scope.userLocation']) {
                that.getLocationData();
              } else {
                that.useDefaultLocation();
              }
            },
            fail() {
              that.useDefaultLocation();
            }
          });
        } else {
          that.useDefaultLocation();
        }
      }
    });
  },

  // 显示定位错误对话框
  showLocationErrorDialog(err) {
    const that = this;
    let errorMsg = '定位失败，请检查网络连接和GPS设置';
    
    if (err.errMsg && err.errMsg.includes('auth')) {
      errorMsg = '位置权限被拒绝，请在设置中开启位置权限';
    } else if (err.errMsg && err.errMsg.includes('timeout')) {
      errorMsg = '定位超时，请检查GPS信号';
    }
    
    wx.showModal({
      title: '定位失败',
      content: errorMsg + '\n\n是否使用默认位置（北京）？',
      confirmText: '使用默认',
      cancelText: '重试',
      success(res) {
        if (res.confirm) {
          that.useDefaultLocation();
        } else {
          that.getUserLocation();
        }
      }
    });
  },

  // 使用默认位置
  useDefaultLocation() {
    const defaultLocation = {
      latitude: 39.9042,
      longitude: 116.4074
    };
    
    this.setData({
      userLocation: defaultLocation
    });
    
    this.generateNearbyUsersAroundLocation(defaultLocation.latitude, defaultLocation.longitude);
    this.updateMarkers();
    
    wx.showToast({
      title: '使用默认位置(北京)',
      icon: 'none',
      duration: 2000
    });
  },

  // 基于真实位置生成附近用户
  generateNearbyUsersAroundLocation(centerLat, centerLng) {
    const users = app.createSampleNearbyUsers(centerLat, centerLng).map((user) => ({
      ...user,
      distance: user.distance,
      distanceValue: user.distanceValue,
      lastActiveMinutes: user.lastActiveMinutes,
      isOnline: user.isOnline,
      walkingSchedule: user.walkWindow
    }));

    app.globalData.nearbyUsers = users;
    app.globalData.meetups = app.createSampleMeetups(users);
    app.globalData.chatSessions = app.createSampleChats(users);
    this.setData({
      nearbyUsers: users,
      filteredUsers: users
    });
  },

  // 加载附近用户
  loadNearbyUsers() {
    const nearbyUsers = app.globalData.nearbyUsers;
    this.setData({
      nearbyUsers: nearbyUsers,
      filteredUsers: nearbyUsers
    });
    this.updateMarkers();
  },

  // 更新地图标记
  updateMarkers() {
    const markers = this.data.filteredUsers.map((user, index) => ({
      id: user.id,
      latitude: user.latitude,
      longitude: user.longitude,
      width: 30,
      height: 30,
      callout: {
        content: `${user.name}｜${user.breed}`,
        fontSize: 12,
        borderRadius: 6,
        bgColor: '#ffffff',
        padding: 10,
        display: 'ALWAYS'
      },
      label: {
        content: user.distance,
        color: '#2563eb',
        fontSize: 10,
        borderRadius: 4,
        bgColor: '#e0f2fe',
        padding: 4
      }
    }));

    this.setData({ markers });
  },

  // 标记点击事件
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const user = this.data.filteredUsers.find(u => u.id === markerId);
    
    if (user) {
      this.setData({
        selectedUser: user,
        showUserCard: true
      });
    }
  },

  // 地图区域改变
  onRegionChange(e) {
    if (e.type === 'end') {
      console.log('地图区域改变:', e.detail);
    }
  },

  // 定位到用户位置
  centerToUser() {
    const mapCtx = wx.createMapContext('map', this);
    mapCtx.moveToLocation({
      success: () => {
        wx.showToast({
          title: '已定位到当前位置',
          icon: 'success'
        });
      }
    });
  },

  // 切换地图类型
  toggleMapType() {
    wx.showActionSheet({
      itemList: ['标准地图', '卫星地图', '混合地图'],
      success: (res) => {
        const types = ['standard', 'satellite', 'hybrid'];
        const selectedType = types[res.tapIndex];
        
        // 这里可以根据需要实现地图类型切换
        wx.showToast({
          title: `已切换到${['标准', '卫星', '混合'][res.tapIndex]}地图`,
          icon: 'success'
        });
      }
    });
  },

  // 显示筛选面板
  showFilter() {
    this.setData({ showFilter: true });
  },

  // 隐藏筛选面板
  hideFilter() {
    this.setData({ showFilter: false });
  },

  // 隐藏用户卡片
  hideUserCard() {
    this.setData({ 
      showUserCard: false,
      selectedUser: null 
    });
  },

  // 隐藏所有面板
  hideAllPanels() {
    this.setData({
      showUserCard: false,
      showFilter: false,
      selectedUser: null
    });
  },

  // 设置距离筛选
  setDistanceFilter(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ distanceFilter: value });
  },

  // 设置时间筛选
  setTimeFilter(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ timeFilter: value });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      distanceFilter: 'all',
      timeFilter: 'all',
      filteredUsers: this.data.nearbyUsers,
      showFilter: false
    });

    this.updateMarkers();
  },

  // 应用筛选
  applyFilter() {
    const { nearbyUsers, distanceFilter, timeFilter } = this.data;
    let filteredUsers = [...nearbyUsers];

    // 距离筛选
    if (distanceFilter !== 'all') {
      const maxDistance = parseInt(distanceFilter, 10);
      filteredUsers = filteredUsers.filter(user => {
        const distance = user.distanceValue || 0;
        return distance <= maxDistance;
      });
    }

    // 时间筛选
    if (timeFilter !== 'all') {
      if (timeFilter === 'recent') {
        filteredUsers = filteredUsers.filter(user => 
          typeof user.lastActiveMinutes === 'number' && user.lastActiveMinutes <= 30
        );
      } else if (timeFilter === 'online') {
        filteredUsers = filteredUsers.filter(user => 
          !!user.isOnline
        );
      }
    }

    this.setData({
      filteredUsers,
      showFilter: false
    });

    if (this.data.selectedUser && !filteredUsers.some(user => user.id === this.data.selectedUser.id)) {
      this.hideUserCard();
    }

    this.updateMarkers();

    wx.showToast({
      title: `找到${filteredUsers.length}个用户`,
      icon: 'success'
    });
    },

  // 开始聊天
  startChat() {
    const user = this.data.selectedUser;
    if (!user) return;

    wx.navigateTo({
      url: `/pages/chat/chat?userId=${user.id}&userName=${user.name}&userAvatar=${user.avatar}`
    });
  },

  // 创建约遛狗
  createMeetup() {
    const user = this.data.selectedUser;
    if (!user) return;

    wx.navigateTo({
      url: `/pages/meetup/meetup?userId=${user.id}&userName=${user.name}&userAvatar=${user.avatar}`
    });
  },

  // 刷新数据
  refreshData() {
    this.loadNearbyUsers();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 引导完成处理
  onGuideComplete(e) {
    console.log('地图引导完成:', e.detail);
    this.setData({ showMapGuide: false });
  },

  // 切换遛狗状态
  toggleWalking() {
    const isWalking = !this.data.isWalking;
    
    if (isWalking) {
      // 开始遛狗
      this.startWalking();
    } else {
      // 结束遛狗
      this.stopWalking();
    }
    
    this.setData({ isWalking });
  },

  // 开始遛狗
  startWalking() {
    // 检查用户信息是否完善
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (!userInfo.name || !userInfo.petBreed) {
      wx.showModal({
        title: '完善资料',
        content: '开始遛狗前，请先完善您的个人资料和宠物信息，这样其他狗友更容易认识您！',
        confirmText: '去完善',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/profile/profile'
            });
          }
        }
      });
      return;
    }

    // 将用户添加到地图标记点
    this.addUserToMap();
    
    wx.showToast({
      title: '开始遛狗，祝您愉快！',
      icon: 'success'
    });

    // 保存遛狗状态
    wx.setStorageSync('isWalking', true);
    wx.setStorageSync('walkingStartTime', Date.now());
  },

  // 结束遛狗
  stopWalking() {
    // 从地图移除用户标记
    this.removeUserFromMap();
    
    wx.showToast({
      title: '遛狗结束，期待下次！',
      icon: 'success'
    });

    // 清除遛狗状态
    wx.removeStorageSync('isWalking');
    wx.removeStorageSync('walkingStartTime');
  },

  // 将用户添加到地图标记点
  addUserToMap() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const userLocation = this.data.userLocation;
    
    const userMarker = {
      id: 'user',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      iconPath: userInfo.avatar || '/images/default-avatar.png',
      width: 60,
      height: 60,
      callout: {
        content: userInfo.name || '遛狗达人',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#ffffff',
        padding: 8,
        display: 'ALWAYS'
      }
    };

    const markers = [...this.data.markers, userMarker];
    this.setData({ markers });
  },

  // 从地图移除用户标记
  removeUserFromMap() {
    const markers = this.data.markers.filter(marker => marker.id !== 'user');
    this.setData({ markers });
  }
}); 