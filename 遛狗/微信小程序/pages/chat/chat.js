// pages/chat/chat.js
const app = getApp();

Page({
  data: {
    // 用户信息
    chatUser: {},
    userInfo: {
      id: 'me',
      name: '我',
      avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100'
    },
    
    // 消息相关
    messages: [],
    inputText: '',
    scrollTop: 0,
    hasMoreMessages: false,
    
    // 表情包相关
    showEmojiPanel: false,
    activeEmojiTab: 'default',
    defaultEmojis: [],
    favoriteEmojis: [],
    
    // 模态框状态
    showMessageActions: false,
    showMoreTools: false,
    selectedMessage: null,
    
    // 聊天室ID
    chatRoomId: '',
    
    // 消息计数器
    messageIdCounter: 1
  },

  onLoad(options) {
    console.log('聊天页面加载:', options);
    
    // 获取聊天对象信息
    const chatUser = {
      id: options.userId || '',
      name: decodeURIComponent(options.userName || ''),
      owner: decodeURIComponent(options.userOwner || ''),
      avatar: decodeURIComponent(options.userAvatar || '')
    };
    
    this.setData({ chatUser });
    
    // 初始化聊天功能
    this.initChat();
  },

  // 初始化聊天
  initChat() {
    this.loadDefaultEmojis();
    this.loadFavoriteEmojis();
    this.generateMockMessages();
  },

  // 加载默认表情包
  loadDefaultEmojis() {
    const defaultEmojis = [
      { id: 1, url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100', name: '开心' },
      { id: 2, url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100', name: '微笑' },
      { id: 3, url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=100&h=100', name: '哈哈' },
      { id: 4, url: 'https://images.unsplash.com/photo-1574293876203-46d0d611eb5b?auto=format&fit=crop&w=100&h=100', name: '爱心' }
    ];
    
    this.setData({ defaultEmojis });
  },

  // 加载收藏表情包
  loadFavoriteEmojis() {
    const favoriteEmojis = wx.getStorageSync('favoriteEmojis') || [];
    this.setData({ favoriteEmojis });
  },

  // 生成模拟消息
  generateMockMessages() {
    // 不添加模拟消息，从空白聊天开始
    this.setData({ messages: [], messageIdCounter: 1 });
  },

  // 发送消息
  sendMessage() {
    const inputText = this.data.inputText.trim();
    if (!inputText) return;
    
    const message = {
      id: this.data.messageIdCounter,
      type: 'text',
      content: inputText,
      fromMe: true,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    const messages = [...this.data.messages, message];
    this.setData({ 
      messages, 
      inputText: '',
      messageIdCounter: this.data.messageIdCounter + 1
    });
    
    // 模拟发送成功
    setTimeout(() => {
      this.updateMessageStatus(message.id, 'sent');
    }, 1000);
  },

  // 更新消息状态
  updateMessageStatus(messageId, status) {
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, status };
      }
      return msg;
    });
    
    this.setData({ messages });
  },

  // 输入文本变化
  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  // 切换表情面板
  toggleEmojiPanel() {
    this.setData({ showEmojiPanel: !this.data.showEmojiPanel });
  },

  // 切换表情标签
  switchEmojiTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeEmojiTab: tab });
  },

  // 发送表情
  sendEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji;
    const message = {
      id: this.data.messageIdCounter,
      type: 'emoji',
      content: emoji.url,
      fromMe: true,
      timestamp: Date.now(),
      status: 'sent'
    };
    
    const messages = [...this.data.messages, message];
    this.setData({ 
      messages,
      messageIdCounter: this.data.messageIdCounter + 1,
      showEmojiPanel: false
    });
  },

  // 删除收藏表情
  removeFavoriteEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji;
    
    // 对自定义表情给出特殊提示
    const isCustomEmoji = emoji.isCustom;
    const title = isCustomEmoji ? '删除自定义表情' : '确认删除';
    const content = isCustomEmoji 
      ? '确定要删除这个自定义表情吗？删除后无法恢复。' 
      : '确定要删除这个收藏表情吗？';
    
    wx.showModal({
      title: title,
      content: content,
      confirmColor: isCustomEmoji ? '#ff4d4f' : '#007AFF',
      success: (res) => {
        if (res.confirm) {
          const favoriteEmojis = this.data.favoriteEmojis.filter(item => item.id !== emoji.id);
          this.setData({ favoriteEmojis });
          wx.setStorageSync('favoriteEmojis', favoriteEmojis);
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 显示消息操作菜单
  showMessageActions(e) {
    const message = e.currentTarget.dataset.message;
    this.setData({ 
      showMessageActions: true,
      selectedMessage: message
    });
  },

  // 隐藏消息操作菜单
  hideMessageActions() {
    this.setData({ 
      showMessageActions: false,
      selectedMessage: null
    });
  },

  // 收藏表情
  favoriteEmoji() {
    const message = this.data.selectedMessage;
    if (message && message.type === 'emoji') {
      const favoriteEmojis = [...this.data.favoriteEmojis];
      const emojiData = {
        id: Date.now(),
        url: message.content,
        name: '收藏表情'
      };
      
      const isExist = favoriteEmojis.some(emoji => emoji.url === emojiData.url);
      if (!isExist) {
        favoriteEmojis.push(emojiData);
        this.setData({ favoriteEmojis });
        wx.setStorageSync('favoriteEmojis', favoriteEmojis);
        
        wx.showToast({
          title: '收藏成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '已收藏过了',
          icon: 'none'
        });
      }
    }
    this.hideMessageActions();
  },

  // 复制消息
  copyMessage() {
    const message = this.data.selectedMessage;
    if (message && message.type === 'text') {
      wx.setClipboardData({
        data: message.content,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    }
    this.hideMessageActions();
  },

  // 删除消息
  deleteMessage() {
    const message = this.data.selectedMessage;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条消息吗？',
      success: (res) => {
        if (res.confirm) {
          const messages = this.data.messages.filter(msg => msg.id !== message.id);
          this.setData({ messages });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
    this.hideMessageActions();
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        const message = {
          id: this.data.messageIdCounter,
          type: 'image',
          content: tempFilePath,
          fromMe: true,
          timestamp: Date.now(),
          status: 'sent'
        };
        
        const messages = [...this.data.messages, message];
        this.setData({ 
          messages,
          messageIdCounter: this.data.messageIdCounter + 1
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      urls: [src],
      current: src
    });
  },

  // 显示更多工具
  showMoreTools() {
    this.setData({ showMoreTools: true });
  },

  // 隐藏更多工具
  hideMoreTools() {
    this.setData({ showMoreTools: false });
  },

  // 发送位置
  sendLocation() {
    wx.chooseLocation({
      success: (res) => {
        const locationText = `📍 ${res.name}\n${res.address}`;
        const message = {
          id: this.data.messageIdCounter,
          type: 'text',
          content: locationText,
          fromMe: true,
          timestamp: Date.now(),
          status: 'sent'
        };
        
        const messages = [...this.data.messages, message];
        this.setData({ 
          messages,
          messageIdCounter: this.data.messageIdCounter + 1
        });
      }
    });
    
    this.hideMoreTools();
  },

  // 邀请约遛狗
  inviteMeetup() {
    wx.navigateTo({
      url: `/pages/meetup/meetup?userId=${this.data.chatUser.id}&userName=${this.data.chatUser.name}&userAvatar=${this.data.chatUser.avatar}`
    });
    this.hideMoreTools();
  },

  // 隐藏所有模态框
  hideAllModals() {
    this.setData({
      showMessageActions: false,
      showMoreTools: false,
      selectedMessage: null
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 显示更多选项
  showMoreOptions() {
    wx.showActionSheet({
      itemList: ['清空聊天记录', '举报用户'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.clearChatHistory();
        }
      }
    });
  },

  // 清空聊天记录
  clearChatHistory() {
    wx.showModal({
      title: '清空聊天记录',
      content: '确定要清空所有聊天记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.showToast({
            title: '已清空聊天记录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 添加自定义表情
  addCustomEmoji() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        let sourceType = [];
        if (res.tapIndex === 0) {
          sourceType = ['album'];
        } else if (res.tapIndex === 1) {
          sourceType = ['camera'];
        }
        
        this.chooseEmojiImage(sourceType);
      }
    });
  },

  // 选择表情图片
  chooseEmojiImage(sourceType) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 使用压缩图片
      sourceType: sourceType,
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 显示图片预览和确认对话框
        this.showEmojiPreview(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 显示表情预览
  showEmojiPreview(imagePath) {
    wx.showModal({
      title: '添加自定义表情',
      content: '确定要将这张图片添加为收藏表情吗？',
      confirmText: '添加',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.saveCustomEmoji(imagePath);
        }
      }
    });
  },

  // 保存自定义表情
  saveCustomEmoji(imagePath) {
    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    // 获取图片信息
    wx.getImageInfo({
      src: imagePath,
      success: (imageInfo) => {
        // 检查图片尺寸，如果太大需要提示用户
        if (imageInfo.width > 500 || imageInfo.height > 500) {
          wx.hideLoading();
          wx.showModal({
            title: '图片尺寸提示',
            content: '图片尺寸较大，建议使用正方形小图片作为表情，是否继续添加？',
            success: (res) => {
              if (res.confirm) {
                this.processAndSaveEmoji(imagePath);
              }
            }
          });
        } else {
          this.processAndSaveEmoji(imagePath);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '图片处理失败',
          icon: 'none'
        });
      }
    });
  },

  // 处理并保存表情
  processAndSaveEmoji(imagePath) {
    // 由于小程序的限制，我们直接使用临时图片路径
    // 在真实应用中，应该上传到服务器获取永久URL
    
    const favoriteEmojis = [...this.data.favoriteEmojis];
    const newEmoji = {
      id: Date.now(),
      url: imagePath,
      name: '自定义表情',
      isCustom: true, // 标记为自定义表情
      createTime: Date.now()
    };
    
    // 添加到收藏表情列表
    favoriteEmojis.unshift(newEmoji); // 添加到开头
    
    // 限制自定义表情数量，避免占用过多存储空间
    if (favoriteEmojis.length > 50) {
      favoriteEmojis.pop(); // 删除最后一个
      wx.showToast({
        title: '表情数量已达上限，已删除最早的表情',
        icon: 'none',
        duration: 3000
      });
    }
    
    this.setData({ favoriteEmojis });
    wx.setStorageSync('favoriteEmojis', favoriteEmojis);
    
    wx.hideLoading();
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
    
    // 自动切换到收藏表情标签
    this.setData({ activeEmojiTab: 'favorite' });
  },
}); 