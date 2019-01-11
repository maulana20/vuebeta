({
	template: '',
	data: function() {
		return {
			monthlist: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
			trans_id: '',
			journal: '',
			journal_list: {
				state: 'idle',
				message: ''
			},
			journal_search: {
				start_date: '',
				end_date: ''
			}
		}
	},
	mounted: function() {
		this.journal_search.start_date = new Date().toISOString().split('T')[0]
		this.journal_search.end_date = new Date().toISOString().split('T')[0]
		$('#start-date').datepicker({
			language: 'id',
			position: 'bottom left',
			autoClose: true,
			maxDate: new Date(),
			minDate: new Date(0),
			onSelect: function (fp, date, dp) {
				if (!date) {
					return null
				}
				var type = $(dp.el).attr('id').split('-')[2]
				var index = $(dp.el).attr('id').split('-')[3]
				date = new Date(date.valueOf() - (date.getTimezoneOffset() * 60 * 1000))
				this.journal_search.start_date = date.toISOString().split('T')[0]
			}.bind(this)
		})
		$('#end-date').datepicker({
			language: 'id',
			position: 'bottom left',
			autoClose: true,
			maxDate: new Date(),
			minDate: new Date(0),
			onSelect: function (fp, date, dp) {
				if (!date) {
					return null
				}
				var type = $(dp.el).attr('id').split('-')[2]
				var index = $(dp.el).attr('id').split('-')[3]
				date = new Date(date.valueOf() - (date.getTimezoneOffset() * 60 * 1000))
				this.journal_search.end_date = date.toISOString().split('T')[0]
			}.bind(this)
		})
	},
	methods: {
		changeFormatDate: function (stringdate) {
			var fulldate = stringdate.split('-')
			var month = parseInt(fulldate[1]) - 1
            fulldate[1] = this.monthlist[month]
            return fulldate.reverse().join(' ')
		},
		intToISODate: function (date) {
            if (typeof (date) == 'string') {
                date = parseInt(date);
            }
			var temp = new Date(date * 1000)
			var result = new Date(temp.valueOf() - (-420  * 60 * 1000)).toISOString().split('.')[0]
			return result
		},
		converterToFormatRits: function (nominal)
		{
			var temp, result, count, i
			if (typeof(nominal == 'number')) {
				temp = parseInt(nominal).toString()
				result = ''
				count = 0
				for (i = temp.length - 1; i >= 0; i--) {
					count = count + 1
					if (count == 3 && i > 0) {
						result = ',' + temp[i] + result
						count = 0
					} else {
						result = temp[i] + result
					}
				}
			} else {
				if (nominal.split('.').length > 1) {
					temp = nominal.split('.')[0]
				} else {
					temp = nominal
				}
				result = ''
				count = 0
				for (i = temp.length - 1; i >= 0; i--) {
					count = count + 1
					if (count == 3 && i > 0) {
						result = ',' + temp[i] + result
						count = 0
					} else {
						result = temp[i] + result
					}
				}
			}
			return result
		},
		vouCurrent: function(response)
		{
			var temp_array = []
			
			response.forEach(function (list){
				if (temp_array.indexOf(list.vou) < 0) {
					list.trans_show = true
					temp_array.push(list.vou)
				} else {
					list.trans_show = false
				}
			})
			return response
		},
		doCancel: function()
		{
			this.journal_search.start_date = new Date().toISOString().split('T')[0]
			this.journal_search.end_date = new Date().toISOString().split('T')[0]
			this.journal = ''
			return
		},
		doSearching: function()
		{
			this.journal_list.state = 'searching'
			var params = {
				start_date : this.journal_search.start_date,
				end_date : this.journal_search.end_date
			}
			this.$http.post(config.backend_domain + '/generalledger/searchjournal', params, {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						if (!res.body.content.list || !res.body.content.list.length) {
							this.journal_list.state = 'error'
							this.journal_list.message = 'List data kosong, silahkan ulangi lagi pencariannya!'
							return
						}
						this.journal_list.state = 'idle'
						this.journal_list.message = ''
						this.journal = this.vouCurrent(res.body.content.list)
					} else if (res.body.status == 'failed') {
						this.journal_list.state = 'error'
						this.journal_list.message = 'Tidak dapat melakukan pencarian !'
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.doSearching)
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
