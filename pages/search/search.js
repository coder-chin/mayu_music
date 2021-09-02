import request from '../../utils/request'
let isSend = false; // 函数节流使用

Page({
  data: {
    placeholderContent: '', // placeholder的内容
    hotList: [], // 热搜榜数据
    searchContent: '', // 用户输入的表单项数据
    searchList: [], // 关键字模糊匹配的数据
    historyList: [], // 搜索历史记录
  },

  onLoad: function (options) {
    // 获取初始化数据
    this.getInitData()
    // 获取历史记录
    this.getSearchHistory()
  },

  async getInitData() {
    let placeholderData = await request('/search/default');
    let hotListData = await request('/search/hot/detail');
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data
    })
  },

  getSearchHistory() {
    let historyList = wx.getStorageSync('searchHistory');
    if(historyList){
      this.setData({
        historyList
      })
    }
  },

  handleInputChange(event) {
    this.setData({
      searchContent: event.detail.value.trim()
    })
     if(isSend){
       return
     }
     isSend = true;
     this.getSearchList();
     // 函数节流
    setTimeout( () => {
      isSend = false;
    }, 300)
  },

  // 获取搜索数据的功能函数
  async getSearchList() {
    if(!this.data.searchContent){
      this.setData({
        searchList: []
      })
      return;
    }
    let {searchContent, historyList} = this.data;
    // 发请求获取关键字模糊匹配数据
    let searchListData = await request('/search', {keywords: searchContent, limit: 10});
    this.setData({
      searchList: searchListData.result.songs
    })
    
    // 将搜索的关键字添加到搜索历史记录中
    if(historyList.indexOf(searchContent) !== -1){
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList
    })
    
    wx.setStorageSync('searchHistory', historyList)
  },

  clearSearchContent() {
    this.setData({
      searchContent: '',
      searchList: []
    })
  },

  // 删除搜索历史记录
  deleteSearchHistory() {
    wx.showModal({
      content: '确认删除吗?',
      success: (res) => {
        if(res.confirm){
          // 清空data中historyList
          this.setData({
            historyList: []
          })
          // 移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
      }
    })
  },
})