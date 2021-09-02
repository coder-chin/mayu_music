import request from '../../utils/request'
Page({
  data: {
    phone: '',
    password: ''
  },

  async login() {
    let {phone, password} = this.data  //人类高质量代码
    //手机号为空
    if(!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return
    }
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    //手机号不合法
    if(!phoneReg.test(phone)){
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return
    }
    //密码为空
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }

    let result = await request('/login/cellphone', { phone, password, isLogin: true })
    console.log(result);
    if (result.code === 200) { // 登录成功
      wx.showToast({
        title: '登录成功'
      })
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))
      wx.reLaunch({
        url: '/pages/personal/personal'
      })
    }
    else if (result.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'none'
      })
    } 
    else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    } 
    else {
      wx.showToast({
        title: '登录失败，请重新登录',
        icon: 'none'
      })
    }
  },

  handleInput(event) {
    let type = event.currentTarget.dataset.type; 
    this.setData({
      [type]: event.detail.value
    })
  },
})