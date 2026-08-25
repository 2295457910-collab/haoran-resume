// pages/friends/friends.js
const app = getApp();

Page({
  data: {
    activeTab: 'friends',
    showSearchBar: false,
    searchKeyword: '',
    refreshing: false,
    
    // 好友列表
    friendsList: [],
    displayFriends: [],
    
    // 好友申请列表
    requestsList: [],
    
    // 附近的人列表
    nearbyPeople: [],
    
    // 弹窗相关
    showActionsModal: false,
    selectedFriend: {}
  },

  onLoad() {
    console.log('好友页面加载');
    this.initData();
  },

  onShow() {
    this.refreshData();
  },

  // 初始化数据
  initData() {
    this.loadFriendsList();
    this.loadRequestsList();
    this.loadNearbyPeople();
  },

  // 加载好友列表
  loadFriendsList() {
    // 从本地存储或全局数据获取好友列表
    const friends = this.generateMockFriends();
    this.setData({
      friendsList: friends,
      displayFriends: friends
    });
  },

  // 生成模拟好友数据
  generateMockFriends() {
    const nearbyUsers = app.globalData.nearbyUsers || [];

    const friends = nearbyUsers
      .filter(user => user.relationship === 'friend')
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        petInfo: `${user.breed}｜${user.age}`,
        owner: user.owner,
        lastActive: user.lastActive,
        distance: user.distance,
        isOnline: user.isOnline,
        tags: user.tags,
        status: user.status,
        walkWindow: user.walkWindow
      }));

    return friends;
  },

  // 加载好友申请列表
  loadRequestsList() {
    const nearbyUsers = app.globalData.nearbyUsers || [];

    const requests = nearbyUsers
      .filter(user => user.relationship === 'requested')
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        petInfo: `${user.breed}｜${user.age}`,
        message: user.requestMessage || '想和你们成为遛狗搭档',
        requestTime: user.requestTime || '刚刚',
        tags: user.tags
      }));

    this.setData({ requestsList: requests });
  },

  // 加载附近的人
  loadNearbyPeople() {
    const nearbyUsers = app.globalData.nearbyUsers || [];
    const people = nearbyUsers.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      petInfo: `${user.breed}｜${user.age}`,
      distance: user.distance,
      lastActive: user.lastActive,
      tags: user.tags,
      isFriend: user.relationship === 'friend',
      requesting: user.relationship === 'requested'
    }));
    
    this.setData({ nearbyPeople: people });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 显示搜索栏
  showSearch() {
    this.setData({ showSearchBar: true });
  },

  // 隐藏搜索栏
  hideSearch() {
    this.setData({ 
      showSearchBar: false,
      searchKeyword: ''
    });
    this.filterFriends('');
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    this.filterFriends(keyword);
  },

  // 筛选好友
  filterFriends(keyword) {
    if (!keyword.trim()) {
      this.setData({ displayFriends: this.data.friendsList });
      return;
    }
    
    const filtered = this.data.friendsList.filter(friend => 
      friend.name.includes(keyword) || 
      friend.petInfo.includes(keyword)
    );
    
    this.setData({ displayFriends: filtered });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    
    // 根据标签加载对应数据
    if (tab === 'nearby') {
      this.loadNearbyPeople();
    }
  },

  // 查看好友资料
  viewFriendProfile(e) {
    const friend = e.currentTarget.dataset.friend;
    wx.showModal({
      title: friend.name,
      content: `宠物：${friend.petInfo}\n距离：${friend.distance}\n最后活跃：${friend.lastActive}`,
      showCancel: false
    });
  },

  // 开始聊天
  startChat(e) {
    const friend = e.currentTarget.dataset.friend || this.data.selectedFriend;
    this.hideActionsModal();
    
    wx.navigateTo({
      url: `/pages/chat/chat?friendId=${friend.id}&friendName=${friend.name}`
    });
  },

  // 显示好友操作菜单
  showFriendActions(e) {
    const friend = e.currentTarget.dataset.friend;
    this.setData({
      selectedFriend: friend,
      showActionsModal: true
    });
  },

  // 隐藏操作菜单
  hideActionsModal() {
    this.setData({ showActionsModal: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 查看资料
  viewProfile() {
    const friend = this.data.selectedFriend;
    this.hideActionsModal();
    
    wx.showModal({
      title: friend.name,
      content: `宠物：${friend.petInfo}\n距离：${friend.distance}\n最后活跃：${friend.lastActive}`,
      showCancel: false
    });
  },

  // 邀请约遛狗
  inviteMeetup() {
    const friend = this.data.selectedFriend;
    this.hideActionsModal();
    
    wx.navigateTo({
      url: `/pages/meetup/meetup?friendId=${friend.id}&friendName=${friend.name}`
    });
  },

  // 删除好友
  deleteFriend() {
    const friend = this.data.selectedFriend;
    this.hideActionsModal();
    
    wx.showModal({
      title: '删除好友',
      content: `确定要删除好友"${friend.name}"吗？`,
      confirmText: '删除',
      confirmColor: '#f44336',
      success: (res) => {
        if (res.confirm) {
          // 从好友列表中移除
          const friendsList = this.data.friendsList.filter(f => f.id !== friend.id);
          this.setData({
            friendsList,
            displayFriends: friendsList
          });
          
          wx.showToast({
            title: '已删除好友',
            icon: 'success'
          });
        }
      }
    });
  },

  // 同意好友申请
  acceptRequest(e) {
    const id = e.currentTarget.dataset.id;
    const request = this.data.requestsList.find(r => r.id === id);
    
    if (request) {
      // 添加到好友列表
      const newFriend = {
        ...request,
        distance: '未知',
        lastActive: '刚刚',
        isOnline: true,
        isFriend: true
      };
      
      const friendsList = [...this.data.friendsList, newFriend];
      const requestsList = this.data.requestsList.filter(r => r.id !== id);
      
      this.setData({
        friendsList,
        displayFriends: friendsList,
        requestsList
      });
      
      wx.showToast({
        title: '已同意好友申请',
        icon: 'success'
      });
    }
  },

  // 拒绝好友申请
  rejectRequest(e) {
    const id = e.currentTarget.dataset.id;
    const requestsList = this.data.requestsList.filter(r => r.id !== id);
    
    this.setData({ requestsList });
    
    wx.showToast({
      title: '已拒绝申请',
      icon: 'success'
    });
  },

  // 添加好友
  addFriend(e) {
    const user = e.currentTarget.dataset.user;
    
    // 更新用户状态为申请中
    const nearbyPeople = this.data.nearbyPeople.map(person => {
      if (person.id === user.id) {
        return { ...person, requesting: true };
      }
      return person;
    });
    
    this.setData({ nearbyPeople });
    
    wx.showToast({
      title: '好友申请已发送',
      icon: 'success'
    });
    
    // 实际应用中这里会发送到后端，不需要模拟同意逻辑
  },

  // 移除好友
  removeFriend(e) {
    const user = e.currentTarget.dataset.user;
    
    wx.showModal({
      title: '删除好友',
      content: `确定要删除好友"${user.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const nearbyPeople = this.data.nearbyPeople.map(person => {
            if (person.id === user.id) {
              return { ...person, isFriend: false };
            }
            return person;
          });
          
          this.setData({ nearbyPeople });
          
          wx.showToast({
            title: '已删除好友',
            icon: 'success'
          });
        }
      }
    });
  },

  // 刷新数据
  onRefresh() {
    this.setData({ refreshing: true });
    
    setTimeout(() => {
      this.initData();
      this.setData({ refreshing: false });
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 刷新数据
  refreshData() {
    this.loadNearbyPeople();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.onRefresh();
    wx.stopPullDownRefresh();
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'PawMate遛狗好友 - 找到志同道合的遛狗伙伴',
      path: '/pages/friends/friends'
    };
  }
}); 