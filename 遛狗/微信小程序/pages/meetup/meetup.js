const app = getApp();

Page({
  data: {
    targetUser: {},
    selectedDate: '',
    selectedTime: '',
    selectedQuickTime: '',
    selectedLocation: '',
    customLocation: '',
    note: '',
    today: '',
    maxDate: '',
    canSubmit: false,
    locationText: '请选择地点'
  },

  onLoad(options) {
    console.log('约遛狗页面加载:', options);
    
    // 获取目标用户信息
    const targetUser = {
      id: options.userId,
      name: decodeURIComponent(options.userName || ''),
      owner: decodeURIComponent(options.userOwner || ''),
      avatar: decodeURIComponent(options.userAvatar || '')
    };

    // 设置日期范围
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // 最多可选择30天后

    this.setData({
      targetUser,
      today: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    });
  },

  onShow() {
    this.checkCanSubmit();
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      selectedTime: e.detail.value,
      selectedQuickTime: '' // 清除快捷时间选择
    });
    this.checkCanSubmit();
  },

  // 快捷时间选择
  selectQuickTime(e) {
    const time = e.currentTarget.dataset.time;
    const timeMap = {
      morning: '09:00',
      afternoon: '15:00',
      evening: '18:00'
    };

    this.setData({
      selectedQuickTime: time,
      selectedTime: timeMap[time]
    });
    this.checkCanSubmit();
  },

  // 地点选择
  selectLocation(e) {
    const location = e.currentTarget.dataset.location;
    const locationText = this.getLocationText(location);
    this.setData({
      selectedLocation: location,
      customLocation: location === 'other' ? this.data.customLocation : '',
      locationText: locationText
    });
    this.checkCanSubmit();
  },

  // 自定义地点输入
  onLocationInput(e) {
    this.setData({
      customLocation: e.detail.value,
      locationText: e.detail.value || '其他地点'
    });
    this.checkCanSubmit();
  },

  // 快捷备注选择
  selectQuickNote(e) {
    const note = e.currentTarget.dataset.note;
    const currentNote = this.data.note;
    const newNote = currentNote ? `${currentNote} ${note}` : note;
    
    this.setData({
      note: newNote.substring(0, 200) // 限制200字符
    });
  },

  // 备注输入
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    });
  },

  // 获取地点文本
  getLocationText(location = this.data.selectedLocation) {
    const locationMap = {
      park: '附近公园',
      community: '小区周边',
      riverside: '河边步道',
      other: this.data.customLocation || '其他地点'
    };
    return locationMap[location] || '请选择地点';
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { selectedDate, selectedTime, selectedLocation, customLocation } = this.data;
    
    let canSubmit = selectedDate && selectedTime && selectedLocation;
    
    // 如果选择了其他地点，需要填写自定义地点
    if (selectedLocation === 'other') {
      canSubmit = canSubmit && customLocation.trim();
    }

    this.setData({ canSubmit });
  },

  // 发送约遛狗请求
  sendMeetupRequest() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请完善约遛狗信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发送邀请中...'
    });

    // 构造约遛狗数据
    const meetupData = {
      id: Date.now(),
      targetUser: this.data.targetUser.name,
      targetOwner: this.data.targetUser.owner,
      targetAvatar: this.data.targetUser.avatar,
      targetUserId: this.data.targetUser.id,
      date: this.data.selectedDate,
      time: this.data.selectedTime,
      location: this.getLocationText(),
      note: this.data.note,
      status: 'pending',
      type: 'sent',
      createdAt: new Date().toLocaleString()
    };

    // 模拟网络请求
    setTimeout(() => {
      wx.hideLoading();

      // 保存到全局数据
      app.globalData.meetups.push(meetupData);

      // 保存到本地存储
      const storedMeetups = wx.getStorageSync('meetups') || [];
      storedMeetups.push(meetupData);
      wx.setStorageSync('meetups', storedMeetups);

      wx.showModal({
        title: '邀请已发送',
        content: `您的遛狗邀请已发送给 ${this.data.targetUser.name}，请等待对方回复。`,
        showCancel: false,
        success: () => {
          // 跳转到消息页面查看状态
          wx.switchTab({
            url: '/pages/messages/messages'
          });
        }
      });
    }, 1500);
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'PawMate遛狗社交 - 约遛狗',
      path: '/pages/index/index'
    };
  }
}); 