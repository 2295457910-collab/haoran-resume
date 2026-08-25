// pages/discover/discover.js
const app = getApp();

Page({
  data: {
    refreshing: false,
    hasMore: true,
    momentsList: [],
    showCommentsModal: false,
    currentMomentComments: [],
    commentText: '',
    currentMomentId: null
  },

  onLoad() {
    console.log('狗友圈页面加载');
    this.loadMoments();
  },

  onShow() {
    this.refreshMoments();
  },

  // 加载朋友圈动态
  loadMoments() {
    const moments = this.generateMockMoments();
    this.setData({ momentsList: moments, hasMore: moments.length > 3 });
  },

  // 生成模拟朋友圈数据
  generateMockMoments() {
    const nearbyUsers = app.globalData.nearbyUsers || [];
    if (!nearbyUsers.length) {
      return [];
    }

    const getUser = (id) => nearbyUsers.find(user => user.id === id) || {};

    const latte = getUser('latte');
    const doudou = getUser('doudou');
    const luna = getUser('luna');

    return [
      {
        id: 'moment_001',
        author: {
          name: `${latte.owner} · ${latte.name}`,
          avatar: latte.avatar
        },
        timeText: '45分钟前',
        location: '朝阳公园 北门草坪',
        content: '拿铁今天把 3 公里的间歇跑配速压到了 6 分 10 秒，最后还带着社群小伙伴一起做了放松拉伸。这个飞盘真的太适合她了！',
        images: [
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=640&h=480&q=80',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&h=480&q=80',
          'https://images.unsplash.com/photo-1489440543286-a69330151c0b?auto=format&fit=crop&w=640&h=480&q=80'
        ],
        video: '',
        videoCover: '',
        likeCount: 28,
        likeUsers: ['刘洋', '陈晨', '赵露', '我'],
        commentCount: 3,
        comments: [
          {
            id: 'c001',
            author: '刘洋',
            content: '拿铁的飞盘接球越来越稳了，周末带豆豆一起！',
            time: '30分钟前',
            avatar: doudou.avatar
          },
          {
            id: 'c002',
            author: '陈晨',
            content: '朝阳公园风景太棒啦，下次我们金毛团一起去。',
            time: '28分钟前',
            avatar: getUser('mango').avatar
          }
        ],
        metrics: [
          { icon: '⏱', label: '时长', value: latte.walkStats?.duration || '45分钟' },
          { icon: '📍', label: '路线', value: latte.favoriteRoute || '朝阳公园环湖' },
          { icon: '🐾', label: '配速', value: latte.walkStats?.pace || '14′30"' }
        ],
        tags: ['飞盘训练', '社群晨跑'],
        expanded: false
      },
      {
        id: 'moment_002',
        author: {
          name: `${doudou.owner} · ${doudou.name}`,
          avatar: doudou.avatar
        },
        timeText: '1小时前',
        location: '亮马河 风筝草坪',
        content: '豆豆最近在练习“停留 + 冲刺”的结合动作，短腿也能爆发惊人的速度！感谢大家借我计时器。',
        images: [
          'https://images.unsplash.com/photo-1517665001723-8afb53826f36?auto=format&fit=crop&w=640&h=480&q=80',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&h=480&q=80'
        ],
        video: '',
        videoCover: '',
        likeCount: 16,
        likeUsers: ['王珊', '周琪', '赵露'],
        commentCount: 2,
        comments: [
          {
            id: 'c003',
            author: '王珊',
            content: '明天带拿铁跟豆豆一起练冲刺，互相追逐超有动力！',
            time: '55分钟前',
            avatar: latte.avatar
          }
        ],
        metrics: [
          { icon: '🎯', label: '目标', value: '5 次连贯冲刺' },
          { icon: '🔥', label: '心率', value: '142 bpm' },
          { icon: '🐾', label: '步频', value: '168' }
        ],
        tags: ['短腿冲刺', '自制训练'],
        expanded: false
      },
      {
        id: 'moment_003',
        author: {
          name: `${luna.owner} · ${luna.name}`,
          avatar: luna.avatar
        },
        timeText: '昨天 20:15',
        location: '团结湖 慢跑圈',
        content: '刚搬到北京的第一周，感谢社群的小伙伴给我推荐的路线。露娜第一次夜跑就遇见好多友善的狗狗。',
        images: [],
        video: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        videoCover: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=640&h=360&q=80',
        likeCount: 21,
        likeUsers: ['王珊', '刘洋', '陈晨', '李雷'],
        commentCount: 4,
        comments: [
          {
            id: 'c004',
            author: '李雷',
            content: '奥利奥也住附近，改天夜跑一起？',
            time: '昨天 21:02',
            avatar: getUser('oreo').avatar
          },
          {
            id: 'c005',
            author: '周琪',
            content: '午休如果想找人散步也可以约我和布丁～',
            time: '昨天 21:15',
            avatar: getUser('pudding').avatar
          }
        ],
        metrics: [
          { icon: '👣', label: '步数', value: '6,240 步' },
          { icon: '🌙', label: '时间', value: '20:00 - 20:40' },
          { icon: '🤝', label: '同行', value: '遇见 4 位新狗友' }
        ],
        tags: ['新成员报到', '夜跑'],
        expanded: false
      }
    ];
  },

  // 编辑个人资料
  editProfile() {
    wx.showToast({
      title: '个人资料编辑功能开发中',
      icon: 'none'
    });
  },

  // 发布朋友圈
  publishMoment() {
    wx.navigateTo({
      url: '/pages/post/post?type=story'
    });
  },

  // 切换内容展开/收起
  toggleContent(e) {
    const id = e.currentTarget.dataset.id;
    const moments = this.data.momentsList.map(moment => {
      if (moment.id === id) {
        return { ...moment, expanded: !moment.expanded };
      }
      return moment;
    });
    
    this.setData({ momentsList: moments });
  },

  // 预览图片
  previewImage(e) {
    const urls = e.currentTarget.dataset.urls;
    const current = e.currentTarget.dataset.current;
    
    wx.previewImage({
      urls: urls,
      current: current
    });
  },

  // 点赞/取消点赞
  toggleLike(e) {
    const id = e.currentTarget.dataset.id;
    const moments = this.data.momentsList.map(moment => {
      if (moment.id === id) {
        const isLiked = !moment.isLiked;
        const likeCount = isLiked ? moment.likeCount + 1 : moment.likeCount - 1;
        const likeUsers = isLiked 
          ? ['我', ...moment.likeUsers]
          : moment.likeUsers.filter(user => user !== '我');
        
        return { 
          ...moment, 
          isLiked, 
          likeCount,
          likeUsers
        };
      }
      return moment;
    });
    
    this.setData({ momentsList: moments });
    
    wx.showToast({
      title: moments.find(m => m.id === id).isLiked ? '已点赞' : '已取消点赞',
      icon: 'none',
      duration: 1000
    });
  },

  // 显示点赞列表
  showLikesList(e) {
    const moment = e.currentTarget.dataset.moment;
    const likeUsers = moment.likeUsers.join('、');
    
    wx.showModal({
      title: '点赞列表',
      content: likeUsers,
      showCancel: false
    });
  },

  // 显示评论
  showComments(e) {
    const moment = e.currentTarget.dataset.moment;
    this.setData({
      showCommentsModal: true,
      currentMomentComments: moment.comments || [],
      currentMomentId: moment.id
    });
  },

  // 隐藏评论弹窗
  hideCommentsModal() {
    this.setData({ 
      showCommentsModal: false,
      commentText: ''
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  // 发送评论
  sendComment() {
    const commentText = this.data.commentText.trim();
    if (!commentText) return;
    
    const newComment = {
      id: Date.now(),
      author: '我',
      content: commentText,
      time: '刚刚',
      avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=50&h=50'
    };
    
    // 更新评论列表
    const updatedComments = [...this.data.currentMomentComments, newComment];
    
    // 更新朋友圈动态
    const moments = this.data.momentsList.map(moment => {
      if (moment.id === this.data.currentMomentId) {
        return {
          ...moment,
          comments: updatedComments,
          commentCount: updatedComments.length
        };
      }
      return moment;
    });
    
    this.setData({
      momentsList: moments,
      currentMomentComments: updatedComments,
      commentText: ''
    });
    
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    });
  },

  // 分享动态
  shareMoment(e) {
    const moment = e.currentTarget.dataset.moment;
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到群聊', '收藏'],
      success: (res) => {
        const actions = ['分享给好友', '分享到群聊', '收藏'];
        wx.showToast({
          title: actions[res.tapIndex] + '成功',
          icon: 'success'
        });
      }
    });
  },

  // 显示动态操作菜单
  showMomentActions(e) {
    const moment = e.currentTarget.dataset.moment;
    const itemList = moment.author.name === '我' 
      ? ['编辑', '删除'] 
      : ['举报'];
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        if (itemList[res.tapIndex] === '删除') {
          this.deleteMoment(moment.id);
        } else {
          wx.showToast({
            title: itemList[res.tapIndex] + '功能开发中',
            icon: 'none'
          });
        }
      }
    });
  },

  // 删除动态
  deleteMoment(id) {
    wx.showModal({
      title: '删除动态',
      content: '确定要删除这条动态吗？',
      success: (res) => {
        if (res.confirm) {
          const moments = this.data.momentsList.filter(moment => moment.id !== id);
          this.setData({ momentsList: moments });
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 刷新动态
  onRefresh() {
    this.setData({ refreshing: true });
    
    setTimeout(() => {
      this.loadMoments();
      this.setData({ refreshing: false });
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore) return;
    
    // 实际使用时从后端获取更多数据
    this.setData({ hasMore: false });
  },

  // 刷新朋友圈
  refreshMoments() {
    // 从本地存储获取新发布的动态
    const friendsPosts = wx.getStorageSync('friendsPosts') || [];
    if (friendsPosts.length > 0) {
      const moments = [...friendsPosts, ...this.data.momentsList];
      this.setData({ momentsList: moments });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.onRefresh();
    wx.stopPullDownRefresh();
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'PawMate狗友圈 - 分享遛狗生活',
      path: '/pages/discover/discover'
    };
  }
}); 