({
	template: '',
	data: function()
	{
		return {
			monthlist: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
			form_param: {
				start_date: '',
				user_name: '',
				begin: '',
				status: '',
				vou_out: '',
				vou_in: '',
				coa_out: '',
				coa_in: '',
				value: '',
				desc: '',
			},
			
			origin_coa_out_name: '',
			origin_coa_in_name: '',
			coa_out_name: '',
			coa_in_name: '',
			coa_list: '',
			journal_list: '',
			intercashbank_list: '',
			intercashbank_id: '',
			
			isEdit: false,
			del_button_loading : false,
			formComponentState: false,
			formLoadingState: false,
			
			pagination: {
				first_page: 1,
				caption: '',
				last_page: '',
				current_page: '',
				prev_page: '',
				next_page: '',
				page_list: []
			},
			init_page: {
				state: 'idle',
				message: ''
			},
			schedule_info:{
				selected_id: '',
				process_on: '',
				state: 'idle',
				message: '',
				content: ''
			}
		}
	},
	mounted: function()
	{
		this.getInterCashBank()
		this.form_param.start_date = new Date().toISOString().split('T')[0]
		$('#start-date').datepicker({
			language: 'id',
			position: 'bottom left',
			autoClose: true,
			minDate: new Date(0),
			onSelect: function onSelect (fd, date, dp) {
				if (!date) {
					return null
				}
				var type = $(dp.el).attr('id').split('-')[2]
				var index = $(dp.el).attr('id').split('-')[3]
				date = new Date(date.valueOf() - (date.getTimezoneOffset() * 60 * 1000))
				this.form_param.start_date = date.toISOString().split('T')[0]
			}.bind(this)
		})
	},
	methods: {
		getInterCashBank: function()
		{
			this.$http.get(config.backend_domain + '/intercashbank/list', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.intercashbank_list = res.body.content.list
						this.generatePaggenation(res.body.content)
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getInterCashBank)
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
		getDataOnPage: function (page)
		{
			this.intercashbank_list = ''
			this.$http.get(config.backend_domain + '/intercashbank/list?page=' + page, {credentials: true}).then(
				function (res) {
					if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal(page, this.getDataOnPage)
						return
					} else if (res.body.status === 'success') {
						this.intercashbank_list = res.body.content.list
						this.generatePaggenation(res.body.content)
					} else if (res.body.status === 'failed') {
						if(res.body.content.reason){
							alert(res.body.content.reason)
						} else {
							alert(res.body.message)
						}
					} else {
						alert('Internal serer error!')
					}
				},
				function (err) {
					alert('Connection error!')
				}
			)
		},
		callFormComponent: function(method, id)
		{
			this.formComponentState = true
			this.formLoadingState = true
			
			this.getCoaList()
			this.initFormParam()
			
			if (method == 'Add') {
				this.isEdit = false
				$('#form_title').html('ADD NEW INTER CASH BANK')
			} else if (method == 'Edit') {
				this.isEdit = true
				$('#form_title').html('EDIT INTER CASH BANK')
				this.$http.get(config.backend_domain + '/intercashbank/edit/' + id, {credential: true}).then(
					function (res)
					{
						this.formLoadingState = false
						if (res.body.status == 'success') {
							this.intercashbank_id = id
							this.form_param.start_date = this.intToISODate(res.body.content.list.financialtrans_date).split('T')[0]
							this.form_param.user_name = res.body.content.list.user_name
							this.form_param.begin = res.body.content.list.period_begin
							this.form_param.status = res.body.content.list.period_status
							this.form_param.vou_out = res.body.content.list.vou_out
							this.form_param.vou_in = res.body.content.list.vou_in
							this.form_param.coa_out = res.body.content.list.coa_out
							this.form_param.coa_in = res.body.content.list.coa_in
							this.form_param.value = res.body.content.list.glanalysis_value
							this.form_param.desc = res.body.content.list.glanalysis_desc
							
							this.coa_out_name = res.body.content.list.coa_out_name
							this.coa_in_name = res.body.content.list.coa_in_name
							
							this.journal_list = this.vouCurrent(res.body.content.journal_list)
						} else if (res.body.status == 'failed') {
							alert(res.body.content.reason)
							$('#form_body').html(res.body.content.reason)
						} else if (res.body.status == 'timeout') {
							this.$root.callSessionTimeoutModal('', this.getInterCashBank)
						} else {
							$('#form_body').html('Connection error !')
						}
					}
				)
			} else {
				$('#form_title').html('Unknown')
				$('#form_body').html('Unknown')
			}
		},
		getCoaList: function()
		{
			this.$http.get(config.backend_domain + '/coa/listcashbank', {credential: true}).then(
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
						this.$root.callSessionTimeoutModal('', this.getInterCashBank)
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
		doProcess: function()
		{
			var params = {
				'intercashbank_id': this.intercashbank_id,
				'start_date': this.form_param.start_date,
				'coa_out': this.form_param.coa_out,
				'coa_in': this.form_param.coa_in,
				'value': this.form_param.value,
				'desc': this.form_param.desc
			}
			
			this.$http.post(config.backend_domain + '/intercashbank/ajaxedit', params, {credential: true}).then(
				function (res) {
					if (res.body.status == 'success') {
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getInterCashBank)
					} else {
						alert('Connection error !')
					}
				},
				function (err) {
					alert('Connection error !')
				}
			)
		},
		initFormComponent: function()
		{
			this.formComponentState = false
			this.initFormParam()
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
		initFormParam: function()
		{
			this.intercashbank_id = ''
			this.form_param.start_date = ''
			this.form_param.user_name = ''
			this.form_param.begin = ''
			this.form_param.status = ''
			this.form_param.vou_out = ''
			this.form_param.vou_in = ''
			this.form_param.coa_out = ''
			this.form_param.coa_in = ''
			this.form_param.value = ''
			this.form_param.desc = ''
		},
		restoreDropDown: function(type)
		{
			setTimeout(
				function () {
					this.doRestoreDropDown(type)
				}.bind(this), 200
			)
		},
		doRestoreDropDown: function(type)
		{
			if (type == 'out') {
				var filtered_coa = this.coa_list.filter(
					function (coa) {
						return coa.coa_id
					}.bind(this)
				)
			} else {
				var filtered_coa = this.coa_list.filter(
					function (coa) {
						return coa.coa_id
					}.bind(this)
				)
			}
		},
		filteredDropDown: function(type)
		{
			if (type == 'out') {
				return this.coa_list.filter(function (coa) {
					return (coa.coa_name.toLowerCase().indexOf(this.coa_out_name.toLowerCase()) >= 0)
				}.bind(this))
			} else {
				return this.coa_list.filter(function (coa) {
					return (coa.coa_name.toLowerCase().indexOf(this.coa_in_name.toLowerCase()) >= 0)
				}.bind(this))
			}
		},
		selectDropDown: function(type, data)
		{
			if (type == 'out') {
				this.coa_out_name = data.coa_code + ' ' + data.coa_name
				this.origin_coa_out_name = data.coa_code + ' ' + data.coa_name
				this.form_param.coa_out = data.coa_id
			} else {
				this.coa_in_name = data.coa_code + ' ' + data.coa_name
				this.origin_coa_in_name = data.coa_code + ' ' + data.coa_name
				this.form_param.coa_in = data.coa_id
			}
		},
		initPaggenation: function()
		{
			this.pagination.first_page = 1,
			this.pagination.caption = '',
			this.pagination.last_page = '',
			this.pagination.current_page = '',
			this.pagination.prev_page = '',
			this.pagination.next_page = '',
			this.pagination.page_list = []
		},
		generatePaggenation: function(response)
		{
			this.initPaggenation()
			this.pagination.caption = response.caption
			if (response.page_list == 0){
				this.pagination.current_page = 0
			} else {
				var page = response.page
				var total_page = response.page_list
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
				this.pagination.page_list = pages
				this.pagination.last_page = total_page
				if (typeof(page) === 'number'){
					this.pagination.current_page = page
				} else {
					this.pagination.current_page = parseInt(page)
				}
			}
		},
		converterToFormatRits: function(nominal)
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
		changeFormatDate: function(stringdate)
		{
			var fulldate = stringdate.split('-')
			var month = parseInt(fulldate[1]) - 1
			fulldate[1] = this.monthlist[month]
			return fulldate.reverse().join(' ')
		},
		intToISODate: function(date)
		{
			if (typeof (date) == 'string') date = parseInt(date)
			var temp = new Date(date * 1000)
			var result = new Date(temp.valueOf() - (-420  * 60 * 1000)).toISOString().split('.')[0]
			return result
		},
		underDevelopment: function()
		{
			alert('Sedang dalam tahap pengembangan!')
			return
		},
	}
})
