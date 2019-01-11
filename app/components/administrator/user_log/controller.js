({
	template: '',
	data: function() {
		return {
			monthlist: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
			list_user_log: {
				state: 'idle',
				message: ''
			},
			search_user_log: {
				closeBtn: '',
				start_date: '',
				end_date: '',
				option: 'per_pages',
				partial: 1,
				column_choice: 'userlog_action',
				search_txt: '*'
			},
			user_log: '',
			pagination: {
				first_page: 1,
				last_page: '',
				current_page: '',
				prev_page: '',
				next_page: '',
				page_list: []
			},
			userlog_pagelist: ''
		}
	},
	mounted: function() {
		this.search_user_log.start_date = new Date().toISOString().split('T')[0]
		this.search_user_log.end_date = new Date().toISOString().split('T')[0]
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
				this.search_user_log.start_date = date.toISOString().split('T')[0]
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
				this.search_user_log.end_date = date.toISOString().split('T')[0]
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
		doSearching: function () {
			this.list_user_log.state = 'searching'
			var params = {
				closeBtn: this.search_user_log.closeBtn,
				start_date: this.search_user_log.start_date.split('-').reverse().join('-'),
				end_date: this.search_user_log.end_date.split('-').reverse().join('-'),
				option: this.search_user_log.option,
				partial: this.search_user_log.partial,
				column_choice: this.search_user_log.column_choice,
				search_txt: this.search_user_log.search_txt
			}
			if (!params.search_txt) {
                alert('Kata Kunci Masih Kosong')
                return
            }
			if (Date.parse(this.search_user_log.start_date) > Date.parse(this.search_user_log.end_date)){
                this.issued_info = false
                alert('Tanggal Mulai Yang Anda Pilih Lebih Besar Daripada Tanggal Tujuan Anda ! Silahkan Pilih Ulang Tanggal ! ')
                this.list_user_log.state = 'idle'
                this.list_user_log.message = ''
                return
            }
            this.$http.post(config.backend_domain + '/userlog/list', params, {credentials: true}).then(
				function(res) {
					if (res.body.status === 'success') {
						this.user_log = res.body.content
						this.userlog_pagelist = res.body.content.page_list
						this.list_user_log.state = 'idle'
						this.list_user_log.message = ''
						this.generatePaggenation()
					} else if (res.body.status === 'failed') {
						this.list_user_log.state = 'error'
						this.list_user_log.message = 'List User Log kosong, silahkan pilih tanggal yang berbeda!'
					} else if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal('', this.doSearching)
					} else if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal('', this.doListingTopup)
					} else {
						if (this.list_user_log.state === 'error') {
							alert('Internal server error!')
							this.list_user_log.message = 'Internal server error!'
						}
					}
				},
				function(err) {
					this.list_user_log.state = 'error'
					this.list_user_log.message = 'Koneksi ke server error, silahkan coba kembali!'
					alert('Connection error!')
				}
			)
		},
		getDataOnPage: function(page) {
			this.list_user_log.state = 'searching'
			var params = {
				closeBtn: this.search_user_log.closeBtn,
				start_date: this.search_user_log.start_date.split('-').reverse().join('-'),
				end_date: this.search_user_log.end_date.split('-').reverse().join('-'),
				option: this.search_user_log.option,
				partial: this.search_user_log.partial,
				column_choice: this.search_user_log.column_choice,
				search_txt: this.search_user_log.search_txt
			}
			if (!params.search_txt) {
                alert('Kata Kunci Masih Kosong')
                return
            }
			if (Date.parse(this.search_user_log.start_date) > Date.parse(this.search_user_log.end_date)){
                this.issued_info = false
                alert('Tanggal Mulai Yang Anda Pilih Lebih Besar Daripada Tanggal Tujuan Anda ! Silahkan Pilih Ulang Tanggal ! ')
                this.list_user_log.state = 'idle'
                this.list_user_log.message = ''
                return
            }
            this.$http.post(config.backend_domain + '/userlog/list?page=' + page, params, {credentials: true}).then(
				function(res) {
					if (res.body.status === 'success') {
						this.user_log = res.body.content
						this.userlog_pagelist = res.body.content.page_list
						this.list_user_log.state = 'idle'
						this.list_user_log.message = ''
						this.generatePaggenation()
					} else if (res.body.status === 'failed') {
						this.list_user_log.state = 'error'
						this.list_user_log.message = 'List User Log kosong, silahkan pilih tanggal yang berbeda!'
					} else if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal('', this.doListingTopup)
					} else {
						if (this.list_user_log.state === 'error') {
							alert('Internal server error!')
							this.list_user_log.message = 'Internal server error!'
						}
					}
				},
				function(err) {
					this.list_user_log.state = 'error'
					this.list_user_log.message = 'Koneksi ke server error, silahkan coba kembali!'
					alert('Connection error!')
				}
			)
		},
		doCancel: function () {
			this.search_user_log.start_date = new Date().toISOString().split('T')[0]
			this.search_user_log.end_date = new Date().toISOString().split('T')[0]
			this.search_user_log.allpage = ''
			this.search_user_log.status = ''
			this.user_log = ''
			this.search_field = false
			return
		},
		converterToFormatRits: function (nominal) {
			var temp, result, count, i
			if (typeof(nominal === 'number')) {
				temp = parseInt(nominal).toString()
				result = ''
				count = 0
				for (i = temp.length - 1; i >= 0; i--) {
					count = count + 1
					if (count === 3 && i > 0) {
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
					if (count === 3 && i > 0) {
						result = ',' + temp[i] + result
						count = 0
					} else {
						result = temp[i] + result
					}
				}
			}
			return result
		},
		initPaggenation: function () {
			this.pagination.first_page = 1,
			this.pagination.last_page = '',
			this.pagination.current_page = '',
			this.pagination.prev_page = '',
			this.pagination.next_page = '',
			this.pagination.page_list = []
		},
        generatePaggenation: function () {
			this.initPaggenation()
			if (this.user_log.page_list == 0){
				this.pagination.current_page = 0
			} else {
				var page = this.user_log.page
				var total_page = this.user_log.page_list
				var interval = parseInt(page / 5)
				if (((page / 5) - interval) > 0) {
					interval = interval + 1
				}
				var pages = []
				for (var i = (interval*5)-4; i <= (interval*5); i++) {
					if (i <= total_page) {
						pages.push(i)
					}
				}
				if ((pages[0] - 1) >= this.pagination.first_page) {
					this.pagination.prev_page = pages[0] - 1
				}
				if ((pages[pages.length - 1] + 1) <= total_page) {
					this.pagination.next_page = pages[pages.length - 1] + 1
				}
				this.user_log.page_list = pages
				this.pagination.last_page = total_page
				if (typeof(page) === 'number'){
					this.pagination.current_page = page
				} else {
					this.pagination.current_page = parseInt(page)
				}
			}
		},
	}
})
