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
				coa_id: '',
				vou: '',
				position: '',
				desc: '',
			},
			journal_data: {
				index: '',
				coa_id: '',
				coa_name: '',
				desc: '',
				value: '',
				position: ''
			},
			
			origin_coa_to_name: '',
			coa_to_name: '',
			origin_coa_from_name: '',
			coa_from_name: '',
			coa_list: '',
			journal_list: [],
			generalcashbank_list: '',
			generalcashbank_id: '',
			
			del_button_loading : false,
			formComponentState: false,
			formLoadingState: false,
			del_button_loading: false,
			modalLoadingState: false,
			isEdit: false,
			
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
		this.getGeneralCashBank()
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
		getGeneralCashBank: function()
		{
			this.$http.get(config.backend_domain + '/generalcashbank/list', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.generalcashbank_list = res.body.content.list
						this.generatePaggenation(res.body.content)
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
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
			this.generalcashbank_list = ''
			this.$http.get(config.backend_domain + '/generalcashbank/list?page=' + page, {credentials: true}).then(
				function (res) {
					if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal(page, this.getDataOnPage)
						return
					} else if (res.body.status === 'success') {
						this.generalcashbank_list = res.body.content.list
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
		getCoaList: function()
		{
			this.$http.get(config.backend_domain + '/coa/list', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.init_page.state = 'success'
						this.init_page.message = ''
						this.coa_list = res.body.content.list
						$('.modal-backdrop').hide()
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
		getCoaListCashBank: function()
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
		initFormComponent: function()
		{
			this.formComponentState = false
			this.initFormParam()
		},
		callFormComponent: function(method, id)
		{
			this.formComponentState = true
			this.formLoadingState = true
			
			this.getCoaListCashBank()
			this.initFormParam()
			
			if (method == 'Add') {
				this.isEdit = false
				$('#form_title').html('ADD NEW GENERAL CASH BANK')
			} else if (method == 'Edit') {
				this.isEdit = true
				$('#form_title').html('EDIT GENERAL CASH BANK')
				this.$http.get(config.backend_domain + '/generalcashbank/edit/' + id, {credential: true}).then(
					function (res)
					{
						this.formLoadingState = false
						if (res.body.status == 'success') {
							this.generalcashbank_id = id
							
							this.form_param.start_date = this.intToISODate(res.body.content.list.financialtrans_date).split('T')[0]
							this.form_param.user_name = res.body.content.list.user_name
							this.form_param.begin = res.body.content.list.period_begin
							this.form_param.status = res.body.content.list.period_status
							this.form_param.vou = res.body.content.list.vou
							this.form_param.coa_id = res.body.content.list.coa_id
							this.form_param.position = res.body.content.list.glanalysis_position
							this.form_param.desc = res.body.content.list.glanalysis_desc
							
							this.coa_to_name = res.body.content.list.coa_name
							this.journal_list = this.generateJournal(res.body.content.journal_list)
						} else if (res.body.status == 'failed') {
							alert(res.body.content.reason)
						} else if (res.body.status == 'timeout') {
							this.$root.callSessionTimeoutModal('', this.getGeneralCashBank)
						} else {
							alert('Connection error !')
						}
					},
					function (err)
					{
						alert('Connection error !')
					}
				)
			} else {
				$('#form_title').html('Unknown')
				$('#form_body').html('Unknown')
			}
		},
		doProcess: function()
		{
			var params = {
				'generalcashbank_id': this.generalcashbank_id,
				'start_date': this.form_param.start_date,
				'coa_id': this.form_param.coa_id,
				'position': this.form_param.position,
				'desc': this.form_param.desc
			}
			for (i = 0; i < this.journal_list.length; i++) {
				for (attr in this.journal_data) {
					var attr_skip = ['index', 'coa_name']
					if (attr_skip.indexOf(attr) > -1) continue
					params['from_' + attr + i] = this.journal_list[i][attr]
				}
			}
			this.$http.post(config.backend_domain + '/generalcashbank/ajaxedit', params, {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getGeneralCashBank)
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
		addJournal: function()
		{
			this.journal_list.push({
				'coa_id': this.journal_data.coa_id,
				'coa_name': this.coa_from_name,
				'desc': this.journal_data.desc,
				'value': this.journal_data.value,
				'position': this.journal_data.position
			})
			
			$('#myModal').modal('hide')
		},
		deleteJournal: function(index)
		{
			this.journal_list.splice(index, 1)
		},
		editJournal: function(index)
		{
			this.journal_list[index].coa_id = this.journal_data.coa_id
			this.journal_list[index].coa_name = this.coa_from_name
			this.journal_list[index].desc = this.journal_data.desc
			this.journal_list[index].value = this.journal_data.value
			this.journal_list[index].position = this.journal_data.position
			$('#myModal').modal('hide')
		},
		openModal: function(method, index)
		{
			this.modalLoadingState = true
			this.getCoaList()
			this.initJournalParam()
			if (method == 'add') {
				$('#modal_title').html('ADD JOURNAL')
				this.modalLoadingState = false
				
				this.journal_data.position = 'C'
			} else if (method == 'edit') {
				$('#modal_title').html('EDIT JOURNAL')
				this.modalLoadingState = false
				
				this.journal_data.index = index
				this.journal_data.coa_id = this.journal_list[index].coa_id
				this.journal_data.desc = this.journal_list[index].desc
				this.journal_data.value = this.journal_list[index].value
				this.journal_data.position = this.journal_list[index].position
				
				this.coa_from_name = this.journal_list[index].coa_name
			} else {
				$('#modal_title').html('Unknown')
				$('#modal_body').html('Unknown')
			}
		},
		generateJournal: function(response)
		{
			if (response == '' || response == null) return false
			var result = []
			response.forEach(function (data) {
				result.push({
					'coa_id': data.coa_id,
					'coa_name': data.coa_code + ' ' + data.coa_name,
					'desc': data.glanalysis_desc,
					'value': (data.glanalysis_position == 'D' ? data.glanalysis_debet : data.glanalysis_credit),
					'position': data.glanalysis_position
				})
			})
			
			return result
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
			if (type == 'to') {
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
			if (type == 'to') {
				return this.coa_list.filter(function (coa) {
					return (coa.coa_name.toLowerCase().indexOf(this.coa_to_name.toLowerCase()) >= 0)
				}.bind(this))
			} else {
				return this.coa_list.filter(function (coa) {
					return (coa.coa_name.toLowerCase().indexOf(this.coa_from_name.toLowerCase()) >= 0)
				}.bind(this))
			}
		},
		selectDropDown: function(type, data)
		{
			if (type == 'to') {
				this.coa_to_name = data.coa_code + ' ' + data.coa_name
				this.origin_coa_to_name = data.coa_code + ' ' + data.coa_name
				this.form_param.coa_id = data.coa_id
			} else {
				this.coa_from_name = data.coa_code + ' ' + data.coa_name
				this.origin_coa_from_name = data.coa_code + ' ' + data.coa_name
				this.journal_data.coa_id = data.coa_id
			}
		},
		initJournalParam: function()
		{
			this.journal_data.index = ''
			this.journal_data.coa_id = ''
			this.journal_data.coa_name = ''
			this.journal_data.desc = ''
			this.journal_data.value = ''
			this.journal_data.position = ''
			this.coa_from_name = ''
		},
		initFormParam: function()
		{
			this.generalcashbank_id = ''
			this.form_param.start_date = ''
			this.form_param.user_name = ''
			this.form_param.begin = ''
			this.form_param.status = ''
			this.form_param.coa_id = ''
			this.form_param.vou = ''
			this.form_param.position = ''
			this.form_param.desc = ''
		},
		initPaggenation: function ()
		{
			this.pagination.first_page = 1,
			this.pagination.caption = '',
			this.pagination.last_page = '',
			this.pagination.current_page = '',
			this.pagination.prev_page = '',
			this.pagination.next_page = '',
			this.pagination.page_list = []
		},
		generatePaggenation: function (response)
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
		changeFormatDate: function (stringdate)
		{
			var fulldate = stringdate.split('-')
			var month = parseInt(fulldate[1]) - 1
			fulldate[1] = this.monthlist[month]
			return fulldate.reverse().join(' ')
		},
		intToISODate: function (date)
		{
			if (typeof (date) == 'string') date = parseInt(date)
			var temp = new Date(date * 1000)
			var result = new Date(temp.valueOf() - (-420  * 60 * 1000)).toISOString().split('.')[0]
			return result
		},
		underDevelopment: function ()
		{
			alert('Sedang dalam tahap pengembangan!')
			return
		},
	}
})
