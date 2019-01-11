({
	template: '',
	data: function() {
		return {
			closing_list: '',
			checked: []
		}
	},
	mounted: function() {
		this.getClosingList()
	},
	methods: {
		getClosingList: function()
		{
			this.$http.get(config.backend_domain + '/closing/list?year=2018', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.closing_list = this.generateChecked(res.body.content.list)
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getClosingList)
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
				if (list.period_status == 'C') checked.push(list.period_begin)
			})
			this.checked = checked
			
			return response
		},
		doProcess: function()
		{
			var params = {
				closing: this.checked.join(' '),
				year: 2018
			}
			this.$http.post(config.backend_domain + '/closing/ajaxclosing', params, {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						alert('Success melakukan closing !')
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getClosingList)
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
