const app = getApp();

Page({
  data: {
    // 筛选状态
    activeFilter: 'all',
    
    // 历史记录数据
    allHistory: [],
    filteredHistory: [],
    
    // 统计数据
    stats: {
      totalCount: 0,
      activeDays: 0,
      weeklyActivity: [],
      timePreference: {
        morning: 0,
        afternoon: 0,
        evening: 0
      }
    },
    
    // 各状态计数
    counts: {
      all: 0,
      accepted: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0
    },
    
    // UI状态
    refreshing: false,
    loading: false,
    hasMore: false,
    
    // 弹窗状态
    showDetail: false,
    selectedItem: null,
    showStatsModal: false
  },

  onLoad(options) {
    console.log('约遛狗记录页面加载:', options);
    this.initPage();
  },

  onShow() {
    this.loadHistoryData();
  },

  // 初始化页面
  initPage() {
    this.loadHistoryData();
  },

  // 加载历史数据
  loadHistoryData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 从本地存储和全局数据获取历史记录
      const storedMeetups = wx.getStorageSync('meetups') || [];
      const globalMeetups = app.globalData.meetups || [];
      
      // 合并并去重
      const allMeetups = [...globalMeetups, ...storedMeetups];
      const uniqueMeetups = allMeetups.filter((meetup, index, self) => 
        index === self.findIndex(m => m.id === meetup.id)
      );
      
      // 使用真实数据，不添加模拟数据
      const finalHistory = uniqueMeetups;
      
      // 处理历史数据
      const processedHistory = this.processHistoryData(finalHistory);
      
      this.setData({
        allHistory: processedHistory
      });
      
      // 计算统计数据
      this.calculateStats();
      
      // 应用当前筛选
      this.applyFilter(this.data.activeFilter);
      
      wx.hideLoading();
    } catch (error) {
      console.error('加载历史数据失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },



  // 处理历史数据
  processHistoryData(rawHistory) {
    const now = new Date();
    
    return rawHistory.map(item => {
      const createdDate = new Date(item.timestamp || item.createdAt);
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // 计算相对时间
      let relativeTime;
      if (diffDays === 0) {
        relativeTime = '今天';
      } else if (diffDays === 1) {
        relativeTime = '昨天';
      } else if (diffDays < 7) {
        relativeTime = `${diffDays}天前`;
      } else if (diffDays < 30) {
        relativeTime = `${Math.floor(diffDays / 7)}周前`;
      } else {
        relativeTime = `${Math.floor(diffDays / 30)}个月前`;
      }
      
      return {
        ...item,
        relativeTime,
        sortTimestamp: createdDate.getTime()
      };
    }).sort((a, b) => b.sortTimestamp - a.sortTimestamp);
  },

  // 计算统计数据
  calculateStats() {
    const history = this.data.allHistory;
    const totalCount = history.length;
    
    // 计算活跃天数
    const uniqueDates = [...new Set(history.map(item => item.date))];
    const activeDays = uniqueDates.length;
    
    // 计算各状态计数
    const counts = {
      all: totalCount,
      accepted: history.filter(item => item.status === 'accepted').length,
      pending: history.filter(item => item.status === 'pending').length,
      rejected: history.filter(item => item.status === 'rejected').length,
      cancelled: history.filter(item => item.status === 'cancelled').length
    };
    
    // 计算时间偏好
    const timePreference = this.calculateTimePreference(history);
    
    // 计算最近7天活跃度
    const weeklyActivity = this.calculateWeeklyActivity(history);
    
    this.setData({
      stats: {
        totalCount,
        activeDays,
        weeklyActivity,
        timePreference
      },
      counts
    });
  },

  // 计算时间偏好
  calculateTimePreference(history) {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    
    history.forEach(item => {
      const hour = parseInt(item.time.split(':')[0]);
      if (hour >= 6 && hour < 12) {
        timeSlots.morning++;
      } else if (hour >= 12 && hour < 18) {
        timeSlots.afternoon++;
      } else {
        timeSlots.evening++;
      }
    });
    
    const total = history.length;
    return {
      morning: total > 0 ? Math.round((timeSlots.morning / total) * 100) : 0,
      afternoon: total > 0 ? Math.round((timeSlots.afternoon / total) * 100) : 0,
      evening: total > 0 ? Math.round((timeSlots.evening / total) * 100) : 0
    };
  },



  // 计算最近7天活跃度
  calculateWeeklyActivity(history) {
    const now = new Date();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const activity = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = this.formatDate(date);
      const dayName = days[date.getDay()];
      const count = history.filter(item => item.date === dateStr).length;
      
      activity.push({
        day: dayName,
        count,
        height: Math.max(count * 20, 10) // 最小高度10%
      });
    }
    
    return activity;
  },

  // 应用筛选
  applyFilter(filter) {
    let filtered;
    
    if (filter === 'all') {
      filtered = this.data.allHistory;
    } else {
      filtered = this.data.allHistory.filter(item => item.status === filter);
    }
    
    // 添加日期分组
    const groupedHistory = this.addDateHeaders(filtered);
    
    this.setData({
      filteredHistory: groupedHistory,
      activeFilter: filter
    });
  },

  // 添加日期分组头部
  addDateHeaders(history) {
    if (history.length === 0) return [];
    
    const result = [];
    let lastDate = '';
    
    history.forEach(item => {
      const itemDate = item.date;
      if (itemDate !== lastDate) {
        const dateHeader = this.getDateHeaderText(itemDate);
        result.push({
          ...item,
          showDateHeader: true,
          dateHeaderText: dateHeader
        });
        lastDate = itemDate;
      } else {
        result.push(item);
      }
    });
    
    return result;
  },

  // 获取日期头部文本
  getDateHeaderText(dateStr) {
    const today = this.formatDate(new Date());
    const yesterday = this.formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    if (dateStr === today) {
      return '今天';
    } else if (dateStr === yesterday) {
      return '昨天';
    } else {
      return dateStr;
    }
  },

  // 事件处理函数
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.applyFilter(filter);
  },

  // 查看详情
  viewDetail(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      selectedItem: item,
      showDetail: true
    });
  },

  // 隐藏详情
  hideDetail() {
    this.setData({ showDetail: false });
  },

  // 显示统计详情
  showStatsDetail() {
    this.setData({ showStatsModal: true });
  },

  // 隐藏统计详情
  hideStatsModal() {
    this.setData({ showStatsModal: false });
  },

  // 与用户聊天
  chatWithUser(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/chat/chat?userName=${encodeURIComponent(item.targetUser)}&userAvatar=${encodeURIComponent(item.targetAvatar)}`
    });
  },

  // 再次约遛狗
  meetAgain(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/meetup/meetup?userId=${item.targetUserId}&userName=${encodeURIComponent(item.targetUser)}&userAvatar=${encodeURIComponent(item.targetAvatar)}`
    });
  },

  // 从详情页再次约遛狗
  meetAgainFromDetail() {
    const item = this.data.selectedItem;
    this.hideDetail();
    wx.navigateTo({
      url: `/pages/meetup/meetup?userId=${item.targetUserId}&userName=${encodeURIComponent(item.targetUser)}&userAvatar=${encodeURIComponent(item.targetAvatar)}`
    });
  },

  // 去地图页面
  goToMap() {
    wx.switchTab({
      url: '/pages/map/map'
    });
  },

  // 刷新数据
  onRefresh() {
    this.setData({ refreshing: true });
    this.loadHistoryData();
    
    setTimeout(() => {
      this.setData({ refreshing: false });
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ loading: true });
      
      // 模拟加载更多
      setTimeout(() => {
        this.setData({ 
          loading: false,
          hasMore: false
        });
      }, 1000);
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 工具函数

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化日期时间
  formatDateTime(date) {
    return `${this.formatDate(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      pending: '进行中',
      accepted: '已完成',
      rejected: '已拒绝',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  },

  // 获取空状态图标
  getEmptyIcon(filter) {
    const iconMap = {
      all: '📋',
      accepted: '✅',
      pending: '⏳',
      rejected: '❌',
      cancelled: '🚫'
    };
    return iconMap[filter] || '📋';
  },

  // 获取空状态标题
  getEmptyTitle(filter) {
    const titleMap = {
      all: '暂无约遛狗记录',
      accepted: '暂无已完成记录',
      pending: '暂无进行中记录',
      rejected: '暂无被拒绝记录',
      cancelled: '暂无已取消记录'
    };
    return titleMap[filter] || '暂无记录';
  },

  // 获取空状态描述
  getEmptyDesc(filter) {
    const descMap = {
      all: '去地图页面找朋友开始约遛狗吧！',
      accepted: '还没有成功完成的约遛狗',
      pending: '当前没有进行中的约遛狗',
      rejected: '暂时没有被拒绝的记录',
      cancelled: '暂时没有取消的记录'
    };
    return descMap[filter] || '暂无相关记录';
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'PawMate遛狗记录 - 记录每一次美好的遛狗时光',
      path: '/pages/index/index'
    };
  }
}); 