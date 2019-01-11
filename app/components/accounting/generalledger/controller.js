({
	template: '',
	data: function() {
		return {
			monthlist: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
			origin_coa_name: '',
			coa_code: '',
			coa_name: '',
			coa_list: '',
			coa_id: '',
			generalledger: '',
			generalledger_list: {
				state: 'idle',
				message: ''
			},
			generalledger_search: {
				start_date: '',
				end_date: ''
			},
			init_page: {
				state: 'idle',
				message: ''
			}
		}
	},
	mounted: function() {
		this.generalledger_search.start_date = new Date().toISOString().split('T')[0]
		this.generalledger_search.end_date = new Date().toISOString().split('T')[0]
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
				this.generalledger_search.start_date = date.toISOString().split('T')[0]
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
				this.generalledger_search.end_date = date.toISOString().split('T')[0]
			}.bind(this)
		})
		this.getCoaList()
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
		coaCurrent: function(response)
		{
			var temp_array = []
			
			response.forEach(function (list){
				if (temp_array.indexOf(list.coa_to) < 0) {
					list.coa_show = true
					temp_array.push(list.coa_to)
				} else {
					list.coa_show = false
				}
			})
			return response
		},
		getCoaList: function()
		{
			this.$http.get(config.backend_domain + '/coa/list', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.init_page.state = 'success'
						this.init_page.message = ''
						this.coa_list = res.body.content.list
					} else if (res.body.status == 'failed') {
						this.init_page.state = 'failed'
						this.init_page.message = 'Gagal mendapatkan coa data !'
						alert('Gagal mendapatkan coa data !')
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.doSearching)
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
		restoreDropDown: function () {
			setTimeout(
				function () {
					this.doRestoreDropDown()
				}.bind(this), 200
			)
		},
		doRestoreDropDown: function () {
			var coa_id = ''
			var filtered_coa = this.coa_list.filter(
				function (coa) {
					return coa.coa_id == coa_id
				}.bind(this)
			)
		},
		filteredDropDown: function () {
			return this.coa_list.filter(function (coa) {
				return (coa.coa_name.toLowerCase().indexOf(this.coa_name.toLowerCase()) >= 0)
			}.bind(this))
		},
		selectDropDown: function (data) {
			this.coa_name = data.coa_code + ' ' + data.coa_name
			this.origin_coa_name = data.coa_code + ' ' + data.coa_name
			this.coa_code = data.coa_code
		},
		doCancel: function()
		{
			this.generalledger_search.start_date = new Date().toISOString().split('T')[0]
			this.generalledger_search.end_date = new Date().toISOString().split('T')[0]
			this.generalledger = ''
			return
		},
		doSearching: function()
		{
			this.generalledger_list.state = 'searching'
			var params = {
				start_date : this.generalledger_search.start_date,
				end_date : this.generalledger_search.end_date,
				coa_code: this.coa_code
			}
			if (!this.coa_code || this.coa_code == '' || !this.coa_code.length) { 
				this.generalledger_list.state = 'error'
				this.generalledger_list.message = 'Akun tidak boleh kosong !'
				
				return
			}
			this.$http.post(config.backend_domain + '/generalledger/searchreport', params, {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						if (!res.body.content.list || !res.body.content.list.length) {
							this.generalledger_list.state = 'error'
							this.generalledger_list.message = 'List data kosong, silahkan ulangi lagi pencariannya!'
							return
						}
						this.generalledger_list.state = 'idle'
						this.generalledger_list.message = ''
						this.generalledger = this.coaCurrent(res.body.content.list)
					} else if (res.body.status == 'failed') {
						this.generalledger_list.state = 'error'
						this.generalledger_list.message = 'Tidak dapat melakukan pencarian !'
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
