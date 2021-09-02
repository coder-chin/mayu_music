import request from "../../utils/request";

let startY = 0; // 手指起始的坐标
let moveY = 0; // 手指移动的坐标
let moveDistance = 0; // 手指移动的距离

Page({
  data: {
    coverTransform: 'translateY(0)',
    coveTransition: '',  //过渡
    userInfo: {},   //用户信息
    recentPlayList: [], // 用户播放记录
  },

  onLoad: function (options) {
    // 读取用户的基本信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo){ // 用户登录
      // 更新userInfo的状态
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      // 获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },
  
  // 获取用户播放记录的功能函数.
  async getUserRecentPlayList(userId) {
    let recentPlayListData = await request('/user/record', {uid: userId, type: 1})
    let index = 0;
    let recentPlayList = recentPlayListData.weekData.splice(0, 10).map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      recentPlayList  //ES6写法
    })
  },
  
  handleTouchStart(event) {
    this.setData({
      coveTransition: ''
    })
    // 获取手指起始坐标
    startY = event.touches[0].clientY;
  },

  handleTouchMove(event) {
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;
    
    if(moveDistance <= 0){
      return;
    }
    if(moveDistance >= 80){
      moveDistance = 80;
    }
    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },

  handleTouchEnd() {
    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coveTransition: 'transform 1s linear'
    })
  },
  
  // 跳转至登录login页面的回调
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})
