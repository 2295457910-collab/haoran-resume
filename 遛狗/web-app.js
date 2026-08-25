// PawMate App JavaScript - 完整版
class PawMateApp {
    constructor() {
        this.currentTab = 'map';
        this.map = null;
        this.userLocation = [39.9042, 116.4074];
        this.currentUser = null;
        this.isWalking = false;
        
        // 虚拟用户数据 - 6个附近用户
        this.users = [
            {
                id: 1, name: 'Lucky', owner: '张小姐', breed: '金毛寻回犬',
                age: '3岁', gender: '公', personality: '温顺、活泼、友好',
                position: [39.9052, 116.4064],
                avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100',
                status: '正在公园遛狗，寻找玩伴一起玩耍～', distance: '150m', lastActive: '2分钟前'
            },
            {
                id: 2, name: 'Max', owner: '李先生', breed: '柴犬',
                age: '2岁', gender: '公', personality: '忠诚、聪明、独立',
                position: [39.9032, 116.4084],
                avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100',
                status: '想找小伙伴一起训练', distance: '300m', lastActive: '5分钟前'
            },
            {
                id: 3, name: 'Bella', owner: '王女士', breed: '边境牧羊犬',
                age: '1岁半', gender: '母', personality: '聪明、敏捷、精力充沛',
                position: [39.9022, 116.4054],
                avatar: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=100&h=100',
                status: '新来的小朋友，求包养～', distance: '500m', lastActive: '刚刚'
            },
            {
                id: 4, name: 'Coco', owner: '陈先生', breed: '贵宾犬',
                age: '4岁', gender: '母', personality: '优雅、聪明、粘人',
                position: [39.9065, 116.4090],
                avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&h=100',
                status: '刚做完美容，心情美美哒', distance: '200m', lastActive: '10分钟前'
            },
            {
                id: 5, name: 'Rocky', owner: '刘先生', breed: '哈士奇',
                age: '2岁半', gender: '公', personality: '调皮、精力旺盛、爱拆家',
                position: [39.9015, 116.4035],
                avatar: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=100&h=100',
                status: '今天又把沙发咬坏了...', distance: '650m', lastActive: '15分钟前'
            },
            {
                id: 6, name: 'Daisy', owner: '赵女士', breed: '拉布拉多',
                age: '5岁', gender: '母', personality: '温柔、善良、会照顾人',
                position: [39.9078, 116.4045],
                avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=100&h=100',
                status: '今天的夕阳好美～', distance: '400m', lastActive: '25分钟前'
            }
        ];
        
        // 朋友圈风格动态数据
        this.posts = [
            {
                id: 1, userId: 1, user: 'Lucky', owner: '张小姐',
                avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100',
                time: '2小时前',
                content: '今天在公园遇到了好多小伙伴！Lucky玩得超开心 😊\n\n天气真好，适合遛狗～',
                image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&h=600',
                likes: 23, comments: 2, liked: false,
                topics: ['#狗狗日常', '#遛狗打卡'],
                commentList: [
                    { user: 'Max爸爸', avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100', content: 'Lucky太可爱了！下次一起玩吧', time: '1小时前' },
                    { user: 'Bella妈妈', avatar: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=100&h=100', content: '我家Bella也想一起玩～', time: '30分钟前' }
                ]
            },
            {
                id: 2, userId: 2, user: 'Max', owner: '李先生',
                avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100',
                time: '4小时前',
                content: '训练成果展示！Max学会了新技能 🎾\n\n坚持每天训练真的有效果！',
                image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&h=600',
                likes: 45, comments: 1, liked: true,
                topics: ['#萌宠日常', '#狗狗成长'],
                commentList: [
                    { user: 'Lucky妈妈', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100', content: '太厉害了！求分享训练方法', time: '3小时前' }
                ]
            },
            {
                id: 3, userId: 4, user: 'Coco', owner: '陈先生',
                avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&h=100',
                time: '6小时前',
                content: '今天Coco做完美容，整个狗都精神了！美容师夸她是见过最乖的贵宾～💅',
                image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&h=600',
                likes: 32, comments: 3, liked: false,
                topics: ['#狗狗美容', '#贵宾犬'],
                commentList: [
                    { user: 'Daisy妈妈', avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=100&h=100', content: '太漂亮了！在哪家美容店呀？', time: '5小时前' }
                ]
            },
            {
                id: 4, userId: 5, user: 'Rocky', owner: '刘先生',
                avatar: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=100&h=100',
                time: '8小时前',
                content: '今天又把沙发咬坏了...我已经习惯了，至少Rocky开心就好 😂\n\n养哈士奇真的是一种修行...',
                image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&h=600',
                likes: 56, comments: 7, liked: false,
                topics: ['#哈士奇日常', '#拆家能手'],
                commentList: [
                    { user: 'Max爸爸', avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100', content: '哈哈哈哈哈，一模一样！', time: '7小时前' },
                    { user: 'Bella妈妈', avatar: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=100&h=100', content: 'Rocky表情好无辜！', time: '6小时前' }
                ]
            },
            {
                id: 5, userId: 6, user: 'Daisy', owner: '赵女士',
                avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=100&h=100',
                time: '12小时前',
                content: '今天的夕阳好美～和Daisy在河边散步，感觉岁月静好 🌅\n\n这样的时光真美好',
                image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&h=600',
                likes: 78, comments: 4, liked: true,
                topics: ['#夕阳', '#岁月静好', '#拉布拉多'],
                commentList: [
                    { user: 'Lucky妈妈', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100', content: '太美了！这是在哪拍的？', time: '11小时前' }
                ]
            },
            {
                id: 6, userId: 3, user: 'Bella', owner: '王女士',
                avatar: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=100&h=100',
                time: '昨天',
                content: 'Bella今天学会了新技能！接飞盘一接一个准～边牧果然聪明绝顶！🎉\n\n proud of my baby!',
                image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&h=600',
                likes: 67, comments: 5, liked: false,
                topics: ['#边牧', '#聪明狗狗', '#狗狗训练'],
                commentList: []
            }
        ];
        
        // 消息列表数据
        this.chats = [
            { id: 1, name: 'Lucky妈妈', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100', lastMessage: '明天下午想约遛狗吗？', time: '10:30', unread: 2, online: true },
            { id: 2, name: 'Max爸爸', avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100', lastMessage: '训练视频分享给你了', time: '昨天', unread: 0, online: true },
            { id: 3, name: 'Bella妈妈', avatar: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=100&h=100', lastMessage: '今天在公园看到你们了！', time: '昨天', unread: 1, online: false },
            { id: 4, name: 'Coco爸爸', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&h=100', lastMessage: '你们家狗狗太可爱了～', time: '3天前', unread: 0, online: false },
            { id: 5, name: 'PawMate官方', avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100', lastMessage: '您有新的活动邀请！', time: '1周前', unread: 0, online: true }
        ];
        
        // 聊天历史
        this.chatHistories = {
            1: [
                { sender: 'them', message: '你好呀！看到你家金毛也在附近', time: '10:00' },
                { sender: 'me', message: '你好！是的，我们经常来这里遛狗', time: '10:02' },
                { sender: 'them', message: '要不要一起遛狗呀？明天下午有空吗？', time: '10:05' },
                { sender: 'me', message: '好呀！什么时候方便？', time: '10:06' },
                { sender: 'them', message: '明天下午3点怎么样？在公园门口见', time: '10:30' }
            ],
            2: [
                { sender: 'them', message: '你好！看Max训练得好棒！', time: '昨天 14:00' },
                { sender: 'me', message: '谢谢！花了很多时间训练呢', time: '昨天 14:05' },
                { sender: 'them', message: '能分享一下训练方法吗？', time: '昨天 14:10' },
                { sender: 'me', message: '当然！我录了个视频分享给你', time: '昨天 14:15' },
                { sender: 'them', message: '太感谢了！训练视频收到', time: '昨天 16:20' }
            ]
        };
        
        // 商品数据
        this.products = [
            { id: 1, name: '高端狗粮 - 成犬专用', price: 298, originalPrice: 358, image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=400&h=400', rating: 4.8, sales: '月销2000+', category: '食物' },
            { id: 2, name: '益智玩具球', price: 89, originalPrice: 128, image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=400&h=400', rating: 4.9, sales: '月销1500+', category: '玩具' },
            { id: 3, name: '狗狗沐浴露', price: 68, originalPrice: 98, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&h=400', rating: 4.7, sales: '月销3000+', category: '用品' },
            { id: 4, name: '宠物胸背带', price: 128, originalPrice: 168, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&h=400', rating: 4.9, sales: '月销1800+', category: '用品' },
            { id: 5, name: '狗狗指甲剪', price: 45, originalPrice: 68, image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=400', rating: 4.6, sales: '月销2500+', category: '用品' },
            { id: 6, name: '宠物吸水毛巾', price: 35, originalPrice: 55, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&h=400', rating: 4.8, sales: '月销3200+', category: '用品' },
            { id: 7, name: '狗狗零食大礼包', price: 128, originalPrice: 168, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=400&h=400', rating: 4.9, sales: '月销4000+', category: '食物' },
            { id: 8, name: '智能喂食器', price: 399, originalPrice: 499, image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&h=400', rating: 4.7, sales: '月销800+', category: '用品' }
        ];
        
        // 当前用户（自己）
        this.myProfile = {
            owner: '张小姐',
            dogName: 'Lucky',
            avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100',
            location: '北京·朝阳区'
        };
        
        // 我的狗狗
        this.myDogs = [
            { id: 1, name: 'Lucky', breed: '金毛寻回犬', age: 3, gender: '公', weight: '30kg', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=150&h=150' }
        ];
        
        // 约玩记录
        this.meetups = [
            { id: 1, targetUser: 'Lucky', targetOwner: '张小姐', targetAvatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100', date: '2024-01-20', time: '18:00', location: '附近公园', status: 'pending', type: 'sent' },
            { id: 2, targetUser: 'Max', targetOwner: '李先生', targetAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&h=100', date: '2024-01-19', time: '09:00', location: '河边步道', status: 'accepted', type: 'received' },
            { id: 3, targetUser: 'Bella', targetOwner: '王女士', targetAvatar: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=100&h=100', date: '2024-01-21', time: '16:00', location: '小区周边', status: 'pending', type: 'received' }
        ];

        // 状态管理
        this.filterState = { breed: '全部', maxDistance: 1000 };
        this.activeStoryUserId = 'all';
        this.activeShopCategory = '热门';
        this.currentProductId = null;
        this.currentChatId = null;
        this.orderFilterStatus = '全部';
        this.userMarkers = [];
        this.myLocationMarker = null;
        this.myLocationCircle = null;
        this.currentPostId = null;

        // 本地持久化数据
        this.defaultSettings = {
            nickname: '张小姐',
            phone: '13800008888',
            allowLocationShare: true,
            messageNotification: true,
            meetupNotification: true,
            orderNotification: true,
            marketingNotification: false,
            privateAccount: false,
            quietMode: false,
            quietStart: '22:00',
            quietEnd: '08:00'
        };
        this.settings = this.readStorage('pawmate_settings', this.defaultSettings);
        this.cart = this.readStorage('pawmate_cart', []);
        this.orders = this.readStorage('pawmate_orders', []);
        
        this.init();
    }

    readStorage(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            if (!value) return fallback;
            const parsed = JSON.parse(value);
            return parsed ?? fallback;
        } catch (err) {
            return fallback;
        }
    }

    writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn('本地存储失败:', err);
        }
    }
    
    init() {
        console.log('🐕 PawMate 初始化中...');
        this.ensureChatHistoryIntegrity();
        this.updateUserDistances();
        this.setupGlobalFunctions();
        this.syncProfileFromSettings();
        this.initMap();
        this.loadAllContent();
        console.log('✅ PawMate 初始化完成');
    }
    
    setupGlobalFunctions() {
        window.switchTab = (tab) => this.switchTab(tab);
        window.toggleWalk = () => this.toggleWalk();
        window.centerMap = () => this.centerMap();
        window.toggleFilter = () => this.toggleFilter();
        window.hideUserCard = () => this.hideUserCard();
        window.hideUserCardBackup = () => this.hideUserCard();
        window.startChat = () => this.startChat();
        window.createMeetup = () => this.createMeetup();
        window.toggleFriend = () => this.toggleFriend();
        window.showToast = (msg) => this.showToast(msg);
        window.openCreatePostModal = () => this.openCreatePostModal();
        window.closeCreatePostModal = () => this.closeCreatePostModal();
        window.previewPostImage = (event) => this.previewPostImage(event);
        window.removePostImage = () => this.removePostImage();
        window.toggleTopic = (btn) => this.toggleTopic(btn);
        window.publishPost = () => this.publishPost();
        window.likePost = (id) => this.likePost(id);
        window.openCommentModal = (id) => this.openCommentModal(id);
        window.closeCommentModal = () => this.closeCommentModal();
        window.submitComment = () => this.submitComment();
        window.handleSearch = (q) => this.handleSearch(q);
        window.openUserProfileModal = (id) => this.openUserProfileModal(id);
        window.closeUserProfileModal = () => this.closeUserProfileModal();
        window.openCart = () => this.openCart();
        window.closeCart = () => this.closeCart();
        window.toggleCartEdit = () => this.toggleCartEdit();
        window.toggleSelectAll = () => this.toggleSelectAll();
        window.addToCart = (id) => this.addToCart(id);
        window.removeFromCart = (id) => this.removeFromCart(id);
        window.increaseCartQuantity = (id) => this.updateCartQuantity(id, 1);
        window.decreaseCartQuantity = (id) => this.updateCartQuantity(id, -1);
        window.checkout = () => this.checkout();
        window.openMeetupModal = (user) => this.openMeetupModal(user);
        window.closeMeetupModal = () => this.closeMeetupModal();
        window.addQuickNote = (note) => this.addQuickNote(note);
        window.sendMeetupRequest = () => this.sendMeetupRequest();
        window.openMeetupListModal = () => this.openMeetupListModal();
        window.closeMeetupListModal = () => this.closeMeetupListModal();
        window.respondToMeetup = (id, resp) => this.respondToMeetup(id, resp);
        window.openChatDetail = (id) => this.openChatDetail(id);
        window.closeChatDetail = () => this.closeChatDetail();
        window.sendMessage = () => this.sendMessage();
        window.openProductDetail = (id) => this.openProductDetail(id);
        window.closeProductDetail = () => this.closeProductDetail();
        window.selectSpec = (spec) => this.selectSpec(spec);
        window.addToCartFromDetail = () => this.addToCartFromDetail();
        window.setShopCategory = (category) => this.setShopCategory(category);
        window.filterPostsByStory = (userId) => this.filterPostsByStory(userId);
        window.openAddDogModal = () => this.openAddDogModal();
        window.closeAddDogModal = () => this.closeAddDogModal();
        window.addNewDog = () => this.addNewDog();
        window.openOrdersPage = () => this.openOrdersPage();
        window.closeOrdersPage = () => this.closeOrdersPage();
        window.changeOrderTab = (status) => this.changeOrderTab(status);
        window.openSettingsModal = () => this.openSettingsModal();
        window.closeSettingsModal = () => this.closeSettingsModal();
        window.saveSettings = () => this.saveSettings();
        window.resetSettingsDefaults = () => this.resetSettingsDefaults();
        window.buyNow = () => this.buyNow();
        window.viewOrders = () => this.openOrdersPage();
        window.closeOrderSuccess = () => this.closeOrderSuccess();
        window.submitOrder = () => this.submitOrderFromCheckout();
        window.closeCheckout = () => this.closeCheckoutModal();
        window.testUserCard = () => this.testUserCard();
    }
    
    // ===== Tab切换 =====
    switchTab(tab) {
        // 切换前关闭聊天详情与所有弹窗 overlay，避免切换后仍覆盖在新 tab 之上
        const _cdp = document.getElementById('chatDetailPage');
        if (_cdp) { _cdp.classList.add('hidden'); _cdp.style.display = 'none'; }
        document.querySelectorAll('.fixed.inset-0').forEach(el => { if (el.id !== 'chatDetailPage') el.remove(); });
        this.currentChatId = null;
        // 隐藏所有tab内容
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        // 移除所有导航项的active类
        document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
        // 显示选中的tab
        const tabEl = document.getElementById(tab + 'Tab');
        if (tabEl) tabEl.classList.add('active');
        // 高亮对应的导航项
        const navEl = document.querySelector(`[data-tab="${tab}"]`);
        if (navEl) navEl.classList.add('active');
        // 更新标题
        const titles = { map: '附近的朋友', discover: '发现', messages: '消息', shop: '商城', profile: '个人中心' };
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) titleEl.textContent = titles[tab] || '';
        this.currentTab = tab;
        // 特殊处理
        if (tab === 'map') this.loadNearbyUsersList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    syncProfileFromSettings() {
        const nickname = this.settings.nickname || '张小姐';
        this.myProfile.owner = nickname;
        const sidebarName = document.querySelector('aside h3.font-semibold.text-gray-900');
        if (sidebarName) sidebarName.textContent = nickname;
        const profileTitle = document.querySelector('#profileTab h2.text-3xl.font-bold');
        if (profileTitle) profileTitle.textContent = nickname;
    }

    ensureChatHistoryIntegrity() {
        this.chats.forEach((chat) => {
            if (!Array.isArray(this.chatHistories[chat.id])) this.chatHistories[chat.id] = [];
            if (this.chatHistories[chat.id].length === 0) {
                this.chatHistories[chat.id].push({
                    sender: 'them',
                    message: chat.lastMessage || '你好，认识一下吧～',
                    time: chat.time || '刚刚'
                });
            }
        });
    }
    
    // ===== 地图功能 =====
    initMap() {
        setTimeout(() => {
            try {
                if (typeof L !== 'undefined') {
                    this.map = L.map('map').setView(this.userLocation, 15);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap'
                    }).addTo(this.map);
                    this.refreshMapUsers();
                } else {
                    this.createSimpleMapFallback();
                }
            } catch (e) {
                console.warn('地图加载失败，使用备用方案:', e);
                this.createSimpleMapFallback();
            }
        }, 300);
    }

    calculateDistanceMeters([lat1, lng1], [lat2, lng2]) {
        const R = 6371000;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    formatDistance(distanceMeters) {
        if (distanceMeters < 1000) return `${distanceMeters}m`;
        return `${(distanceMeters / 1000).toFixed(1)}km`;
    }

    updateUserDistances() {
        this.users.forEach((user) => {
            const meters = this.calculateDistanceMeters(this.userLocation, user.position);
            user.distanceMeters = meters;
            user.distance = this.formatDistance(meters);
        });
    }

    getFilteredUsers() {
        return this.users.filter((user) => {
            const breedMatched = this.filterState.breed === '全部' || user.breed === this.filterState.breed;
            const distanceMatched = (user.distanceMeters ?? 99999) <= this.filterState.maxDistance;
            return breedMatched && distanceMatched;
        });
    }

    createSimpleMapFallback() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;
        const users = this.getFilteredUsers();
        mapContainer.innerHTML = `
            <div class="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><text y=\"50\" font-size=\"80\">🗺️</text></svg>'); background-size: 200px; background-repeat: repeat;"></div>
                <div class="relative z-10 text-center w-full h-full">
                    <div class="text-6xl mt-20 mb-4">📍</div>
                    <p class="text-gray-600 font-medium text-lg mb-2">${this.myProfile.location}</p>
                    <p class="text-gray-400 text-sm">已定位到您的位置</p>
                    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                        <div class="relative">
                            <div class="w-16 h-16 rounded-full p-[3px] bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl">
                                <img src="${this.myProfile.avatar}" class="w-full h-full rounded-full object-cover border-2 border-white">
                            </div>
                            <span class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">我</span>
                        </div>
                    </div>
                    ${users.map((u, i) => `
                        <div class="relative cursor-pointer transform hover:scale-110 transition-transform" onclick="window.pawMateApp.showUserCard(${u.id})" style="position:absolute;left:${220 + Math.cos(i * 60 * Math.PI / 180) * 180}px;top:${250 + Math.sin(i * 60 * Math.PI / 180) * 180}px;">
                            <img src="${u.avatar}" class="w-12 h-12 rounded-full border-3 border-white shadow-lg">
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        this.loadNearbyUsersList();
    }

    createUserMarkerIcon(user) {
        return L.divIcon({
            html: `
                <div style="background:white;border-radius:999px;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,0.24);">
                    <img src="${user.avatar}" style="width:32px;height:32px;border-radius:999px;display:block;">
                </div>
            `,
            className: '',
            iconSize: [40, 40]
        });
    }

    createMyMarkerIcon() {
        return L.divIcon({
            html: `
                <div style="position:relative;">
                    <div style="width:56px;height:56px;border-radius:999px;padding:3px;background:linear-gradient(135deg,#2563eb,#06b6d4);box-shadow:0 8px 18px rgba(37,99,235,.35);">
                        <img src="${this.myProfile.avatar}" style="width:100%;height:100%;border-radius:999px;border:2px solid #fff;display:block;">
                    </div>
                    <span style="position:absolute;top:-6px;right:-6px;background:#1d4ed8;color:#fff;font-size:11px;line-height:1;padding:4px 6px;border-radius:999px;font-weight:700;">我</span>
                </div>
            `,
            className: '',
            iconSize: [56, 56],
            iconAnchor: [28, 28]
        });
    }

    addUserMarkers() {
        if (!this.map) return;
        this.userMarkers.forEach((marker) => this.map.removeLayer(marker));
        this.userMarkers = [];
        this.getFilteredUsers().forEach((user) => {
            const marker = L.marker(user.position, { icon: this.createUserMarkerIcon(user) })
                .addTo(this.map)
                .on('click', () => this.showUserCard(user.id));
            this.userMarkers.push(marker);
        });
    }

    addMyLocationMarker() {
        if (!this.map) return;
        if (!this.myLocationMarker) {
            this.myLocationMarker = L.marker(this.userLocation, { icon: this.createMyMarkerIcon() }).addTo(this.map);
            this.myLocationCircle = L.circle(this.userLocation, {
                radius: 80,
                color: '#3b82f6',
                fillColor: '#60a5fa',
                fillOpacity: 0.12,
                weight: 1
            }).addTo(this.map);
            return;
        }
        this.myLocationMarker.setLatLng(this.userLocation);
        if (this.myLocationCircle) this.myLocationCircle.setLatLng(this.userLocation);
    }

    refreshMapUsers() {
        if (this.map) {
            this.addMyLocationMarker();
            this.addUserMarkers();
        } else {
            this.createSimpleMapFallback();
        }
        this.loadNearbyUsersList();
    }

    centerMap() {
        const onSuccess = (position) => {
            this.userLocation = [position.coords.latitude, position.coords.longitude];
            this.updateUserDistances();
            if (this.map) this.map.setView(this.userLocation, 15);
            this.refreshMapUsers();
            this.showToast('定位成功，已更新附近狗友');
        };
        const onFail = () => {
            if (this.map) this.map.setView(this.userLocation, 15);
            this.refreshMapUsers();
            this.showToast('已定位到当前位置');
        };
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onSuccess, onFail, { enableHighAccuracy: true, timeout: 8000 });
            return;
        }
        onFail();
    }

    toggleFilter() {
        const breeds = ['全部', ...new Set(this.users.map((u) => u.breed))];
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center';
        modal.id = 'mapFilterModal';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-xl font-bold text-gray-900">地图筛选</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-5 space-y-5">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">犬种</label>
                        <select id="filterBreed" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                            ${breeds.map((breed) => `<option value="${breed}" ${breed === this.filterState.breed ? 'selected' : ''}>${breed}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="text-sm font-semibold text-gray-700">最大距离</label>
                            <span id="distanceLabel" class="text-sm text-blue-600 font-semibold">${this.filterState.maxDistance}m</span>
                        </div>
                        <input type="range" id="filterDistance" min="100" max="2000" step="100" value="${this.filterState.maxDistance}" class="w-full" oninput="document.getElementById('distanceLabel').textContent=this.value+'m'">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="window.pawMateApp.resetMapFilter()" class="py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">重置</button>
                        <button onclick="window.pawMateApp.applyMapFilter()" class="py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">应用</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    applyMapFilter() {
        const breed = document.getElementById('filterBreed')?.value || '全部';
        const maxDistance = parseInt(document.getElementById('filterDistance')?.value || '1000', 10);
        this.filterState = { breed, maxDistance };
        document.getElementById('mapFilterModal')?.remove();
        this.refreshMapUsers();
        this.showToast(`已筛选：${breed} · ${maxDistance}m内`);
    }

    resetMapFilter() {
        this.filterState = { breed: '全部', maxDistance: 1000 };
        document.getElementById('mapFilterModal')?.remove();
        this.refreshMapUsers();
        this.showToast('筛选条件已重置');
    }

    loadNearbyUsersList() {
        const container = document.getElementById('nearbyUsersList');
        if (!container) return;
        const users = this.getFilteredUsers();
        if (users.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-400">没有符合筛选条件的狗友</div>';
            return;
        }
        container.innerHTML = users.map((u) => `
            <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl cursor-pointer hover:from-blue-50 hover:to-purple-50 transition-all shadow-sm hover:shadow-md" onclick="window.pawMateApp.showUserCard(${u.id})">
                <div class="relative">
                    <img src="${u.avatar}" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow">
                    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 text-sm">${u.name}</h4>
                    <p class="text-xs text-gray-500 truncate">${u.breed} · ${u.distance}</p>
                </div>
                <span class="text-xs text-green-600 font-medium">${u.lastActive}</span>
            </div>
        `).join('');
    }
    
    showUserCard(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        this.currentUser = user;
        const card = document.getElementById('userCard');
        if (!card) return;
        document.getElementById('cardAvatar').src = user.avatar;
        document.getElementById('cardName').textContent = user.name;
        document.getElementById('cardOwner').textContent = `主人：${user.owner}`;
        document.getElementById('cardBreed').textContent = user.breed;
        document.getElementById('cardAge').textContent = user.age;
        document.getElementById('cardGender').textContent = user.gender;
        document.getElementById('cardDistance').textContent = user.distance;
        document.getElementById('cardStatus').textContent = user.status;
        document.getElementById('cardLastActive').textContent = `${user.lastActive}在线`;
        card.classList.remove('hidden');
        this.showToast(`查看${user.name}的资料`);
    }
    
    hideUserCard() {
        const card = document.getElementById('userCard');
        if (card) card.classList.add('hidden');
    }
    
    testUserCard() {
        this.showUserCard(1);
    }
    
    startChat() {
        if (!this.currentUser) { this.showToast('请先选择一个用户'); return; }
        let chat = this.chats.find((c) => c.name.includes(this.currentUser.name));
        if (!chat) {
            chat = {
                id: Date.now(),
                name: `${this.currentUser.name}的主人`,
                avatar: this.currentUser.avatar,
                lastMessage: '你好，很高兴认识你',
                time: '刚刚',
                unread: 0,
                online: true
            };
            this.chats.unshift(chat);
            this.chatHistories[chat.id] = [{ sender: 'them', message: '你好，很高兴认识你', time: '刚刚' }];
            this.loadMessagesContent();
        }
        this.openChatDetail(chat.id);
    }
    
    createMeetup() {
        if (!this.currentUser) { this.showToast('请先选择一个用户'); return; }
        this.openMeetupModal(this.currentUser);
    }
    
    toggleFriend() {
        if (!this.currentUser) return;
        this.showToast(`已添加 ${this.currentUser.name} 为狗友！`);
    }
    
    toggleWalk() {
        this.isWalking = !this.isWalking;
        const btn = document.getElementById('walkToggleBtn');
        if (btn) {
            if (this.isWalking) {
                btn.innerHTML = '<i class="fas fa-stop text-lg"></i><span>结束遛狗</span>';
                btn.className = btn.className.replace('from-green-500 to-emerald-600', 'from-red-500 to-red-600').replace('hover:from-green-600 hover:to-emerald-700', 'hover:from-red-600 hover:to-red-700');
                this.showToast('开始遛狗模式！附近的人可以看到你');
            } else {
                btn.innerHTML = '<i class="fas fa-paw text-lg"></i><span>开始遛狗</span>';
                btn.className = btn.className.replace('from-red-500 to-red-600', 'from-green-500 to-emerald-600').replace('hover:from-red-600 hover:to-red-700', 'hover:from-green-600 hover:to-emerald-700');
                this.showToast('已结束遛狗');
            }
        }
    }
    
    // ===== 发现页（朋友圈）=====
    loadDiscoverContent() {
        this.renderStoryCircles();
        this.renderPosts();
    }

    renderStoryCircles() {
        const container = document.getElementById('storyCirclesContainer');
        if (!container) return;
        const usersWithPosts = this.users.filter((user) => this.posts.some((post) => post.userId === user.id));
        container.innerHTML = `
            <div class="flex flex-col items-center cursor-pointer flex-shrink-0" onclick="openCreatePostModal()">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-plus text-white text-2xl"></i>
                </div>
                <span class="text-sm text-gray-600 mt-3 font-medium">我的动态</span>
            </div>
            <div class="flex flex-col items-center cursor-pointer flex-shrink-0" onclick="window.pawMateApp.filterPostsByStory('all')">
                <div class="w-20 h-20 rounded-full p-1 ${this.activeStoryUserId === 'all' ? 'bg-blue-600' : 'bg-gray-200'}">
                    <div class="w-full h-full rounded-full flex items-center justify-center ${this.activeStoryUserId === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'} font-bold">全部</div>
                </div>
                <span class="text-sm mt-3 font-medium ${this.activeStoryUserId === 'all' ? 'text-blue-600' : 'text-gray-600'}">全部</span>
            </div>
            ${usersWithPosts.map((user) => `
                <div class="flex flex-col items-center cursor-pointer flex-shrink-0" onclick="window.pawMateApp.filterPostsByStory(${user.id})">
                    <div class="w-20 h-20 rounded-full p-1 ${this.activeStoryUserId === user.id ? 'bg-gradient-to-br from-blue-500 to-cyan-400' : 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600'}">
                        <img src="${user.avatar}" alt="${user.name}" class="w-full h-full rounded-full object-cover border-2 border-white">
                    </div>
                    <span class="text-sm mt-3 font-medium ${this.activeStoryUserId === user.id ? 'text-blue-600' : 'text-gray-600'}">${user.name}</span>
                </div>
            `).join('')}
        `;
    }

    filterPostsByStory(userId) {
        this.activeStoryUserId = userId === 'all' ? 'all' : Number(userId);
        this.renderStoryCircles();
        this.renderPosts();
    }

    getVisiblePosts() {
        if (this.activeStoryUserId === 'all') return this.posts;
        return this.posts.filter((post) => post.userId === this.activeStoryUserId);
    }

    renderPosts() {
        const container = document.getElementById('postsContainer');
        if (!container) return;
        const visiblePosts = this.getVisiblePosts();
        if (visiblePosts.length === 0) {
            container.innerHTML = '<div class="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-400">该好友暂无动态</div>';
            return;
        }
        container.innerHTML = visiblePosts.map(post => `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
                <!-- 头部 -->
                <div class="p-4 flex items-center gap-3 cursor-pointer" onclick="window.pawMateApp.openUserProfileModal(${post.userId})">
                    <div class="relative">
                        <img src="${post.avatar}" class="w-12 h-12 rounded-full object-cover border-2 border-blue-100">
                        <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">${post.user}</h4>
                        <p class="text-xs text-gray-400">${post.owner} · ${post.time}</p>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-ellipsis-h"></i></button>
                </div>
                <!-- 内容 -->
                <div class="px-4 pb-3">
                    <p class="text-gray-800 whitespace-pre-line leading-relaxed">${post.content}</p>
                    ${post.topics ? `<div class="mt-2 flex gap-2 flex-wrap">${post.topics.map(t => `<span class="text-blue-500 text-sm">${t}</span>`).join('')}</div>` : ''}
                </div>
                <!-- 图片 -->
                ${post.image ? `<div class="cursor-pointer" onclick="window.pawMateApp.previewImage('${post.image}')"><img src="${post.image}" class="w-full max-h-[400px] object-cover"></div>` : ''}
                <!-- 互动栏 -->
                <div class="px-4 py-3 flex items-center justify-between border-t border-gray-100">
                    <div class="flex gap-6">
                        <button onclick="window.pawMateApp.likePost(${post.id})" class="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors ${post.liked ? 'text-red-500' : ''}">
                            <i class="${post.liked ? 'fas' : 'far'} fa-heart text-lg"></i>
                            <span>${post.likes}</span>
                        </button>
                        <button onclick="window.pawMateApp.openCommentModal(${post.id})" class="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                            <i class="far fa-comment text-lg"></i>
                            <span>${post.comments}</span>
                        </button>
                        <button class="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors" onclick="window.pawMateApp.showToast('已分享')">
                            <i class="far fa-share-square text-lg"></i>
                            <span>分享</span>
                        </button>
                    </div>
                </div>
                <!-- 评论预览 -->
                ${post.commentList && post.commentList.length > 0 ? `
                    <div class="px-4 pb-4 space-y-2">
                        ${post.commentList.slice(0, 2).map(c => `
                            <div class="flex gap-2">
                                <img src="${c.avatar}" class="w-8 h-8 rounded-full">
                                <div class="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                    <span class="font-semibold text-sm text-blue-600">${c.user}</span>
                                    <span class="text-sm text-gray-700">${c.content}</span>
                                    <span class="text-xs text-gray-400 ml-2">${c.time}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;
            this.renderPosts();
            this.showToast(post.liked ? '❤️ 已点赞' : '已取消点赞');
        }
    }
    
    openCommentModal(postId) {
        this.currentPostId = postId;
        const post = this.posts.find(p => p.id === postId);
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center';
        modal.id = 'commentModalDynamic';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="font-bold text-lg">评论 (${post.comments})</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-5 max-h-[300px] overflow-y-auto space-y-3">
                    ${(post.commentList || []).length > 0 ? post.commentList.map(c => `
                        <div class="flex gap-3">
                            <img src="${c.avatar}" class="w-10 h-10 rounded-full">
                            <div class="flex-1">
                                <div class="font-semibold text-sm">${c.user}<span class="text-gray-400 font-normal ml-2">${c.time}</span></div>
                                <div class="text-gray-700 mt-1">${c.content}</div>
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-400 text-center py-4">暂无评论，快来抢沙发吧~</p>'}
                </div>
                <div class="p-4 border-t border-gray-100 flex gap-3">
                    <input type="text" id="commentInput" placeholder="写评论..." class="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button onclick="window.pawMateApp.submitComment()" class="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors">发送</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeCommentModal() {
        const modal = document.getElementById('commentModalDynamic');
        if (modal) modal.remove();
    }
    
    submitComment() {
        const input = document.getElementById('commentInput');
        if (!input || !input.value.trim()) { this.showToast('请输入评论内容'); return; }
        const post = this.posts.find(p => p.id === this.currentPostId);
        if (post) {
            post.comments++;
            post.commentList.push({ user: '我', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&h=100', content: input.value.trim(), time: '刚刚' });
            this.renderPosts();
            this.closeCommentModal();
            this.showToast('评论发表成功！');
        }
    }
    
    openCreatePostModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center';
        modal.id = 'createPostModalDynamic';
        modal.innerHTML = `
            <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg mx-4 shadow-2xl animate-slideUp">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500">取消</button>
                    <h3 class="font-bold">发布动态</h3>
                    <button onclick="window.pawMateApp.publishPost()" class="text-blue-500 font-semibold">发布</button>
                </div>
                <div class="p-5">
                    <textarea id="postContent" placeholder="分享你和毛孩子的故事..." class="w-full h-32 resize-none border-none focus:outline-none text-lg" rows="4"></textarea>
                    <div class="mt-4 flex items-center gap-4">
                        <label class="cursor-pointer text-blue-500"><i class="fas fa-image mr-1"></i>图片<input type="file" accept="image/*" class="hidden" onchange="window.pawMateApp.previewPostImage(event)"></label>
                        <label class="cursor-pointer text-green-500"><i class="fas fa-map-marker-alt mr-1"></i>位置</label>
                        <label class="cursor-pointer text-orange-500"><i class="fas fa-at mr-1"></i>@好友</label>
                    </div>
                    <div id="postImagePreview" class="mt-4 hidden">
                        <img id="previewImg" class="max-h-48 rounded-xl object-cover">
                        <button onclick="document.getElementById('postImagePreview').classList.add('hidden')" class="text-red-500 text-sm mt-2">移除图片</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeCreatePostModal() {
        const modal = document.getElementById('createPostModalDynamic');
        if (modal) modal.remove();
    }
    
    previewPostImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('postImagePreview');
                const img = document.getElementById('previewImg');
                const img2 = document.getElementById('postPreviewImg');
                if (preview) preview.classList.remove('hidden');
                if (img) img.src = e.target.result;
                if (img2) img2.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    removePostImage() {
        const preview = document.getElementById('postImagePreview');
        const img = document.getElementById('previewImg');
        const img2 = document.getElementById('postPreviewImg');
        if (preview) preview.classList.add('hidden');
        if (img) img.src = '';
        if (img2) img2.src = '';
    }

    toggleTopic(button) {
        if (!button) return;
        const isSelected = button.classList.contains('bg-blue-50');
        button.classList.toggle('bg-blue-50', !isSelected);
        button.classList.toggle('text-blue-600', !isSelected);
        button.classList.toggle('bg-gray-100', isSelected);
        button.classList.toggle('text-gray-600', isSelected);
    }
    
    publishPost() {
        const content = document.getElementById('postContent');
        if (!content || !content.value.trim()) { this.showToast('请输入动态内容'); return; }
        const newPost = {
            id: Date.now(), userId: 0, user: '我', owner: this.myProfile.owner,
            avatar: this.myProfile.avatar,
            time: '刚刚', content: content.value.trim(), image: null,
            likes: 0, comments: 0, liked: false, topics: [], commentList: []
        };
        const previewImg = document.getElementById('previewImg');
        const previewImg2 = document.getElementById('postPreviewImg');
        if (previewImg && previewImg.src) newPost.image = previewImg.src;
        if (!newPost.image && previewImg2 && previewImg2.src) newPost.image = previewImg2.src;
        newPost.topics = Array.from(document.querySelectorAll('.topic-tag.bg-blue-50')).map((el) => el.textContent.trim());
        this.posts.unshift(newPost);
        this.activeStoryUserId = 'all';
        this.renderStoryCircles();
        this.renderPosts();
        this.closeCreatePostModal();
        this.showToast('动态发布成功！');
    }
    
    previewImage(url) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-pointer';
        modal.onclick = () => modal.remove();
        modal.innerHTML = `<img src="${url}" class="max-w-full max-h-full object-contain">`;
        document.body.appendChild(modal);
    }
    
    openUserProfileModal(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        const userPosts = this.posts.filter(p => p.userId === userId);
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center overflow-y-auto';
        modal.id = 'userProfileModalDynamic';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 my-8 shadow-2xl animate-fadeIn">
                <div class="sticky top-0 bg-white z-10 p-5 border-b border-gray-100 flex items-center gap-4">
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 p-2"><i class="fas fa-arrow-left text-xl"></i></button>
                    <img src="${user.avatar}" class="w-12 h-12 rounded-full">
                    <div>
                        <h3 class="font-bold text-lg">${user.name}</h3>
                        <p class="text-sm text-gray-500">${user.breed} · ${user.owner}</p>
                    </div>
                </div>
                <div class="divide-y divide-gray-100">
                    ${userPosts.length > 0 ? userPosts.map(p => `
                        <div class="p-4">
                            <p class="text-gray-800 whitespace-pre-line">${p.content}</p>
                            ${p.image ? `<img src="${p.image}" class="mt-3 rounded-xl max-h-64 object-cover w-full cursor-pointer" onclick="window.pawMateApp.previewImage('${p.image}')">` : ''}
                            <div class="mt-3 flex gap-4 text-sm text-gray-500">
                                <span><i class="far fa-heart"></i> ${p.likes}</span>
                                <span><i class="far fa-comment"></i> ${p.comments}</span>
                                <span>${p.time}</span>
                            </div>
                        </div>
                    `).join('') : '<div class="p-10 text-center text-gray-400">该用户还没有发布动态</div>'}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeUserProfileModal() {
        const modal = document.getElementById('userProfileModalDynamic');
        if (modal) modal.remove();
    }
    
    handleSearch(query) {
        if (!query.trim()) { document.getElementById('searchResults').classList.add('hidden'); return; }
        const results = document.getElementById('searchResults');
        if (!results) return;
        const matchedUsers = this.users.filter(u => u.name.includes(query) || u.owner.includes(query) || u.breed.includes(query));
        const matchedPosts = this.posts.filter(p => p.content.includes(query) || p.user.includes(query));
        const matchedProducts = this.products.filter(p => p.name.includes(query));
        results.innerHTML = `
            <div class="bg-white rounded-2xl shadow-lg p-4 space-y-4">
                ${matchedUsers.length > 0 ? `<div><h4 class="font-bold text-sm text-gray-500 mb-2">用户</h4>${matchedUsers.map(u => `
                    <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onclick="window.pawMateApp.showUserCard(${u.id});document.getElementById('searchResults').classList.add('hidden');">
                        <img src="${u.avatar}" class="w-10 h-10 rounded-full"><span class="font-medium">${u.name}</span><span class="text-gray-400 text-sm">${u.breed}</span>
                    </div>
                `).join('')}</div>` : ''}
                ${matchedPosts.length > 0 ? `<div><h4 class="font-bold text-sm text-gray-500 mb-2">动态</h4>${matchedPosts.slice(0,3).map(p => `
                    <div class="p-2 hover:bg-gray-50 rounded-xl cursor-pointer"><span class="font-medium">${p.user}</span>: ${p.content.substring(0,50)}...</div>
                `).join('')}</div>` : ''}
                ${matchedProducts.length > 0 ? `<div><h4 class="font-bold text-sm text-gray-500 mb-2">商品</h4>${matchedProducts.slice(0,3).map(p => `
                    <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onclick="window.pawMateApp.openProductDetail(${p.id});document.getElementById('searchResults').classList.add('hidden');">
                        <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover"><span class="font-medium">${p.name}</span><span class="text-red-500">￥${p.price}</span>
                    </div>
                `).join('')}</div>` : ''}
                ${matchedUsers.length + matchedPosts.length + matchedProducts.length === 0 ? '<p class="text-gray-400 text-center py-4">没有找到相关内容</p>' : ''}
            </div>
        `;
        results.classList.remove('hidden');
    }
    
    // ===== 消息页 =====
    loadMessagesContent() {
        const container = document.getElementById('chatList');
        if (!container) return;
        container.innerHTML = this.chats.map(chat => `
            <div class="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors" onclick="window.pawMateApp.openChatDetail(${chat.id})">
                <div class="relative">
                    <img src="${chat.avatar}" class="w-14 h-14 rounded-full object-cover">
                    ${chat.online ? '<div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>' : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="font-semibold text-gray-900">${chat.name}</h4>
                        <span class="text-xs text-gray-400">${chat.time}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <p class="text-sm text-gray-500 truncate pr-2">${chat.lastMessage}</p>
                        ${chat.unread > 0 ? `<span class="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">${chat.unread}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getNowTimeText() {
        return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    bumpChatToTop(chatId) {
        const idx = this.chats.findIndex((chat) => chat.id === chatId);
        if (idx <= 0) return;
        const [chat] = this.chats.splice(idx, 1);
        this.chats.unshift(chat);
    }
    
    openChatDetail(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;
        const history = this.chatHistories[chatId] || [];
        if (chat.unread > 0) {
            chat.unread = 0;
            this.loadMessagesContent();
        }
        const page = document.getElementById('chatDetailPage');
        if (!page) return;
        this.currentChatId = chatId;
        document.getElementById('chatAvatar').src = chat.avatar;
        document.getElementById('chatName').textContent = chat.name;
        document.getElementById('chatMessages').innerHTML = history.map(m => m.sender === 'me' ? `
            <div class="flex justify-end">
                <div>
                    <div class="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[70%]">${m.message}</div>
                    <div class="text-xs text-gray-400 mt-1 text-right">${m.time || ''}</div>
                </div>
            </div>
        ` : `
            <div class="flex justify-start">
                <div>
                    <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md max-w-[70%]">${m.message}</div>
                    <div class="text-xs text-gray-400 mt-1">${m.time || ''}</div>
                </div>
            </div>
        `).join('') || '<div class="text-center text-gray-400 py-10">暂无聊天记录，发条消息打个招呼吧~</div>';
        page.classList.remove('hidden'); page.style.display = 'flex';
        page.dataset.chatId = chatId;
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    closeChatDetail() {
        const page = document.getElementById('chatDetailPage');
        if (page) { page.classList.add('hidden'); page.style.display = 'none'; }
        this.currentChatId = null;
    }
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const page = document.getElementById('chatDetailPage');
        if (!input || !input.value.trim() || !page) return;
        const chatId = parseInt(page.dataset.chatId);
        if (!this.chatHistories[chatId]) this.chatHistories[chatId] = [];
        const content = input.value.trim();
        const timeText = this.getNowTimeText();
        this.chatHistories[chatId].push({ sender: 'me', message: content, time: timeText });
        const currentChat = this.chats.find((chat) => chat.id === chatId);
        if (currentChat) {
            currentChat.lastMessage = content;
            currentChat.time = timeText;
            currentChat.unread = 0;
        }
        this.bumpChatToTop(chatId);
        this.loadMessagesContent();
        input.value = '';
        this.openChatDetail(chatId);
        this.showToast('消息已发送');
        // 模拟回复
        setTimeout(() => {
            const replies = ['好的呀！', '哈哈 太有趣了', '下次一起遛狗吧！', '我家狗狗也想认识你家的', '没问题！'];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            const nowTime = this.getNowTimeText();
            this.chatHistories[chatId].push({ sender: 'them', message: reply, time: nowTime });
            const chat = this.chats.find((item) => item.id === chatId);
            if (chat) {
                chat.lastMessage = reply;
                chat.time = nowTime;
                const isCurrentOpen = !document.getElementById('chatDetailPage').classList.contains('hidden') && this.currentChatId === chatId;
                if (!isCurrentOpen) chat.unread += 1;
            }
            this.bumpChatToTop(chatId);
            this.loadMessagesContent();
            if (!document.getElementById('chatDetailPage').classList.contains('hidden') && this.currentChatId === chatId) {
                this.openChatDetail(chatId);
            }
        }, 1000 + Math.random()*2000);
    }
    
    // ===== 商城页 =====
    loadShopContent() {
        this.renderShopCategories();
        this.renderProducts();
    }

    getAllCategories() {
        return ['热门', ...new Set(this.products.map((p) => p.category))];
    }

    parseSalesNumber(salesText) {
        const numberPart = parseInt((salesText || '0').replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(numberPart) ? numberPart : 0;
    }

    getVisibleProducts() {
        if (this.activeShopCategory === '热门') {
            return [...this.products].sort((a, b) => this.parseSalesNumber(b.sales) - this.parseSalesNumber(a.sales));
        }
        return this.products.filter((product) => product.category === this.activeShopCategory);
    }

    renderShopCategories() {
        const container = document.getElementById('shopCategories');
        if (!container) return;
        const categories = this.getAllCategories();
        container.innerHTML = categories.map((category) => `
            <button onclick="window.pawMateApp.setShopCategory('${category}')" class="px-6 py-3 rounded-full font-medium whitespace-nowrap shadow-sm transition-all ${
                this.activeShopCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }">${category}</button>
        `).join('');
    }

    setShopCategory(category) {
        this.activeShopCategory = category;
        this.renderShopCategories();
        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('productsContainer');
        if (!container) return;
        const products = this.getVisibleProducts();
        if (products.length === 0) {
            container.innerHTML = '<div class="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-400">当前分类暂无商品</div>';
            return;
        }
        container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${products.map(p => `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden product-card cursor-pointer" onclick="window.pawMateApp.openProductDetail(${p.id})">
                <div class="relative">
                    <img src="${p.image}" class="w-full h-48 object-cover">
                    <span class="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">-${Math.round((1-p.price/p.originalPrice)*100)}%</span>
                </div>
                <div class="p-4">
                    <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">${p.name}</h4>
                    <div class="flex items-center gap-1 mb-2">
                        ${Array(5).fill(0).map((_,i)=>`<i class="fas fa-star text-${i<Math.floor(p.rating)?'yellow':'gray'}-400 text-xs"></i>`).join('')}
                        <span class="text-xs text-gray-400 ml-1">${p.rating}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div><span class="text-red-500 font-bold text-lg">￥${p.price}</span><span class="text-gray-400 text-sm line-through ml-2">￥${p.originalPrice}</span></div>
                        <button onclick="event.stopPropagation();window.pawMateApp.addToCart(${p.id})" class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"><i class="fas fa-plus text-sm"></i></button>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">${p.sales}</p>
                </div>
            </div>
        `).join('')}</div>`;
    }
    
    openProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        this.currentProductId = productId;
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center overflow-y-auto';
        modal.id = 'productDetailModal';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-3xl mx-4 my-8 shadow-2xl animate-fadeIn">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div class="bg-gray-100 p-8 flex items-center justify-center"><img src="${product.image}" class="max-w-full max-h-96 object-contain rounded-xl"></div>
                    <div class="p-8">
                        <button onclick="this.closest('.fixed').remove()" class="float-right text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                        <h2 class="text-2xl font-bold text-gray-900 mt-0 mb-2">${product.name}</h2>
                        <div class="flex items-center gap-2 mb-4">
                            ${Array(5).fill(0).map((_,i)=>`<i class="fas fa-star text-yellow-400"></i>`).join('')}
                            <span class="text-gray-500">${product.rating}分 · ${product.sales}</span>
                        </div>
                        <div class="mb-6"><span class="text-3xl font-bold text-red-500">￥${product.price}</span><span class="text-gray-400 line-through ml-3">￥${product.originalPrice}</span></div>
                        <p class="text-gray-600 mb-6 leading-relaxed">精选优质产品，专为爱宠人士打造。高品质材料，安全环保，让您的毛孩子享受最好的呵护。</p>
                        <div class="space-y-4">
                            <div class="flex gap-3">
                                ${['标准版','升级版','豪华版'].map(s=>`<button class="px-4 py-2 border rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors spec-btn" onclick="this.classList.add('border-blue-500','text-blue-500');this.parentElement.querySelectorAll('.spec-btn').forEach(b=>{if(b!==this)b.classList.remove('border-blue-500','text-blue-500')})">${s}</button>`).join('')}
                            </div>
                            <div class="flex gap-3">
                                <button onclick="window.pawMateApp.addToCartFromDetail()" class="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"><i class="fas fa-shopping-cart mr-2"></i>加入购物车</button>
                                <button onclick="window.pawMateApp.buyNow()" class="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors">立即购买</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeProductDetail() {
        const modal = document.getElementById('productDetailModal');
        if (modal) modal.remove();
    }
    
    selectSpec(spec) {}
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        const existing = this.cart.find(item => item.id === productId);
        if (existing) existing.quantity++; else this.cart.push({ ...product, quantity: 1 });
        this.writeStorage('pawmate_cart', this.cart);
        this.updateCartBadge();
        this.renderCart();
        this.showToast(`${product.name} 已加入购物车`);
    }
    
    addToCartFromDetail() {
        if (!this.currentProductId) {
            this.showToast('未找到商品信息');
            return;
        }
        this.addToCart(this.currentProductId);
        this.closeProductDetail();
    }
    
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.writeStorage('pawmate_cart', this.cart);
        this.renderCart();
        this.updateCartBadge();
    }

    updateCartQuantity(itemId, delta) {
        const item = this.cart.find((product) => product.id === itemId);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            this.removeFromCart(itemId);
            return;
        }
        this.writeStorage('pawmate_cart', this.cart);
        this.renderCart();
        this.updateCartBadge();
    }
    
    updateCartBadge() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        ['headerCartBadge', 'cartBadge', 'cartBadge2'].forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = count;
            el.classList.toggle('hidden', count === 0);
        });
    }
    
    openCart() {
        const existing = document.getElementById('cartModal');
        if (existing) {
            this.renderCart();
            return;
        }
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center overflow-y-auto';
        modal.id = 'cartModal';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 my-8 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 id="cartTitle" class="text-xl font-bold">购物车</h3>
                    <button onclick="window.pawMateApp.closeCart()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div id="cartItemsContainer" class="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                </div>
                <div class="p-5 border-t border-gray-100">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600">合计：</span>
                        <span id="cartTotalPrice" class="text-2xl font-bold text-red-500">￥0</span>
                    </div>
                    <button id="cartCheckoutBtn" onclick="window.pawMateApp.checkout()" class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all">去结算</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.renderCart();
    }
    
    closeCart() {
        const modal = document.getElementById('cartModal');
        if (modal) modal.remove();
    }

    toggleCartEdit() {
        this.showToast('编辑模式已启用：可增减数量和删除商品');
    }

    toggleSelectAll() {
        this.showToast('当前版本默认全选已购买商品');
    }
    
    renderCart() {
        const container = document.getElementById('cartItemsContainer');
        if (!container) return;
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const title = document.getElementById('cartTitle');
        if (title) title.textContent = `购物车 (${count})`;
        const totalEl = document.getElementById('cartTotalPrice');
        if (totalEl) totalEl.textContent = `￥${total}`;
        const checkoutBtn = document.getElementById('cartCheckoutBtn');
        if (checkoutBtn) checkoutBtn.disabled = this.cart.length === 0;
        if (this.cart.length === 0) {
            container.innerHTML = '<div class="py-16 text-center text-gray-400">购物车是空的，快去选购吧</div>';
            return;
        }
        container.innerHTML = this.cart.map((item) => `
            <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <img src="${item.image}" class="w-20 h-20 rounded-lg object-cover">
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 line-clamp-2">${item.name}</h4>
                    <p class="text-red-500 font-bold mt-1">￥${item.price}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.pawMateApp.decreaseCartQuantity(${item.id})" class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300">-</button>
                    <span class="w-8 text-center font-semibold">${item.quantity}</span>
                    <button onclick="window.pawMateApp.increaseCartQuantity(${item.id})" class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300">+</button>
                </div>
                <button onclick="window.pawMateApp.removeFromCart(${item.id})" class="text-red-500 hover:text-red-700 p-2"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    }

    buyNow() {
        if (!this.currentProductId) {
            this.showToast('未找到商品');
            return;
        }
        this.addToCart(this.currentProductId);
        this.closeProductDetail();
        this.checkout();
    }
    
    checkout() {
        if (this.cart.length === 0) {
            this.showToast('购物车为空，无法结算');
            return;
        }
        this.closeCart();
        this.openCheckoutModal();
    }

    openCheckoutModal() {
        const existing = document.getElementById('checkoutModal');
        if (existing) existing.remove();
        const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const modal = document.createElement('div');
        modal.id = 'checkoutModal';
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 my-8 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-xl font-bold">确认订单</h3>
                    <button onclick="window.pawMateApp.closeCheckoutModal()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-5 space-y-4 max-h-[420px] overflow-y-auto">
                    <div class="p-4 bg-gray-50 rounded-xl">
                        <div class="font-semibold text-gray-900 mb-1">收货信息</div>
                        <div class="text-sm text-gray-600">张小姐 138****8888</div>
                        <div class="text-sm text-gray-600 mt-1">北京市朝阳区某某街道某某小区1号楼101室</div>
                    </div>
                    ${this.cart.map((item) => `
                        <div class="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                            <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover">
                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-gray-900 line-clamp-2">${item.name}</h4>
                                <p class="text-sm text-gray-500 mt-1">数量：x${item.quantity}</p>
                            </div>
                            <span class="text-red-500 font-bold">￥${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="p-5 border-t border-gray-100">
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-gray-600"><span>商品金额</span><span>￥${subtotal}</span></div>
                        <div class="flex justify-between text-gray-600"><span>运费</span><span>￥0</span></div>
                        <div class="flex justify-between text-lg font-bold text-gray-900"><span>应付总额</span><span class="text-red-500">￥${subtotal}</span></div>
                    </div>
                    <button onclick="window.pawMateApp.submitOrderFromCheckout()" class="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-700 transition-all">提交订单</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.remove();
    }

    submitOrderFromCheckout() {
        if (this.cart.length === 0) {
            this.showToast('购物车为空，无法提交订单');
            return;
        }
        const total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderNo = `PM${Date.now()}`;
        const now = new Date();
        const order = {
            orderNo,
            createdAt: now.toLocaleString('zh-CN', { hour12: false }),
            status: '待发货',
            items: this.cart.map((item) => ({
                id: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: total,
            shippingFee: 0,
            totalAmount: total,
            paymentMethod: '微信支付',
            address: '北京市朝阳区某某街道某某小区1号楼101室'
        };
        this.orders.unshift(order);
        this.writeStorage('pawmate_orders', this.orders);
        this.cart = [];
        this.writeStorage('pawmate_cart', this.cart);
        this.updateCartBadge();
        this.renderCart();
        this.closeCart();
        this.closeCheckoutModal();
        this.showOrderSuccess(order);
    }

    showOrderSuccess(order) {
        const existing = document.getElementById('orderSuccessModal');
        if (existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = 'orderSuccessModal';
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-md mx-4 p-8 text-center shadow-2xl animate-fadeIn">
                <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                    <i class="fas fa-check text-white text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">订单提交成功</h3>
                <p class="text-gray-600 mb-1">订单号：${order.orderNo}</p>
                <p class="text-gray-600 mb-6">实付金额：￥${order.totalAmount}</p>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="window.pawMateApp.closeOrderSuccess()" class="py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">继续逛逛</button>
                    <button onclick="window.pawMateApp.closeOrderSuccess();window.pawMateApp.openOrdersPage();" class="py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600">查看订单</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    closeOrderSuccess() {
        const modal = document.getElementById('orderSuccessModal');
        if (modal) modal.remove();
    }

    openOrdersPage() {
        const existing = document.getElementById('ordersModal');
        if (existing) {
            this.renderOrdersList();
            return;
        }
        const tabs = ['全部', '待付款', '待发货', '待收货', '已完成'];
        const modal = document.createElement('div');
        modal.id = 'ordersModal';
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-4xl mx-4 my-8 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-2xl font-bold text-gray-900">我的订单</h3>
                    <button onclick="window.pawMateApp.closeOrdersPage()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="px-5 pt-4">
                    <div id="orderTabs" class="flex gap-3 overflow-x-auto pb-3">
                        ${tabs.map((tab) => `<button onclick="window.pawMateApp.changeOrderTab('${tab}')" class="order-tab px-4 py-2 rounded-full text-sm font-medium ${tab === this.orderFilterStatus ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}" data-status="${tab}">${tab}</button>`).join('')}
                    </div>
                </div>
                <div id="ordersListContainer" class="p-5 space-y-4 max-h-[550px] overflow-y-auto bg-gray-50"></div>
            </div>
        `;
        document.body.appendChild(modal);
        this.renderOrdersList();
    }

    closeOrdersPage() {
        const modal = document.getElementById('ordersModal');
        if (modal) modal.remove();
    }

    changeOrderTab(status) {
        this.orderFilterStatus = status;
        const tabs = document.querySelectorAll('#orderTabs .order-tab');
        tabs.forEach((tab) => {
            const isActive = tab.dataset.status === status;
            tab.className = `order-tab px-4 py-2 rounded-full text-sm font-medium ${isActive ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`;
        });
        this.renderOrdersList();
    }

    renderOrdersList() {
        const container = document.getElementById('ordersListContainer');
        if (!container) return;
        const list = this.orderFilterStatus === '全部'
            ? this.orders
            : this.orders.filter((order) => order.status === this.orderFilterStatus);
        if (list.length === 0) {
            container.innerHTML = '<div class="bg-white rounded-2xl p-12 text-center text-gray-400">暂无订单记录</div>';
            return;
        }
        container.innerHTML = list.map((order) => `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex items-center justify-between text-sm">
                    <div class="space-y-1">
                        <div class="text-gray-500">订单号：<span class="text-gray-900 font-semibold">${order.orderNo}</span></div>
                        <div class="text-gray-500">下单时间：${order.createdAt}</div>
                    </div>
                    <span class="text-red-500 font-semibold">${order.status}</span>
                </div>
                <div class="p-4 space-y-3">
                    ${order.items.map((item) => `
                        <div class="flex items-center gap-3">
                            <img src="${item.image}" class="w-14 h-14 rounded-lg object-cover">
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-gray-900 line-clamp-2">${item.name}</h4>
                                <p class="text-sm text-gray-500 mt-1">单价：￥${item.price} · 数量：x${item.quantity}</p>
                            </div>
                            <span class="font-semibold text-gray-900">￥${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <div class="text-sm text-gray-500">支付方式：${order.paymentMethod || '微信支付'}</div>
                    <div class="text-lg font-bold text-red-500">实付 ￥${order.totalAmount}</div>
                </div>
            </div>
        `).join('');
    }
    
    // ===== 个人中心 =====
    loadProfileContent() {
        this.renderMyDogs();
        this.syncProfileFromSettings();
    }
    
    renderMyDogs() {
        const container = document.getElementById('myDogsList');
        if (!container) return;
        container.innerHTML = this.myDogs.map(dog => `
            <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <img src="${dog.avatar}" class="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-lg">
                <span class="font-semibold text-gray-800 block">${dog.name}</span>
                <span class="text-sm text-gray-500">${dog.breed} · ${dog.age}岁 · ${dog.gender}</span>
            </div>
        `).join('') + `
            <div class="text-center p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors" onclick="window.pawMateApp.openAddDogModal()">
                <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 border-4 border-dashed border-gray-300">
                    <i class="fas fa-plus text-gray-400 text-2xl"></i>
                </div>
                <span class="text-gray-500 font-medium">添加狗狗</span>
            </div>
        `;
    }
    
    openAddDogModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center';
        modal.id = 'addDogModalDynamic';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-xl font-bold">添加毛孩子</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-5 space-y-4">
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">名字</label><input type="text" id="newDogName" placeholder="给狗狗起个名字" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">品种</label><select id="newDogBreed" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"><option>金毛寻回犬</option><option>柴犬</option><option>边境牧羊犬</option><option>贵宾犬</option><option>哈士奇</option><option>拉布拉多</option><option>柯基</option><option>萨摩耶</option><option>其他</option></select></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">年龄</label><input type="number" id="newDogAge" placeholder="岁" min="0" max="30" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">性别</label><select id="newDogGender" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="公">公</option><option value="母">母</option></select></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">体重</label><input type="text" id="newDogWeight" placeholder="kg" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                    </div>
                    <button onclick="window.pawMateApp.addNewDog()" class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all">添加</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeAddDogModal() {
        const modal = document.getElementById('addDogModalDynamic');
        if (modal) modal.remove();
    }
    
    addNewDog() {
        const name = document.getElementById('newDogName').value.trim();
        const breed = document.getElementById('newDogBreed').value;
        const age = document.getElementById('newDogAge').value;
        const gender = document.getElementById('newDogGender').value;
        const weight = document.getElementById('newDogWeight').value.trim() || '未知';
        if (!name) { this.showToast('请输入狗狗名字'); return; }
        const avatars = [
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=150&h=150',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=150&h=150',
            'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=150&h=150',
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=150&h=150',
            'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=150&h=150',
            'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&h=150'
        ];
        this.myDogs.push({ id: Date.now(), name, breed, age: parseInt(age)||1, gender, weight, avatar: avatars[Math.floor(Math.random()*avatars.length)] });
        this.renderMyDogs();
        this.closeAddDogModal();
        this.showToast(`${name} 添加成功！`);
    }

    openSettingsModal() {
        const s = this.settings;
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 my-8 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-2xl font-bold text-gray-900">设置中心</h3>
                    <button onclick="window.pawMateApp.closeSettingsModal()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
                    <section class="space-y-4">
                        <h4 class="font-bold text-gray-900">账号信息</h4>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">昵称</label>
                            <input id="settingNickname" type="text" maxlength="20" value="${s.nickname}" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">手机号</label>
                            <input id="settingPhone" type="tel" maxlength="11" value="${s.phone}" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </section>
                    <section class="space-y-4">
                        <h4 class="font-bold text-gray-900">安全设置（修改密码）</h4>
                        <input id="settingOldPwd" type="password" placeholder="当前密码" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <input id="settingNewPwd" type="password" placeholder="新密码（至少8位，需包含字母和数字）" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <input id="settingConfirmPwd" type="password" placeholder="确认新密码" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </section>
                    <section class="space-y-4">
                        <h4 class="font-bold text-gray-900">通知偏好</h4>
                        <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span>消息通知</span><input id="settingMsgNotify" type="checkbox" class="w-5 h-5" ${s.messageNotification ? 'checked' : ''}></label>
                        <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span>约玩通知</span><input id="settingMeetupNotify" type="checkbox" class="w-5 h-5" ${s.meetupNotification ? 'checked' : ''}></label>
                        <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span>订单通知</span><input id="settingOrderNotify" type="checkbox" class="w-5 h-5" ${s.orderNotification ? 'checked' : ''}></label>
                        <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span>营销通知</span><input id="settingMarketingNotify" type="checkbox" class="w-5 h-5" ${s.marketingNotification ? 'checked' : ''}></label>
                    </section>
                    <section class="space-y-4">
                        <h4 class="font-bold text-gray-900">隐私与权限</h4>
                        <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span>位置对狗友可见</span><input id="settingLocationShare" type="checkbox" class="w-5 h-5" ${s.allowLocationShare ? 'checked' : ''}></label>
                        <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span>私密账号</span><input id="settingPrivateAccount" type="checkbox" class="w-5 h-5" ${s.privateAccount ? 'checked' : ''}></label>
                        <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span>免打扰模式</span><input id="settingQuietMode" type="checkbox" class="w-5 h-5" ${s.quietMode ? 'checked' : ''}></label>
                        <div class="grid grid-cols-2 gap-3">
                            <input id="settingQuietStart" type="time" value="${s.quietStart}" class="px-4 py-3 border border-gray-200 rounded-xl">
                            <input id="settingQuietEnd" type="time" value="${s.quietEnd}" class="px-4 py-3 border border-gray-200 rounded-xl">
                        </div>
                    </section>
                </div>
                <div class="p-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <button onclick="window.pawMateApp.resetSettingsDefaults()" class="py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">恢复默认</button>
                    <button onclick="window.pawMateApp.saveSettings()" class="py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">保存设置</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.remove();
    }

    resetSettingsDefaults() {
        this.settings = { ...this.defaultSettings };
        this.writeStorage('pawmate_settings', this.settings);
        this.closeSettingsModal();
        this.openSettingsModal();
        this.syncProfileFromSettings();
        this.showToast('设置已恢复默认');
    }

    saveSettings() {
        const nickname = document.getElementById('settingNickname')?.value.trim() || '';
        const phone = document.getElementById('settingPhone')?.value.trim() || '';
        const oldPwd = document.getElementById('settingOldPwd')?.value || '';
        const newPwd = document.getElementById('settingNewPwd')?.value || '';
        const confirmPwd = document.getElementById('settingConfirmPwd')?.value || '';
        if (nickname.length < 2 || nickname.length > 20) {
            this.showToast('昵称长度需在2-20个字符之间');
            return;
        }
        if (!/^1\d{10}$/.test(phone)) {
            this.showToast('请输入有效的11位手机号');
            return;
        }
        const hasPasswordInput = oldPwd || newPwd || confirmPwd;
        if (hasPasswordInput) {
            if (!oldPwd || !newPwd || !confirmPwd) {
                this.showToast('修改密码需完整填写三个字段');
                return;
            }
            if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/.test(newPwd)) {
                this.showToast('新密码至少8位且需包含字母和数字');
                return;
            }
            if (newPwd !== confirmPwd) {
                this.showToast('两次输入的新密码不一致');
                return;
            }
            if (newPwd === oldPwd) {
                this.showToast('新密码不能与旧密码相同');
                return;
            }
        }
        this.settings = {
            nickname,
            phone,
            allowLocationShare: !!document.getElementById('settingLocationShare')?.checked,
            messageNotification: !!document.getElementById('settingMsgNotify')?.checked,
            meetupNotification: !!document.getElementById('settingMeetupNotify')?.checked,
            orderNotification: !!document.getElementById('settingOrderNotify')?.checked,
            marketingNotification: !!document.getElementById('settingMarketingNotify')?.checked,
            privateAccount: !!document.getElementById('settingPrivateAccount')?.checked,
            quietMode: !!document.getElementById('settingQuietMode')?.checked,
            quietStart: document.getElementById('settingQuietStart')?.value || '22:00',
            quietEnd: document.getElementById('settingQuietEnd')?.value || '08:00'
        };
        this.writeStorage('pawmate_settings', this.settings);
        this.syncProfileFromSettings();
        this.closeSettingsModal();
        this.showToast('设置保存成功');
    }
    
    // ===== 约玩功能 =====
    openMeetupModal(user) {
        this.currentMeetupTarget = user;
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center';
        modal.id = 'meetupModalDynamic';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-xl font-bold">约遛狗</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-5 space-y-4">
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <img src="${user.avatar}" class="w-12 h-12 rounded-full">
                        <div><div class="font-semibold">${user.name}</div><div class="text-sm text-gray-500">${user.owner}</div></div>
                    </div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">日期</label><input type="date" id="meetupDate" value="${dateStr}" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">时间</label><input type="time" id="meetupTime" value="16:00" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">地点</label><input type="text" id="meetupLocation" value="附近公园" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea id="meetupNote" placeholder="想说点什么..." rows="2" class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea></div>
                    <button onclick="window.pawMateApp.sendMeetupRequest()" class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all">发送邀请</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeMeetupModal() {
        const modal = document.getElementById('meetupModalDynamic');
        if (modal) modal.remove();
    }
    
    sendMeetupRequest() {
        if (!this.currentMeetupTarget) return;
        const date = document.getElementById('meetupDate')?.value;
        const time = document.getElementById('meetupTime')?.value;
        const location = document.getElementById('meetupLocation')?.value?.trim();
        const note = document.getElementById('meetupNote')?.value?.trim() || '';
        if (!date || !time || !location) {
            this.showToast('请完整填写约玩时间和地点');
            return;
        }
        this.meetups.unshift({
            id: Date.now(),
            targetUser: this.currentMeetupTarget.name,
            targetOwner: this.currentMeetupTarget.owner,
            targetAvatar: this.currentMeetupTarget.avatar,
            date,
            time,
            location,
            note,
            status: 'pending',
            type: 'sent'
        });
        this.showToast(`已向 ${this.currentMeetupTarget.owner} 发送约玩邀请！`);
        this.closeMeetupModal();
    }

    addQuickNote(note) {
        const textarea = document.getElementById('meetupNote');
        if (!textarea) return;
        textarea.value = textarea.value ? `${textarea.value}\n${note}` : note;
        textarea.focus();
    }
    
    openMeetupListModal() {
        const pendingCount = this.meetups.filter(m => m.status === 'pending').length;
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center overflow-y-auto';
        modal.id = 'meetupListModalDynamic';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 my-8 shadow-2xl animate-fadeIn">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-xl font-bold">我的约玩 ${pendingCount > 0 ? `<span class="text-red-500 text-sm">(${pendingCount}个待处理)</span>` : ''}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 p-2"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                    ${this.meetups.map(m => `
                        <div class="p-4 bg-gray-50 rounded-xl">
                            <div class="flex items-center gap-3 mb-3">
                                <img src="${m.targetAvatar}" class="w-12 h-12 rounded-full">
                                <div class="flex-1">
                                    <div class="font-semibold">${m.targetUser} (${m.targetOwner})</div>
                                    <div class="text-sm text-gray-500">${m.date} ${m.time} · ${m.location}</div>
                                </div>
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${
                                    m.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                    m.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }">${
                                    m.status === 'accepted' ? '已接受' :
                                    m.status === 'rejected' ? '已拒绝' :
                                    '等待回复'
                                }</span>
                            </div>
                            ${m.status === 'pending' && m.type === 'received' ? `
                                <div class="flex gap-2 justify-end">
                                    <button onclick="window.pawMateApp.respondToMeetup(${m.id},'rejected');this.closest('.fixed').remove();" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">拒绝</button>
                                    <button onclick="window.pawMateApp.respondToMeetup(${m.id},'accepted');this.closest('.fixed').remove();" class="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">接受</button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('') || '<p class="text-gray-400 text-center py-10">暂无约玩记录</p>'}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    closeMeetupListModal() {
        const modal = document.getElementById('meetupListModalDynamic');
        if (modal) modal.remove();
    }
    
    respondToMeetup(meetupId, response) {
        const meetup = this.meetups.find(m => m.id === meetupId);
        if (meetup) meetup.status = response;
        this.showToast(response === 'accepted' ? '已接受邀请！' : '已拒绝邀请');
    }
    
    // ===== Toast提示 =====
    showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'fixed top-8 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white px-6 py-3 rounded-xl font-medium z-[9999] opacity-0 transition-all duration-300 shadow-2xl backdrop-blur';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 2000);
    }
    
    // ===== 加载所有内容 =====
    loadAllContent() {
        this.loadDiscoverContent();
        this.loadMessagesContent();
        this.loadShopContent();
        this.loadProfileContent();
        this.updateCartBadge();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.pawMateApp = new PawMateApp();
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
.animate-fadeIn { animation: fadeIn 0.2s ease-out }
.animate-slideUp { animation: slideUp 0.3s ease-out }
.line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden }
`;
document.head.appendChild(style);
