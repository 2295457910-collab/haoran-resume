// pages/profile/profile.js
Page({
  data: {
    // 用户基本信息
    userInfo: {
      avatar: '/images/default-avatar.png',
      name: '遛狗达人',
      description: '请完善您的个人信息',
      petBreed: '',
      petName: '',
      showPetBreed: true,
      showPetName: true
    },
    
    // 统计数据
    stats: {
      meetupCount: 0,
      friendCount: 0,
      activeDays: 0
    },
    
    // 界面状态
    showEditModal: false,
    showAvatarModal: false,
    showProfileGuide: false,
    
    // 编辑时的临时数据
    editData: {},
    
    // 计算属性
    displayName: '',
    previewDisplayName: ''
  },

  onLoad() {
    console.log('个人中心页面加载');
    this.loadUserData();
    this.updateDisplayName();
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshStats();
    
    // 检查是否需要显示个人资料引导
    const app = getApp();
    if (app.shouldShowGuide('profile')) {
      setTimeout(() => {
        this.setData({ showProfileGuide: true });
      }, 500); // 延迟显示，等页面渲染完成
    }
  },

  // 加载用户数据
  loadUserData() {
    // 从本地存储获取用户数据
    const savedUserInfo = wx.getStorageSync('userInfo');
    if (savedUserInfo) {
      this.setData({ 
        userInfo: { ...this.data.userInfo, ...savedUserInfo }
      });
    }
    this.updateDisplayName();
  },

  // 更新显示名称（参考Boss直聘的展示方式）
  updateDisplayName() {
    const { userInfo } = this.data;
    let displayName = userInfo.name || '遛狗达人';
    
    // 构建显示名称：宠物品种 + 主人昵称
    if (userInfo.showPetBreed && userInfo.petBreed) {
      displayName = `${userInfo.petBreed} · ${displayName}`;
    } else if (userInfo.showPetName && userInfo.petName) {
      displayName = `${userInfo.petName}主人 · ${displayName}`;
    }
    
    this.setData({ displayName });
  },

  // 更新预览显示名称
  updatePreviewDisplayName() {
    const { editData } = this.data;
    let previewName = editData.name || '遛狗达人';
    
    // 构建预览显示名称
    if (editData.showPetBreed && editData.petBreed) {
      previewName = `${editData.petBreed} · ${previewName}`;
    } else if (editData.showPetName && editData.petName) {
      previewName = `${editData.petName}主人 · ${previewName}`;
    }
    
    this.setData({ previewDisplayName: previewName });
  },

  // 刷新统计数据
  refreshStats() {
    // 从本地存储获取约遛狗记录
    const meetups = wx.getStorageSync('meetups') || [];
    const completedMeetups = meetups.filter(m => m.status === 'accepted').length;
    
    this.setData({
      'stats.meetupCount': completedMeetups
    });
  },

  // 编辑个人资料
  editProfile() {
    // 初始化编辑数据
    this.setData({
      editData: { ...this.data.userInfo },
      showEditModal: true
    });
    this.updatePreviewDisplayName();
  },

  // 隐藏编辑弹窗
  hideEditModal() {
    this.setData({ showEditModal: false });
  },

  // 保存个人资料
  saveProfile() {
    const { editData } = this.data;
    
    // 验证必填字段
    if (!editData.name || editData.name.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    // 保存数据
    const newUserInfo = { ...editData };
    this.setData({ 
      userInfo: newUserInfo,
      showEditModal: false
    });
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', newUserInfo);
    
    // 更新显示名称
    this.updateDisplayName();
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 更换头像
  changeAvatar() {
    this.setData({ showAvatarModal: true });
  },

  // 隐藏头像选择弹窗
  hideAvatarModal() {
    this.setData({ showAvatarModal: false });
  },

  // 从相册选择头像
  selectFromAlbum() {
    this.chooseAvatar(['album']);
  },

  // 拍照选择头像
  takePhoto() {
    this.chooseAvatar(['camera']);
  },



  // 选择头像通用方法
  chooseAvatar(sourceType) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: sourceType,
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 压缩图片
        wx.compressImage({
          src: tempFilePath,
          quality: 80,
          success: (compressRes) => {
            this.setData({
              'editData.avatar': compressRes.tempFilePath,
              showAvatarModal: false
            });
          },
          fail: () => {
            // 压缩失败则使用原图
            this.setData({
              'editData.avatar': tempFilePath,
              showAvatarModal: false
            });
          }
        });
      }
    });
  },

  // 输入事件处理
  onNameChange(e) {
    this.setData({ 'editData.name': e.detail.value });
    this.updatePreviewDisplayName();
  },

  onPetBreedChange(e) {
    this.setData({ 'editData.petBreed': e.detail.value });
    this.updatePreviewDisplayName();
  },

  onPetNameChange(e) {
    this.setData({ 'editData.petName': e.detail.value });
    this.updatePreviewDisplayName();
  },

  onDescriptionChange(e) {
    this.setData({ 'editData.description': e.detail.value });
  },

  // 隐私设置切换
  onShowPetBreedChange(e) {
    this.setData({ 'editData.showPetBreed': e.detail.value });
    this.updatePreviewDisplayName();
  },

  onShowPetNameChange(e) {
    this.setData({ 'editData.showPetName': e.detail.value });
    this.updatePreviewDisplayName();
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 引导完成处理
  onGuideComplete(e) {
    console.log('个人资料引导完成:', e.detail);
    this.setData({ showProfileGuide: false });
    
    // 引导用户填写资料
    if (!this.data.userInfo.petBreed && !this.data.userInfo.petName) {
      setTimeout(() => {
        this.editProfile();
      }, 300);
    }
  },

  // 约遛狗记录
  goToMeetupHistory() {
    wx.navigateTo({
      url: '/pages/meetup-history/meetup-history'
    });
  },

  // 遛狗好友
  goToFriends() {
    wx.navigateTo({
      url: '/pages/friends/friends'
    });
  },

  // 发布动态
  goToPost() {
    wx.navigateTo({
      url: '/pages/post/post?type=story'
    });
  },

  // 设置
  goToSettings() {
    wx.showActionSheet({
      itemList: ['隐私设置', '通知设置', '位置设置', '关于我们', '意见反馈'],
      success: (res) => {
        const options = ['隐私设置', '通知设置', '位置设置', '关于我们', '意见反馈'];
        const selected = options[res.tapIndex];
        
        switch (selected) {
          case '隐私设置':
            this.showPrivacySettings();
            break;
          case '通知设置':
            this.showNotificationSettings();
            break;
          case '位置设置':
            this.showLocationSettings();
            break;
          case '关于我们':
            this.showAbout();
            break;
          case '意见反馈':
            this.showFeedback();
            break;
        }
      }
    });
  },

  // 隐私设置
  showPrivacySettings() {
    wx.showModal({
      title: '隐私设置',
      content: '• 个人信息可见性\n• 位置信息共享\n• 遛狗记录隐私\n• 聊天记录管理\n\n您可以在编辑个人资料中设置宠物信息的显示权限',
      showCancel: false
    });
  },

  // 通知设置
  showNotificationSettings() {
    wx.showModal({
      title: '通知设置',
      content: '• 约遛狗邀请通知\n• 消息提醒\n• 系统公告\n• 活动推送',
      showCancel: false
    });
  },

  // 位置设置
  showLocationSettings() {
    wx.showModal({
      title: '位置设置',
      content: '当前位置权限状态：已开启\n\n• 自动定位\n• 位置精度\n• 后台定位\n• 位置历史',
      showCancel: false
    });
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: 'PawMate 遛狗社交',
      content: '版本：v1.1.0\n\n一个专为爱狗人士打造的社交平台，让每一次遛狗都充满乐趣！\n\n• 发现附近遛狗用户\n• 约遛狗功能\n• 分享遛狗动态\n• 遛狗社区交流\n• 个性化资料展示',
      showCancel: false
    });
  },

  // 意见反馈
  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您使用PawMate！\n\n如有任何建议或问题，请通过以下方式联系我们：\n\n• 小程序内反馈\n• 客服微信\n• 邮箱反馈',
      showCancel: false
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserData();
    this.refreshStats();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新完成',
        icon: 'success'
      });
    }, 1000);
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'PawMate遛狗社交 - 让遛狗更有趣',
      path: '/pages/index/index',
      imageUrl: '/images/share-profile.png'
    };
  }
}); 