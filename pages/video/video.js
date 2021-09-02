import request from '../../utils/request'
import { newVideoList } from '../../utils/videoList'  //引入假的数据，因为网易云没有提供相应的接口

Page({
  data: {
    videoGroupList: [], //导航标签
    navId: '',   //导航id
    videoId: '', //视频id
    videoUpdateTime: [], // 记录video播放的时长
    isTriggered: false, // 标识下拉刷新是否被触发
    videoList: []
  },

  onLoad: function (options) {
    this.getVideoGroupListData()
  },

  async getVideoGroupListData() {
    let videoGroupData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupData.data.slice(0, 14),
      navId: videoGroupData.data[0].id
    })
    this.getVideoList(this.data.navId)
  },

  async getVideoList(navId) {
    if(!navId){ // 判断navId为空串的情况
      return;
    }
    let videoListData = await request('/video/group', {id: navId});
    wx.hideLoading();
    
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      videoList,
      isTriggered: false // 关闭下拉刷新
    })
  },

  changeNav(event){
    let navId = event.currentTarget.id; // 通过id向event传参的时候如果传的是number会自动转换成string
    // let navId = event.currentTarget.dataset.id;
    this.setData({
      navId: navId>>>0,
      videoList: []
    })
    // 显示正在加载
    wx.showLoading({
      title: '正在加载'
    })
    // 动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId);
  },

  //点击播放/继续播放都会执行
  //解决多个视频同时播放
  handlePlay(event) {
    let vid = event.currentTarget.id
    //this.vid !== vid && this.videoContext && this.videoContext.stop()  //☆
    //this.vid = vid
    this.setData({
      videoId: vid
    })
    this.videoContext = wx.createVideoContext(vid)
    // 判断当前的视频之前是否播放过，是否有播放记录, 如果有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    this.videoContext.play()
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime);
    }
  },

  //保存播放记录
  handleTimeUpdate(event){
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if(videoItem){ // 之前有
      videoItem.currentTime = event.detail.currentTime;
    }else { // 之前没有
      videoUpdateTime.push(videoTimeObj);
    }
    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },
  
  //播放结束，移除播放记录
  handleEnded(event){
    // 移除记录播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1);
    this.setData({
      videoUpdateTime
    })
  },

  //上拉刷新
  handleRefresher(){
    console.log('scroll-view 下拉刷新');
    // 再次发请求，获取最新的视频列表数据
    this.getVideoList(this.data.navId);
  },

  //下拉触底
  handleToLower() {
    console.log(newVideoList)
    let videos = this.data.videoList
    videos.push(...newVideoList)
    this.setData({
      videoList: videos
    })
  },

  onShareAppMessage({from}) {
    if(from=='button'){
      return {
        title: '视频',
        path: '/pages/video/video',
        imageUrl: '/static/images/video/share.jpeg'
      }
    }
    else {
      return {
        title: '码鱼云音乐',
        page: '/pages/video/video',
        imageUrl: '/static/images/video/share.jpeg'
      }
    }
  },

  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search'
    })
  }
})