import request from '../../utils/request'

Page({
  data: {
    bannerList: [], //轮播图
    recommendList: [], //推荐
    topList: [] //排行榜
  },
  onLoad: function (options) {
    this.getBannerData()
    this.getRecommendData()
    this.getTopData()
  },

  async getBannerData() {
    let bannerData = await request('/banner', {type: 2})
    this.setData({
      bannerList: bannerData.banners
    })
  },
  
  async getRecommendData() {
    let recommendData = await request('/personalized', {limit: 10})
    this.setData({
      recommendList: recommendData.result
    })
  },

  async getTopData() {
    let rankData = await request('/toplist')
    rankData = rankData.list.slice(0,5)
    //console.log(rankData)
    let topData = []
    let itemData = {}
    let itemTemp = {}
    let i = 0;
    
    while(i<5) {
      itemTemp = await request('/playlist/detail', { id: rankData[i++].id })
      itemTemp = itemTemp.playlist
      itemData = { name: itemTemp.name, tracks: itemTemp.tracks.slice(0,3)}
      topData.push(itemData)
      this.setData({
        topList: topData
      })
    }
  },

  toRecommendSong(){
    wx.navigateTo({
      url: '/pages/recommengSong/recommengSong'
    })
  },
})