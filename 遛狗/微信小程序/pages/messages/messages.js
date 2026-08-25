// pages/messages/messages.js
const app = getApp();

Page({
  data: {
    activeTab: 'meetups',
    meetupList: [],
    chatList: [],
    meetupCount: 0,
    chatCount: 0,
    pendingMeetupCount: 0,
    unreadChatCount: 0,
    highlightMessage: '',
    refreshing: false
  },

  onLoad() {
    console.log('消息页面加载');
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  loadData() {
    this.loadMeetups();
    this.loadChats();
  },

  // 加载约遛狗消息
  loadMeetups() {
    const meetups = app.globalData.meetups || [];
    const storedMeetups = wx.getStorageSync('meetups') || [];
    
    // 合并全局数据和本地存储的数据
    const allMeetups = [...meetups, ...storedMeetups];
    
    // 去重
    const uniqueMeetups = allMeetups.filter((meetup, index, self) => 
      index === self.findIndex(m => m.id === meetup.id)
    );

    const finalMeetups = uniqueMeetups
      .map((meetup) => ({
        ...meetup,
        createdAtTs: meetup.createdAtTs || Date.now()
      }))
      .sort((a, b) => (b.createdAtTs || 0) - (a.createdAtTs || 0));

    const pendingCount = finalMeetups.filter(meetup => meetup.status === 'pending').length;

    this.setData({
      meetupList: finalMeetups,
      meetupCount: finalMeetups.length,
      pendingMeetupCount: pendingCount
    });

    this.updateHighlightMessage();
  },

  // 加载聊天记录
  loadChats() {
    const globalChats = app.globalData.chatSessions || [];
    const storedChats = wx.getStorageSync('chatSessions') || [];

    const chatMap = new Map();

    [...globalChats, ...storedChats].forEach((chat) => {
      const existing = chatMap.get(chat.id);
      if (!existing || (chat.updatedAt || 0) > (existing.updatedAt || 0)) {
        chatMap.set(chat.id, {
          unreadCount: 0,
          ...chat,
          updatedAt: chat.updatedAt || Date.now()
        });
      }
    });

    const chats = Array.from(chatMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const unreadTotal = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

    this.setData({
      chatList: chats,
      chatCount: chats.length,
      unreadChatCount: unreadTotal
    });

    this.updateHighlightMessage();
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      pending: '待回复',
      accepted: '已同意',
      rejected: '已拒绝',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  },

  // 同意约遛狗
  acceptMeetup(e) {
    const id = e.currentTarget.dataset.id;
    this.updateMeetupStatus(id, 'accepted');
    
    wx.showToast({
      title: '已同意约遛狗',
      icon: 'success'
    });
  },

  // 拒绝约遛狗
  rejectMeetup(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认拒绝',
      content: '确定要拒绝这次约遛狗邀请吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateMeetupStatus(id, 'rejected');
          wx.showToast({
            title: '已拒绝约遛狗',
            icon: 'none'
          });
        }
      }
    });
  },

  // 取消约遛狗
  cancelMeetup(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这次约遛狗邀请吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateMeetupStatus(id, 'cancelled');
          wx.showToast({
            title: '已取消约遛狗',
            icon: 'none'
          });
        }
      }
    });
  },

  // 更新约遛狗状态
  updateMeetupStatus(id, status) {
    const meetupList = this.data.meetupList.map(meetup => {
      if (meetup.id === id) {
        return { ...meetup, status };
      }
      return meetup;
    });

    this.setData({ meetupList });

    // 更新本地存储
    const storedMeetups = wx.getStorageSync('meetups') || [];
    const updatedMeetups = storedMeetups.map(meetup => {
      if (meetup.id === id) {
        return { ...meetup, status };
      }
      return meetup;
    });
    wx.setStorageSync('meetups', updatedMeetups);
  },

  // 查看约遛狗详情
  viewMeetupDetail(e) {
    const id = e.currentTarget.dataset.id;
    const meetup = this.data.meetupList.find(m => m.id === id);
    
    if (meetup) {
      wx.showModal({
        title: '约遛狗详情',
        content: `对象：${meetup.targetUser}\n时间：${meetup.date} ${meetup.time}\n地点：${meetup.location}\n备注：${meetup.note || '无'}`,
        showCancel: false
      });
    }
  },

  // 开始聊天
  startChat(e) {
    const user = e.currentTarget.dataset.user;
    const avatar = e.currentTarget.dataset.avatar;
    
    wx.navigateTo({
      url: `/pages/chat/chat?userName=${encodeURIComponent(user)}&userAvatar=${encodeURIComponent(avatar)}`
    });
  },

  // 进入聊天
  enterChat(e) {
    const user = e.currentTarget.dataset.user;
    wx.navigateTo({
      url: `/pages/chat/chat?userName=${encodeURIComponent(user.name)}&userAvatar=${encodeURIComponent(user.avatar)}`
    });
  },

  // 刷新消息
  refreshMessages() {
    this.setData({ refreshing: true });
    
    setTimeout(() => {
      this.loadData();
      this.setData({ refreshing: false });
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  updateHighlightMessage() {
    const { meetupList, chatList } = this.data;

    const pending = meetupList.find(meetup => meetup.status === 'pending');
    const acceptedMeetups = meetupList
      .filter(meetup => meetup.status === 'accepted')
      .sort((a, b) => (b.createdAtTs || 0) - (a.createdAtTs || 0));
    const unreadChat = chatList.find(chat => (chat.unreadCount || 0) > 0);

    let highlight = '';

    if (pending) {
      const pendingOwner = pending.targetOwner ? pending.targetOwner.split('｜')[0] : pending.targetUser;
      highlight = `${pendingOwner} 正在等待你回复 ${pending.targetUser} 的约遛狗邀请。`;
    } else if (acceptedMeetups.length > 0) {
      const meetup = acceptedMeetups[0];
      highlight = `${meetup.targetUser} 已确认 ${meetup.date} ${meetup.time} 在 ${meetup.location} 见面。`;
    } else if (unreadChat) {
      highlight = `你还有 ${unreadChat.unreadCount} 条来自 ${unreadChat.name} 的未读消息。`;
    } else if (chatList.length > 0) {
      const latestChat = chatList[0];
      highlight = `和 ${latestChat.name} 的聊天刚刚更新，快去看看吧。`;
    } else {
      highlight = '欢迎来到消息中心，随时掌握狗友动态。';
    }

    this.setData({ highlightMessage: highlight });
  },

  // 下拉刷新
  onRefresh() {
    this.refreshMessages();
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'PawMate遛狗社交 - 消息中心',
      path: '/pages/index/index'
    };
  }
}); 