const app = getApp();

Component({
  properties: {
    // 是否显示引导
    show: {
      type: Boolean,
      value: false
    },
    // 引导类型
    guideType: {
      type: String,
      value: ''
    },
    // 是否显示跳过按钮
    showSkip: {
      type: Boolean,
      value: true
    }
  },

  data: {
    currentStep: 0,
    isLastStep: false,
    guideData: {}
  },

  lifetimes: {
    attached() {
      this.initGuideData();
    }
  },

  observers: {
    'guideType': function(newType) {
      if (newType) {
        this.initGuideData();
      }
    }
  },

  methods: {
    // 初始化引导数据
    initGuideData() {
      const guideConfigs = {
        profile: {
          icon: '👋',
          title: '欢迎使用PawMate',
          description: '让我们先完善您的个人资料，这样其他狗友更容易认识您和您的爱宠！',
          steps: [1]
        },
        map: {
          icon: '🗺️',
          title: '发现附近的狗友',
          description: '在地图上查看附近的狗友，点击头像可以查看详情或发起约遛狗邀请。',
          steps: [1, 2, 3]
        },
        meetup: {
          icon: '🐕',
          title: '约遛狗功能',
          description: '选择时间、地点，向心仪的狗友发送约遛狗邀请。让您的爱宠结交更多朋友！',
          steps: [1, 2, 3]
        }
      };

      const guideData = guideConfigs[this.data.guideType] || {};
      const totalSteps = guideData.steps ? guideData.steps.length : 1;
      
      this.setData({
        guideData,
        currentStep: 0,
        isLastStep: totalSteps === 1
      });
    },

    // 下一步
    nextStep() {
      const totalSteps = this.data.guideData.steps ? this.data.guideData.steps.length : 1;
      const nextStep = this.data.currentStep + 1;

      if (nextStep >= totalSteps) {
        // 完成引导
        this.completeGuide();
      } else {
        // 下一步
        this.setData({
          currentStep: nextStep,
          isLastStep: nextStep === totalSteps - 1
        });
        
        // 更新引导内容
        this.updateGuideContent(nextStep);
      }
    },

    // 更新引导内容
    updateGuideContent(step) {
      const stepContents = {
        map: [
          {
            icon: '🗺️',
            title: '发现附近的狗友',
            description: '在地图上查看附近的狗友，点击头像可以查看详情或发起约遛狗邀请。'
          },
          {
            icon: '👆',
            title: '点击头像互动',
            description: '点击地图上的头像，可以查看狗友详情、发起聊天或约遛狗。'
          },
          {
            icon: '🐕',
            title: '开始遛狗',
            description: '点击底部"开始遛狗"按钮，您的头像会显示在地图上，其他狗友可以看到并与您互动！'
          }
        ],
        meetup: [
          {
            icon: '🐕',
            title: '约遛狗功能',
            description: '选择时间、地点，向心仪的狗友发送约遛狗邀请。让您的爱宠结交更多朋友！'
          },
          {
            icon: '📅',
            title: '选择时间地点',
            description: '设置合适的遛狗时间和地点，其他狗友会收到您的邀请。'
          },
          {
            icon: '💬',
            title: '等待回复',
            description: '发送邀请后，可以在消息中心查看对方的回复状态。'
          }
        ]
      };

      const contents = stepContents[this.data.guideType];
      if (contents && contents[step]) {
        this.setData({
          'guideData.icon': contents[step].icon,
          'guideData.title': contents[step].title,
          'guideData.description': contents[step].description
        });
      }
    },

    // 跳过引导
    skipGuide() {
      this.completeGuide();
    },

    // 关闭引导
    closeGuide() {
      // 点击遮罩不关闭，避免误触
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 阻止事件冒泡
    },

    // 完成引导
    completeGuide() {
      // 标记当前引导已完成
      app.completeGuide(this.data.guideType);
      
      // 触发完成事件
      this.triggerEvent('complete', {
        guideType: this.data.guideType
      });
      
      // 隐藏引导
      this.setData({ show: false });
    }
  }
}); 