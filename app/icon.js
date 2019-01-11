(function (domain) {
    var script = document.createElement('link')
    script.rel="icon"
    script.href = '/static/img/favicon/' + domain + '/favicon.ico'
    script.type = 'image/x-icon'
    document.getElementsByTagName('head')[0].appendChild(script)
    
})(window.location.hostname.split('.')[1])