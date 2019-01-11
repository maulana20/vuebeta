({
	template: '',
	data: function() {
		return {
			posting_list: '',
			checked: []
		}
	},
	mounted: function() {
		this.getPostingList()
	},
	methods: {
		getPostingList: function()
		{
			this.$http.get(config.backend_domain + '/posting/list?year=2018', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.posting_list = this.generateChecked(res.body.content.list)
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getPostingList)
					} else {
						alert('Connection error !')
					}
				},
				function (err)
				{
					alert('Connection error !')
				}
			)
		},
		generateChecked: function(response)
		{
			if (response == null || response == '') return response
			var checked = []
			response.forEach(function(list) {
				if (list.period_status == 'P' || list.period_status == 'C') checked.push(list.period_begin)
			})
			this.checked = checked
			
			return response
		},
		doUpdatePeriod: function()
		{
			var params = {
				'year': 2018
			}
			this.$http.post(config.backend_domain + '/period/ajaxupdate', params, {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						alert('Success melakukan update !')
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getPostingList)
					} else {
						alert('Connection timeout !')
					}
				},
				function (err)
				{
					alert('Connection timeout !')
				}
			)
		},
		doProcess: function()
		{
			var params = {
				'posting': this.checked.join(' '),
				'year': 2018
			}
			this.$http.post(config.backend_domain + '/posting/ajaxposting', params, {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						alert('Success melakukan posting !')
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getPostingList)
					} else {
						alert('Connection timeout !')
					}
				},
				function (err)
				{
					alert('Connection timeout !')
				}
			)
		}
	}
})
