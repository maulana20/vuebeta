if (window.Vue){
    window.Vue.prototype.$alertResponseHandler = function (res) {
      if (res.body.content && res.body.content.flag && res.body.content.flag === 'alert') {
        window.alert(res.body.content.alert)
      }
    }
}
