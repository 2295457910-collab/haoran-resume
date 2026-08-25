// pages/post/post.js
const app = getApp();

Page({
  data: {
    postType: 'story', // photo, video, story
    postTypeText: '发布动态',
    selectedImages: [],
    selectedVideo: '',
    videoDuration: '',
    contentText: '',
    textPlaceholder: '分享你和萌宠的故事...',
    selectedTags: [],
    customTag: '',
    hotTags: ['可爱', '萌宠', '日常', '搞笑', '温馨', '训练', '健康', '美食', '玩具', '散步'],
    selectedLocation: null,
    privacy: 'public', // public, friends
    canPublish: false
  },

  onLoad(options) {
    console.log('发布页面加载', options);
    
    // 根据传入参数设置发布类型
    if (options.type) {
      this.setPostType(options.type);
    }
    
    // 处理传入的媒体文件
    if (options.images) {
      try {
        const images = JSON.parse(decodeURIComponent(options.images));
        this.setData({ 
          selectedImages: images,
          postType: 'photo',
          postTypeText: '图片分享'
        });
      } catch (e) {
        console.error('解析图片参数失败:', e);
      }
    }
    
    if (options.video) {
      const video = decodeURIComponent(options.video);
      this.setData({ 
        selectedVideo: video,
        postType: 'video',
        postTypeText: '视频分享'
      });
    }
    
    this.updateCanPublish();
  },

  // 设置发布类型
  setPostType(type) {
    const typeMap = {
      photo: { text: '图片分享', placeholder: '记录萌宠的可爱瞬间...' },
      video: { text: '视频分享', placeholder: '分享萌宠的搞笑视频...' },
      story: { text: '发布动态', placeholder: '分享你和萌宠的故事...' }
    };
    
    const config = typeMap[type] || typeMap.story;
    this.setData({
      postType: type,
      postTypeText: config.text,
      textPlaceholder: config.placeholder
    });
  },

  // 返回上一页
  goBack() {
    if (this.hasUnsavedContent()) {
      wx.showModal({
        title: '确认离开',
        content: '你有未保存的内容，确认离开吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 检查是否有未保存内容
  hasUnsavedContent() {
    return this.data.contentText.trim() || 
           this.data.selectedImages.length > 0 || 
           this.data.selectedVideo ||
           this.data.selectedTags.length > 0;
  },

  // 选择媒体文件
  selectMedia() {
    if (this.data.postType === 'photo') {
      this.selectImages();
    } else if (this.data.postType === 'video') {
      this.selectVideo();
    }
  },

  // 选择图片
  selectImages() {
    wx.chooseMedia({
      count: 9 - this.data.selectedImages.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          selectedImages: [...this.data.selectedImages, ...newImages]
        });
        this.updateCanPublish();
      }
    });
  },

  // 选择视频
  selectVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const video = res.tempFiles[0];
        this.setData({
          selectedVideo: video.tempFilePath,
          videoDuration: this.formatDuration(video.duration)
        });
        this.updateCanPublish();
      }
    });
  },

  // 格式化视频时长
  formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  // 添加更多图片
  addMoreImages() {
    this.selectImages();
  },

  // 移除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.selectedImages;
    images.splice(index, 1);
    this.setData({ selectedImages: images });
    this.updateCanPublish();
  },

  // 更换视频
  changeVideo() {
    this.selectVideo();
  },

  // 内容输入
  onContentInput(e) {
    this.setData({ contentText: e.detail.value });
    this.updateCanPublish();
  },

  // 切换标签
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = [...this.data.selectedTags];
    const index = selectedTags.indexOf(tag);
    
    if (index > -1) {
      selectedTags.splice(index, 1);
    } else if (selectedTags.length < 5) {
      selectedTags.push(tag);
    } else {
      wx.showToast({
        title: '最多选择5个标签',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ selectedTags });
  },

  // 标签输入
  onTagInput(e) {
    this.setData({ customTag: e.detail.value });
  },

  // 添加自定义标签
  addCustomTag() {
    const tag = this.data.customTag.trim();
    if (!tag) return;
    
    if (this.data.selectedTags.includes(tag)) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.selectedTags.length >= 5) {
      wx.showToast({
        title: '最多选择5个标签',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedTags: [...this.data.selectedTags, tag],
      customTag: ''
    });
  },

  // 移除标签
  removeTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = this.data.selectedTags.filter(t => t !== tag);
    this.setData({ selectedTags });
  },

  // 选择位置
  selectLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          selectedLocation: {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
        if (err.errMsg.includes('auth')) {
          wx.showModal({
            title: '需要位置权限',
            content: '请在设置中开启位置权限',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },

  // 设置隐私
  setPrivacy(e) {
    const privacy = e.currentTarget.dataset.privacy;
    this.setData({ privacy });
  },

  // 添加表情
  addEmoji() {
    wx.showToast({
      title: '表情功能开发中',
      icon: 'none'
    });
  },

  // 提及用户
  addMention() {
    wx.showToast({
      title: '@功能开发中',
      icon: 'none'
    });
  },

  // 保存草稿
  saveDraft() {
    const draft = {
      type: this.data.postType,
      content: this.data.contentText,
      images: this.data.selectedImages,
      video: this.data.selectedVideo,
      tags: this.data.selectedTags,
      location: this.data.selectedLocation,
      privacy: this.data.privacy,
      timestamp: Date.now()
    };
    
    wx.setStorageSync('postDraft', draft);
    wx.showToast({
      title: '草稿已保存',
      icon: 'success'
    });
  },

  // 更新发布按钮状态
  updateCanPublish() {
    const hasContent = this.data.contentText.trim().length > 0;
    const hasMedia = this.data.selectedImages.length > 0 || this.data.selectedVideo;
    const canPublish = hasContent || hasMedia;
    
    this.setData({ canPublish });
  },

  // 发布动态
  publishPost() {
    if (!this.data.canPublish) {
      wx.showToast({
        title: '请添加内容或媒体',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '发布中...',
      mask: true
    });
    
    // 模拟发布过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 创建新动态
      const newPost = {
        id: Date.now(),
        type: this.data.postType,
        content: this.data.contentText,
        images: this.data.selectedImages,
        video: this.data.selectedVideo,
        tags: this.data.selectedTags,
        location: this.data.selectedLocation,
        privacy: this.data.privacy,
        author: {
          name: '我',
          avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100'
        },
        createTime: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        isLiked: false,
        comments: []
      };
      
      // 根据隐私设置添加到不同的列表
      if (this.data.privacy === 'public') {
        // 添加到公开分享列表
        const publicPosts = wx.getStorageSync('publicPosts') || [];
        publicPosts.unshift(newPost);
        wx.setStorageSync('publicPosts', publicPosts);
      } else {
        // 添加到好友圈列表
        const friendsPosts = wx.getStorageSync('friendsPosts') || [];
        friendsPosts.unshift(newPost);
        wx.setStorageSync('friendsPosts', friendsPosts);
      }
      
      // 清除草稿
      wx.removeStorageSync('postDraft');
      
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });
      
      // 返回对应页面
      setTimeout(() => {
        if (this.data.privacy === 'public') {
          wx.switchTab({
            url: '/pages/share/share'
          });
        } else {
          wx.switchTab({
            url: '/pages/discover/discover'
          });
        }
      }, 1500);
      
    }, 2000);
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'PawMate - 分享萌宠生活',
      path: '/pages/share/share'
    };
  }
}); 