(function (domain) {
    var list_avail_zoopim = ['agenindowisata', 'anwsystem', 'asmtravel', 'versatiket', 'rumahtiket']
    if (list_avail_zoopim.indexOf(domain) >= 0) {
        var script = document.createElement('script')
        script.src = '/zopim_js/' + domain + '.js'
        script.type = 'text/javascript'
        document.getElementsByTagName('body')[0].appendChild(script)
    } else {
        return
    }
})(window.location.hostname.split('.')[1])
