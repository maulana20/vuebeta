({
	template: '',
	data: function () {
		return {
			news_for_agent: ''
		}
	},
	mounted: function() {
		this.getNews()
	},
	methods: {
		getNews: function () {
			this.$http.get(config.backend_domain + '/home/news', {credentials: true}).then(
				function (res) {
					if (res.body.status === 'success') {
						this.news_for_agent = res.body.content
					} else if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getNews)
					} else {
						alert('Internal server error!')
					}
				},
				function (err) {
					alert('Connection error!')
				}
			)
		}
	}
})
