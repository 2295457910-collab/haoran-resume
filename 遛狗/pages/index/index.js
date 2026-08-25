const DEFAULT_LOCATION = {
  latitude: 39.9042,
  longitude: 116.4074
};

Page({
  data: {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    scale: 15,
    currentAddress: '正在获取位置…',
    users: [],
    markers: [],
    selectedUser: {},
    showUserCard: false,
    filterVisible: false,
    filters: {
      distance: 'all',
      size: 'all',
      status: 'all'
    },
    filterOptions: {
      distance: [
        { label: '全部', value: 'all' },
        { label: '200米内', value: '200' },
        { label: '500米内', value: '500' },
        { label: '800米内', value: '800' }
      ],
      size: [
        { label: '全部', value: 'all' },
        { label: '小型犬', value: 'small' },
        { label: '中型犬', value: 'medium' },
        { label: '大型犬', value: 'large' }
      ],
      status: [
        { label: '全部', value: 'all' },
        { label: '活跃中', value: 'active' },
        { label: '刚刚在线', value: 'recent' }
      ]
    }
  },

  onLoad() {
    this.templateUsers = this.createTemplateUsers();
    this.buildUsers(this.data.latitude, this.data.longitude);
    this.getUserLocation();
  },

  onReady() {
    this.mapCtx = wx.createMapContext('map');
  },

  createTemplateUsers() {
    return [
      {
        id: 1,
        name: 'Lucky',
        owner: '张小姐',
        breed: '金毛寻回犬',
        age: '3岁',
        gender: '公',
        personality: '温顺、亲人，喜欢和大型狗一起奔跑',
        avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=200&h=200',
        statusText: '正在公园等待玩伴',
        lastActive: '2分钟前',
        size: 'large',
        status: 'active',
        offsetLat: 0.0012,
        offsetLng: -0.001,
        distanceValue: 150
      },
      {
        id: 2,
        name: 'Max',
        owner: '李先生',
        breed: '柴犬',
        age: '2岁',
        gender: '公',
        personality: '聪明独立，喜欢和主人一起训练',
        avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&h=200',
        statusText: '刚刚结束训练，准备散步',
        lastActive: '5分钟前',
        size: 'medium',
        status: 'recent',
        offsetLat: -0.0008,
        offsetLng: 0.001,
        distanceValue: 320
      },
      {
        id: 3,
        name: 'Bella',
        owner: '王女士',
        breed: '边境牧羊犬',
        age: '1岁半',
        gender: '母',
        personality: '精力旺盛、超级会社交',
        avatar: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=200&h=200',
        statusText: '在小区草坪奔跑',
        lastActive: '刚刚',
        size: 'medium',
        status: 'active',
        offsetLat: 0.0005,
        offsetLng: 0.0015,
        distanceValue: 220
      },
      {
        id: 4,
        name: 'Snow',
        owner: '陈先生',
        breed: '哈士奇',
        age: '2岁半',
        gender: '公',
        personality: '活泼好动，需要大量运动',
        avatar: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=200&h=200',
        statusText: '准备去河边疾跑',
        lastActive: '8分钟前',
        size: 'large',
        status: 'recent',
        offsetLat: -0.001,
        offsetLng: -0.0012,
        distanceValue: 520
      },
      {
        id: 5,
        name: 'Coco',
        owner: '刘女士',
        breed: '泰迪',
        age: '1岁',
        gender: '母',
        personality: '黏人可爱，适合轻松散步',
        avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=200&h=200',
        statusText: '正在咖啡店门口等伙伴',
        lastActive: '10分钟前',
        size: 'small',
        status: 'active',
        offsetLat: 0.0014,
        offsetLng: -0.0002,
        distanceValue: 460
      }
    ];
  },

  buildUsers(baseLat, baseLng) {
    const users = this.templateUsers.map(user => ({
      ...user,
      latitude: Number((baseLat + user.offsetLat).toFixed(6)),
      longitude: Number((baseLng + user.offsetLng).toFixed(6)),
      distance: `${user.distanceValue}米`,
      status: user.status,
      statusText: user.statusText,
      isFriend: Boolean(user.isFriend)
    }));

    this.allUsers = users;
    this.applyFilter(false);
  },

  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        this.setData({
          latitude,
          longitude,
          currentAddress: `位置已更新 · ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
        });
        this.buildUsers(latitude, longitude);
      },
      fail: () => {
        wx.showToast({
          title: '无法获取定位，使用默认位置',
          icon: 'none'
        });
        this.setData({ currentAddress: '北京 · 天安门' });
        this.buildUsers(this.data.latitude, this.data.longitude);
      }
    });
  },

  updateMarkers(users) {
    const markers = users.map(user => ({
      id: user.id,
      latitude: user.latitude,
      longitude: user.longitude,
      iconPath: '/assets/dog-pin.png',
      width: 42,
      height: 42,
      callout: {
        content: `${user.name}\n${user.distance}`,
        display: 'BYCLICK',
        padding: 8,
        borderRadius: 12,
        bgColor: '#ffffff',
        color: '#0f172a',
        fontSize: 12
      }
    }));

    markers.unshift({
      id: 'current',
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      iconPath: '/assets/me-pin.png',
      width: 38,
      height: 38
    });

    this.setData({ markers });
  },

  onMarkerTap(event) {
    const targetId = event.detail.markerId;
    if (targetId === 'current') {
      wx.showToast({ title: '这是你的位置', icon: 'none' });
      return;
    }

    const user = this.data.users.find(item => item.id === targetId);
    if (user) {
      this.setData({
        selectedUser: user,
        showUserCard: true
      });
    }
  },

  toggleFriend() {
    const userId = this.data.selectedUser.id;
    if (!userId) return;

    const nextState = !this.data.selectedUser.isFriend;
    const users = this.data.users.map(user => user.id === userId ? { ...user, isFriend: nextState } : user);
    this.allUsers = this.allUsers.map(user => user.id === userId ? { ...user, isFriend: nextState } : user);

    const selectedUser = { ...this.data.selectedUser, isFriend: nextState };
    this.setData({ users, selectedUser });

    wx.showToast({
      title: nextState ? '已添加为狗友' : '已移除狗友',
      icon: 'success'
    });
  },

  startChat() {
    if (!this.data.selectedUser.id) return;
    wx.showToast({
      title: `已向 ${this.data.selectedUser.name} 发送招呼`,
      icon: 'none'
    });
  },

  createMeetup() {
    if (!this.data.selectedUser.id) return;
    wx.showToast({
      title: `已向 ${this.data.selectedUser.owner} 发出邀约`,
      icon: 'none'
    });
  },

  hideCard() {
    this.setData({ showUserCard: false });
  },

  stopTap() {},

  openFilter() {
    this.setData({ filterVisible: true });
  },

  closeFilter() {
    this.setData({ filterVisible: false });
  },

  selectFilter(event) {
    const { group, value } = event.currentTarget.dataset;
    this.setData({
      filters: {
        ...this.data.filters,
        [group]: value
      }
    });
  },

  resetFilter() {
    this.setData({
      filters: {
        distance: 'all',
        size: 'all',
        status: 'all'
      }
    });
    this.applyFilter(false);
    wx.showToast({ title: '已重置筛选', icon: 'none' });
  },

  applyFilter(closePanel = true) {
    if (!this.allUsers) return;
    const { distance, size, status } = this.data.filters;
    const filtered = this.allUsers.filter(user => {
      if (distance !== 'all' && user.distanceValue > Number(distance)) return false;
      if (size !== 'all' && user.size !== size) return false;
      if (status !== 'all' && user.status !== status) return false;
      return true;
    });

    this.setData({
      users: filtered,
      filterVisible: closePanel ? false : this.data.filterVisible,
      showUserCard: false
    });

    this.updateMarkers(filtered);

    if (closePanel) {
      const message = filtered.length ? `找到 ${filtered.length} 位狗友` : '未找到符合条件的狗友';
      wx.showToast({ title: message, icon: 'none' });
    }
  },

  moveToLocation() {
    if (this.mapCtx) {
      this.mapCtx.moveToLocation();
    }
    this.getUserLocation();
    wx.showToast({ title: '定位到当前位置', icon: 'none' });
  }
});
