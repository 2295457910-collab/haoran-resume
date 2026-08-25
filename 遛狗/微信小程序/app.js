// app.js
App({
  globalData: {
    userInfo: null,
    userLocation: null,
    nearbyUsers: [],
    meetups: [],
    chatSessions: [],
    hasUserInfo: false,
    // 新用户引导标记
    isFirstTime: true,
    guideStatus: {
      profile: false,    // 个人资料引导
      map: false,        // 地图功能引导
      meetup: false      // 约遛狗引导
    }
  },

  onLaunch() {
    console.log('PawMate遛狗社交小程序启动');
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 获取用户位置
    this.getUserLocation();
    
    // 初始化数据
    this.initData();
    
    // 检查首次使用
    this.checkFirstTime();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('userToken');
    if (token) {
      this.globalData.hasUserInfo = true;
    }
  },

  // 获取用户位置
  getUserLocation() {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.globalData.userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        console.log('用户位置获取成功:', res);
      },
      fail(err) {
        console.error('位置获取失败:', err);
        wx.showToast({
          title: '位置获取失败',
          icon: 'none'
        });
      }
    });
  },

  // 初始化数据
  initData() {
    const defaultLocation = {
      latitude: 39.9042,
      longitude: 116.4074
    };

    const nearbyUsers = this.createSampleNearbyUsers(
      defaultLocation.latitude,
      defaultLocation.longitude
    );

    this.globalData.nearbyUsers = nearbyUsers;
    this.globalData.meetups = this.createSampleMeetups(nearbyUsers);
    this.globalData.chatSessions = this.createSampleChats(nearbyUsers);
  },

  // 检查首次使用
  checkFirstTime() {
    try {
      const hasUsedBefore = wx.getStorageSync('hasUsedBefore');
      const guideStatus = wx.getStorageSync('guideStatus') || {};
      
      this.globalData.isFirstTime = !hasUsedBefore;
      this.globalData.guideStatus = {
        profile: guideStatus.profile || false,
        map: guideStatus.map || false,
        meetup: guideStatus.meetup || false
      };
      
      console.log('首次使用检查:', this.globalData.isFirstTime);
    } catch (error) {
      console.error('检查首次使用状态失败:', error);
    }
  },

  // 标记已使用
  markAsUsed() {
    try {
      wx.setStorageSync('hasUsedBefore', true);
      this.globalData.isFirstTime = false;
    } catch (error) {
      console.error('标记使用状态失败:', error);
    }
  },

  // 完成引导
  completeGuide(guideType) {
    try {
      this.globalData.guideStatus[guideType] = true;
      wx.setStorageSync('guideStatus', this.globalData.guideStatus);
      
      // 如果所有引导都完成了，标记为已使用
      const allCompleted = Object.values(this.globalData.guideStatus).every(status => status);
      if (allCompleted) {
        this.markAsUsed();
      }
    } catch (error) {
      console.error('完成引导失败:', error);
    }
  },

  // 检查是否需要显示引导
  shouldShowGuide(guideType) {
    return this.globalData.isFirstTime && !this.globalData.guideStatus[guideType];
  },

  // 工具函数
  utils: {
    formatTime(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();

      return `${[year, month, day].map(this.formatNumber).join('/')} ${[hour, minute, second].map(this.formatNumber).join(':')}`;
    },

    formatNumber(n) {
      n = n.toString();
      return n[1] ? n : `0${n}`;
    },

    showToast(title, icon = 'none') {
      wx.showToast({
        title,
        icon,
        duration: 2000
      });
    }
  },

  createSampleNearbyUsers(centerLat, centerLng) {
    const baseUsers = [
      {
        id: 'latte',
        name: '拿铁',
        owner: '王珊',
        avatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=200&h=200&q=80',
        breed: '柴犬',
        age: '2岁',
        gender: '母',
        weight: '9kg',
        tags: ['亲人', '热爱晨跑', '飞盘高手'],
        highlight: '刚完成朝阳公园 3 公里晨跑',
        status: '活力满满地在草坪放风，等着和新伙伴打招呼。',
        walkWindow: '早上 06:30 - 07:30',
        favoriteRoute: '朝阳公园环湖绿道',
        lastActive: '刚刚',
        lastActiveMinutes: 2,
        isOnline: true,
        relationship: 'friend',
        walkStats: { duration: '45分钟', distance: '3.1公里', pace: '14′30"' },
        offsetLat: 0.00092,
        offsetLng: 0.00045
      },
      {
        id: 'doudou',
        name: '豆豆',
        owner: '刘洋',
        avatar: 'https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=200&h=200&q=80',
        breed: '柯基',
        age: '3岁',
        gender: '公',
        weight: '11kg',
        tags: ['短腿冲锋', '对球绝不松口', '社交达人'],
        highlight: '准备出发去亮马河追飞盘',
        status: '已经热身完毕，等伙伴凑齐一起出发。',
        walkWindow: '下午 16:30 - 18:00',
        favoriteRoute: '亮马河绿道',
        lastActive: '10分钟前',
        lastActiveMinutes: 10,
        isOnline: true,
        relationship: 'friend',
        walkStats: { duration: '60分钟', distance: '2.4公里', pace: '25′00"' },
        offsetLat: -0.00065,
        offsetLng: 0.00088
      },
      {
        id: 'mango',
        name: '芒果',
        owner: '陈晨',
        avatar: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=200&h=200&q=80',
        breed: '金毛',
        age: '4岁',
        gender: '母',
        weight: '26kg',
        tags: ['耐力王', '水系选手', '幼犬导师'],
        highlight: '今天练习了 20 分钟的水边取物',
        status: '现在在湖边做放松拉伸，欢迎加入。',
        walkWindow: '傍晚 18:00 - 19:30',
        favoriteRoute: '奥森南园慢跑道',
        lastActive: '35分钟前',
        lastActiveMinutes: 35,
        isOnline: false,
        relationship: 'friend',
        walkStats: { duration: '55分钟', distance: '4.3公里', pace: '12′45"' },
        offsetLat: 0.00135,
        offsetLng: -0.00072
      },
      {
        id: 'luna',
        name: '露娜',
        owner: '赵露',
        avatar: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=200&h=200&q=80',
        breed: '边牧',
        age: '1岁半',
        gender: '母',
        weight: '16kg',
        tags: ['超强服从', '敏捷训练', '新搬来'],
        highlight: '刚加入社区，正在熟悉周边路线',
        status: '对新伙伴很友好，正在寻找晨跑搭子。',
        walkWindow: '早上 07:00 - 08:00',
        favoriteRoute: '团结湖慢跑圈',
        lastActive: '8分钟前',
        lastActiveMinutes: 8,
        isOnline: true,
        relationship: 'requested',
        requestMessage: '明早想一起跑 2 公里认识一下吗？',
        requestTime: '8分钟前',
        walkStats: { duration: '30分钟', distance: '2.8公里', pace: '10′45"' },
        offsetLat: -0.00098,
        offsetLng: -0.00054
      },
      {
        id: 'oreo',
        name: '奥利奥',
        owner: '李雷',
        avatar: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=200&h=200&q=80',
        breed: '法斗',
        age: '1岁3个月',
        gender: '公',
        weight: '12kg',
        tags: ['慢热', '怕热', '喜欢晒太阳'],
        highlight: '昨天刚做完体检，状态稳定',
        status: '喜欢慢走+晒太阳，晚上更活跃。',
        walkWindow: '晚上 20:00 - 21:00',
        favoriteRoute: '国贸三期屋顶花园',
        lastActive: '1小时前',
        lastActiveMinutes: 60,
        isOnline: false,
        relationship: 'new',
        walkStats: { duration: '35分钟', distance: '1.2公里', pace: '29′10"' },
        offsetLat: 0.0011,
        offsetLng: 0.00126
      },
      {
        id: 'pudding',
        name: '布丁',
        owner: '周琪',
        avatar: 'https://images.unsplash.com/photo-1545243424-0ce743321e11?auto=format&fit=crop&w=200&h=200&q=80',
        breed: '泰迪',
        age: '5岁',
        gender: '母',
        weight: '6kg',
        tags: ['小体型', '粘人', '擅长室内游戏'],
        highlight: '刚学会在草坪上玩寻宝游戏',
        status: '更喜欢轻松散步，目前在国贸附近陪主人办公。',
        walkWindow: '午休 12:30 - 13:15',
        favoriteRoute: '三里屯南街口袋公园',
        lastActive: '2小时前',
        lastActiveMinutes: 120,
        isOnline: false,
        relationship: 'new',
        walkStats: { duration: '25分钟', distance: '0.9公里', pace: '27′45"' },
        offsetLat: -0.00128,
        offsetLng: 0.00148
      }
    ];

    return baseUsers.map((user) => {
      const latitude = Number((centerLat + user.offsetLat).toFixed(6));
      const longitude = Number((centerLng + user.offsetLng).toFixed(6));
      const distanceValue = this.calculateDistanceMeters(centerLat, centerLng, latitude, longitude);

      return {
        ...user,
        latitude,
        longitude,
        distanceValue,
        distance: this.formatDistance(distanceValue)
      };
    });
  },

  calculateDistanceMeters(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  formatDistance(distance) {
    if (distance < 1000) {
      return `${distance}米`;
    }
    return `${(distance / 1000).toFixed(1)}公里`;
  },

  createSampleMeetups(nearbyUsers = []) {
    if (!nearbyUsers.length) {
      return [];
    }

    const getUser = (id) => nearbyUsers.find((user) => user.id === id) || {};

    const latte = getUser('latte');
    const doudou = getUser('doudou');
    const mango = getUser('mango');

    const now = Date.now();

    return [
      {
        id: 'meetup_001',
        type: 'received',
        targetUser: latte.name,
        targetOwner: `${latte.owner}｜${latte.breed} ${latte.age}`,
        targetAvatar: latte.avatar,
        date: '今天',
        time: '17:30',
        location: '朝阳公园 北门草坪',
        note: '今晚风不大，想约个飞盘热身，你们方便吗？',
        status: 'pending',
        createdAt: '15分钟前',
        createdAtTs: now - 15 * 60 * 1000
      },
      {
        id: 'meetup_002',
        type: 'sent',
        targetUser: doudou.name,
        targetOwner: `${doudou.owner}｜${doudou.breed} ${doudou.age}`,
        targetAvatar: doudou.avatar,
        date: '明天',
        time: '07:00',
        location: '亮马河 风筝草坪',
        note: '想一起跑两圈，顺便测试新买的牵引绳。',
        status: 'accepted',
        createdAt: '昨天 21:18',
        createdAtTs: now - 15 * 60 * 60 * 1000
      },
      {
        id: 'meetup_003',
        type: 'received',
        targetUser: mango.name,
        targetOwner: `${mango.owner}｜${mango.breed} ${mango.age}`,
        targetAvatar: mango.avatar,
        date: '周六',
        time: '09:30',
        location: '国家奥林匹克森林公园 南园入口',
        note: '金毛团周末聚会，一起参加吗？',
        status: 'pending',
        createdAt: '2小时前',
        createdAtTs: now - 2 * 60 * 60 * 1000
      }
    ];
  },

  createSampleChats(nearbyUsers = []) {
    if (!nearbyUsers.length) {
      return [];
    }

    const getUser = (id) => nearbyUsers.find((user) => user.id === id) || {};

    const doudou = getUser('doudou');
    const latte = getUser('latte');
    const luna = getUser('luna');

    return [
      {
        id: 'chat_001',
        name: `${doudou.owner} · ${doudou.name}`,
        avatar: doudou.avatar,
        lastMessage: '今晚 7 点见面前要不要先做拉伸？',
        lastTime: '20:45',
        unreadCount: 2,
        updatedAt: Date.now() - 40 * 60 * 1000
      },
      {
        id: 'chat_002',
        name: `${latte.owner} · ${latte.name}`,
        avatar: latte.avatar,
        lastMessage: '我带了新的飞盘，明天见！',
        lastTime: '昨天',
        unreadCount: 0,
        updatedAt: Date.now() - 20 * 60 * 60 * 1000
      },
      {
        id: 'chat_003',
        name: `${luna.owner} · ${luna.name}`,
        avatar: luna.avatar,
        lastMessage: '新搬来的邻居，想约周末一起探路。',
        lastTime: '周二',
        unreadCount: 1,
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
      }
    ];
  }
});
