// pages/share/share.js
const app = getApp();

Page({
  data: {
    activeCategory: 'all',
    refreshing: false,
    hasMore: true,
    showPostOptions: false,
    showSmartBanner: true,
    searchKeyword: '',
    
    // 帖子数据
    allPosts: [],
    leftPosts: [],
    rightPosts: [],
    
    // 专业知识数据
    knowledgeList: []
  },

  onLoad() {
    console.log('分享页面加载');
    this.initData();
  },

  onShow() {
    this.refreshPosts();
  },

  // 初始化数据
  initData() {
    this.loadKnowledgeData();
    this.loadPostsData();
  },

  // 加载专业知识数据
  loadKnowledgeData() {
    // 返回空数组，实际使用时从后端获取真实数据
    const knowledgeList = [];
    this.setData({ knowledgeList });
  },

  // 加载帖子数据
  loadPostsData() {
    const posts = this.generateMockPosts();
    this.setData({ allPosts: posts });
    this.distributePosts(posts);
  },

  // 生成模拟帖子数据
  generateMockPosts() {
    // 返回空数组，实际使用时从后端获取真实数据
    return [];
  },

  // 分发帖子到左右两列
  distributePosts(posts) {
    const filteredPosts = this.filterPostsByCategory(posts);
    const leftPosts = [];
    const rightPosts = [];
    
    filteredPosts.forEach((post, index) => {
      if (index % 2 === 0) {
        leftPosts.push(post);
      } else {
        rightPosts.push(post);
      }
    });
    
    this.setData({ leftPosts, rightPosts });
  },

  // 根据分类筛选帖子
  filterPostsByCategory(posts) {
    if (this.data.activeCategory === 'all') {
      return posts;
    }
    return posts.filter(post => post.category === this.data.activeCategory);
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    
    if (keyword.trim()) {
      this.searchPosts(keyword);
    } else {
      this.distributePosts(this.data.allPosts);
    }
  },

  // 搜索帖子
  searchPosts(keyword) {
    const filtered = this.data.allPosts.filter(post => 
      post.title.includes(keyword) || 
      (post.tags && post.tags.some(tag => tag.includes(keyword)))
    );
    this.distributePosts(filtered);
  },

  // 扫描宠物信息
  scanPetInfo() {
    wx.showToast({
      title: 'AI识别功能开发中',
      icon: 'none'
    });
  },

  // 关闭智能横幅
  closeBanner() {
    this.setData({ showSmartBanner: false });
  },

  // 功能导航
  goToKnowledge() {
    wx.showToast({
      title: '养宠百科页面开发中',
      icon: 'none'
    });
  },

  goToHealthCheck() {
    wx.showToast({
      title: 'AI健康检测功能开发中',
      icon: 'none'
    });
  },

  goToBreedGuide() {
    wx.showToast({
      title: '品种指南页面开发中',
      icon: 'none'
    });
  },

  goToTraining() {
    wx.showToast({
      title: '训练技巧页面开发中',
      icon: 'none'
    });
  },

  goToNutrition() {
    wx.showToast({
      title: '营养指南页面开发中',
      icon: 'none'
    });
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category });
    this.distributePosts(this.data.allPosts);
  },

  // 查看知识详情
  viewKnowledge(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.title,
      content: `专家：${item.expert}\n分类：${item.category}\n阅读量：${item.readCount}\n点赞数：${item.likeCount}`,
      showCancel: false
    });
  },

  // 查看全部知识
  viewAllKnowledge() {
    this.setData({ activeCategory: 'knowledge' });
    this.distributePosts(this.data.allPosts);
  },

  // 查看帖子详情
  viewPost(e) {
    const post = e.currentTarget.dataset.post;
    wx.showModal({
      title: post.title,
      content: `作者：${post.author.name}\n${post.author.isExpert ? '专家认证' : '普通用户'}\n点赞：${post.likeCount}\n标签：${post.tags ? post.tags.join(', ') : '无'}`,
      showCancel: false
    });
  },

  // 显示发布选项
  showPostOptions() {
    this.setData({ showPostOptions: true });
  },

  // 隐藏发布选项
  hidePostOptions() {
    this.setData({ showPostOptions: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 发布照片
  postPhoto() {
    this.hidePostOptions();
    wx.navigateTo({
      url: '/pages/post/post?type=photo'
    });
  },

  // 发布视频
  postVideo() {
    this.hidePostOptions();
    wx.navigateTo({
      url: '/pages/post/post?type=video'
    });
  },

  // 发布知识
  postKnowledge() {
    this.hidePostOptions();
    wx.navigateTo({
      url: '/pages/post/post?type=knowledge'
    });
  },

  // 发布故事
  postStory() {
    this.hidePostOptions();
    wx.navigateTo({
      url: '/pages/post/post?type=story'
    });
  },

  // 刷新数据
  onRefresh() {
    this.setData({ refreshing: true });
    
    setTimeout(() => {
      this.loadPostsData();
      this.loadKnowledgeData();
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

  // 刷新帖子
  refreshPosts() {
    // 从本地存储获取新发布的帖子
    const publicPosts = wx.getStorageSync('publicPosts') || [];
    if (publicPosts.length > 0) {
      const allPosts = [...publicPosts, ...this.data.allPosts];
      this.setData({ allPosts });
      this.distributePosts(allPosts);
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
      title: 'PawMate萌宠分享 - 发现更多萌宠知识',
      path: '/pages/share/share'
    };
  }
}); 