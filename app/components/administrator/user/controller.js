({
	template: '',
	data: function ()
	{
		return {
			user_current: '',
			user_list: '',
			group_id: '',
			group_list: '',
			user_real_name: '',
			user_id: '',
			user_name: '',
			password: '',
			confirm: '',
			form_loading : false,
			active_button_loading : false,
			inactive_button_loading : false,
			del_button_loading : false,
			add_button_loading : false,
			active_session: '',
			modalLoadingState: false,
			canEdit: false,
			isEdit: false,
			monthlist : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
			pagination: {
				first_page: 1,
				caption: '',
				last_page: '',
				current_page: '',
				prev_page: '',
				next_page: '',
				page_list: []
			},
			pagination_on_searchComponent: {
				first_page: 1,
				caption: '',
				last_page: '',
				current_page: '',
				prev_page: '',
				next_page: '',
				page_list: []
			},
			searchComponentState: false,
			search_data:{
				state: 'idle',
				message: '',
				response: '',
				params:{
					search_txt: '*',
					column_choice: 'user_name',
					rank_choice: 'any',
					status_choice: 'any',
					partial: 1,
					option: 'per_pages',
					start_date: '',
					create_start_date: ''
				}
			},
			active_inactive_show: false,
			schedule_info:{
				selected_id: '',
				process_on: '',
				state: 'idle',
				message: '',
				content: ''
			}
		}
	},
	mounted: function ()
	{
		this.getUserList()
		this.search_data.params.start_date = new Date().toISOString().split('T')[0]
		this.search_data.params.create_start_date = new Date().toISOString().split('T')[0]
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
				this.search_data.params.start_date = date.toISOString().split('T')[0]
			}.bind(this)
		})
		$('#create-start-date').datepicker({
			language: 'id',
			position: 'bottom left',
			autoClose: true,
			minDate: new Date(0),
			onSelect: function onSelect(fd, date, dp) {
				if (!date) {
					return null
				}
				var type = $(dp.el).attr('id').split('-')[2]
				var index = $(dp.el).attr('id').split('-')[3]
				date = new Date(date.valueOf() - (date.getTimezoneOffset() * 60 * 1000))
				this.search_data.params.create_start_date = date.toISOString().split('T')[0]
			}.bind(this)
		})
	},
	methods: {
		formatTopupAmountInput: function (ev) {
			this.deposite.params.value = ev.target.value.split('.').join('').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,").split(',').join('.')
		},
		getUserList: function ()
		{
			this.initSearchComponent()
			this.$http.get(config.backend_domain + '/user/list', {credentials: true}).then(
				function (res)
				{
					if (res.body.status === 'success') {
						this.user_list = res.body.content
						this.super_user = res.body.content.super_user
						this.user_current = res.body.content.current_row
						this.canEdit = res.body.content.canEdit
						this.generatePaggenation(res.body.content)
					} else if (res.body.status === 'failed') {
						if(res.body.content.reason){
							alert(res.body.content.reason)
						} else {
							alert(res.body.message)
						}
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.getUserList)
					} else {
						alert('Internal server error!')
					}
				},
				function (err)
				{
					alert('Connection error!')
				}
			)
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
		openModal: function (method, id)
		{
			this.modalLoadingState = true
			if (method == 'Add') {
				$('#modal_title').html('ADD NEW USER')
				this.isEdit = false
				this.$http.get(config.backend_domain + '/user/add', {credentials: true}).then(
					function(res)
					{
						this.modalLoadingState = false
						if (res.body.status === 'success') {
							this.active_session = 'add'
							this.group_list = res.body.content.group_list
						} else {
							$('#modal_body').html('Session Timeout')
						}
					},
					function (err)
					{
						this.modalLoadingState = false
						alert('Connection error!')
						$('#modal_body').html('Connection error!')
					}
				)
			} else if (method == 'Edit') {
				this.isEdit = true
				$('#modal_title').html('EDIT USER')
				this.$http.get(config.backend_domain + '/user/edit/' + id, {credentials: true}).then(
					function (res)
					{
						this.modalLoadingState = false
						if (res.body.status === 'success') {
							this.active_session = 'edit'
							this.user_real_name = res.body.content.list.user_realname
							this.user_id = res.body.content.list.user_id
							this.group_id = res.body.content.list.group_id
							this.group_list = res.body.content.group_list
							$('.modal-backdrop').remove();
						} else {
							if (res.body.content.reason) {
								$('#modal_body').html(res.body.content.reason)
							} else {
								$('#modal_body').html(res.body.message)
							}
						}
					},
					function (err)
					{
						alert('Connection error!')
						this.modalLoadingState = false
						$('#modal_body').html('Connection error!')
					}
				)
			} else {
				$('#modal_title').html('Unknown')
				$('#modal_body').html('Unknown')
			}
		},
		active: function(id, index)
		{
			if (this.form_loading) {
				alert('The Page still loading')
				return
			}
			this.form_loading = true
			this.active_button_loading = true
			var params = {"id" : id }
			this.$http.post(config.backend_domain + '/user/ajaxactive', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status === 'success') {
						alert('Aktivasi pengguna berhasil!')
						if (this.searchComponentState) {
							if (this.pagination_on_searchComponent.caption) {
								this.getDataOnPageSearchComponent(this.pagination_on_searchComponent.current_page)
							} else {
								this.searchOnComponent()
							}
						} else {
							if (this.pagination.caption) {
								this.getDataOnPage(this.pagination.current_page)
							} else {
								this.getUserList()
							}
						}
						this.form_loading = false
						this.active_button_loading = false
					}else{
						alert('Session Timeout')
					}
				},
				function (err)
				{
					alert('Connection error!')
				}
			)
		},
		inactive: function(id, index)
		{
			this.form_loading = false
			if (this.form_loading) {
				alert('The Page still loading')
				return
			}
			this.form_loading = true
			this.inactive_button_loading = true
			var params = {
				'id' : id
			}
			this.$http.post(config.backend_domain + '/user/ajaxinactive', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status === 'success') {
						alert('Inaktif pengguna berhasil!')
						if (this.searchComponentState) {
							if (this.pagination_on_searchComponent.caption) {
								this.getDataOnPageSearchComponent(this.pagination_on_searchComponent.current_page)
							} else {
								this.searchOnComponent()
							}
						} else {
							if (this.pagination.caption) {
								this.getDataOnPage(this.pagination.current_page)
							} else {
								this.getUserList()
							}
						}
						this.form_loading = false
						this.inactive_button_loading = false
					} else {
						if (res.body.content && res.body.content.reason) {
							alert(res.body.content.reason)
						} else {
							alert(res.body.message)
						}
						this.form_loading = false
						this.inactive_button_loading = false
					}
				},
				function (err)
				{
					alert('Connection error!')
				}
			)
		},
		deleteUser: function(id, index)
		{
			var r = confirm("Delete this User?");
			if (r != true) return
			if (this.form_loading) {
				alert('The Page still loading')
				return
			}
			this.form_loading = true
			this.del_button_loading = true
			var params = {
				'id' : id
			}
			this.$http.post(config.backend_domain + '/user/ajaxdelete', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status === 'ok') {
						this.form_loading = false
						this.del_button_loading = false
						if (this.searchComponentState) {
							if (this.pagination_on_searchComponent.caption) {
								this.getDataOnPageSearchComponent(this.pagination_on_searchComponent.current_page)
							} else {
								this.searchOnComponent()
							}
						} else {
							if (this.pagination.caption) {
								this.getDataOnPage(this.pagination.current_page)
							} else {
								this.getUserList()
							}
						}
					} else {
						this.form_loading = false
						this.del_button_loading = false
						if (res.body.content.reason) {
							alert(res.body.content.reason)
						} else if(res.body.message) {
							alert(res.body.message)
						} else {
							alert('Internal server error!')
						}
					}
				},
				function (err)
				{
					alert('Connection error!')
				}
			)
		},
		addUser: function ()
		{
			var params = {
				'id' : '',
				'real_name' : this.user_real_name,
				'group_id' : (this.group_id ? this.group_id : 'xxx'),
				'name' : this.user_name,
				'password' : this.password,
				'confirm' : this.confirm,
			}
			this.$http.post(config.backend_domain + '/user/ajaxadd', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						alert('Success menambahkan user baru!')
						this.getUserList()
						$('#myModal').modal('hide')
					}else{
						if (res.body.content.flag) {
							alert(res.body.content.alert)
						} else if (res.body.content.reason) {
							alert(res.body.content.reason)
						} else if(res.body.message) {
							alert(res.body.message)
						} else {
							alert('Internal server error!')
						}
					}
				},
				function (err)
				{
					alert('Connection error!')
				}
			)
		},
		editUser: function ()
		{
			var params = {
				'id' : this.user_id,
				'real_name' : this.user_real_name,
				'group_id' : (this.group_id ? this.group_id : 'xxx'),
				'name' : this.user_name,
				'password' : this.password,
				'confirm' : this.confirm,
			}
			this.$http.post(config.backend_domain + '/user/ajaxedit', params, {credentials: true}).then(
				function (res) {
					if (res.body.status == 'success') {
						alert('Success melakukan edit data user!')
						$('#myModal').modal('hide')
						if (this.searchComponentState) {
							if (this.pagination_on_searchComponent.caption) {
								this.getDataOnPageSearchComponent(this.pagination_on_searchComponent.current_page)
							} else {
								this.searchOnComponent()
							}
						} else {
							if (this.pagination.caption) {
								this.getDataOnPage(this.pagination.current_page)
							} else {
								this.getUserList()
							}
						}
					}else{
						if(res.body.content.flag){
							alert(res.body.content.alert)
						} else if (res.body.content.reason) {
							alert(res.body.content.reason)
						} else if(res.body.message) {
							alert(res.body.message)
						} else {
							alert('Internal server error!')
						}
					}
				},
				function (err) {
					alert('Connection error!')
				}
			)
		},
		changeFormatDate: function (stringdate)
		{
			var fulldate = stringdate.split('-')
			var month = parseInt(fulldate[1]) - 1
			fulldate[1] = this.monthlist[month]
			return fulldate.reverse().join(' ')
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
		getDataOnPage: function (page)
		{
			this.user_list = ''
			this.$http.get(config.backend_domain + '/user?page=' + page, {credentials: true}).then(
				function (res) {
					if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal(page, this.getDataOnPage)
						return
					} else if (res.body.status === 'success') {
						this.user_list = res.body.content
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
		initSearchComponent: function ()
		{
			this.searchComponentState = false
			this.search_data.state = 'idle'
			this.search_data.message = ''
			this.search_data.response = ''
			this.search_data.params = {
				search_txt: '*',
				column_choice: 'user_name',
				rank_choice: 'any',
				status_choice: 'any',
				partial: 1,
				option: 'per_pages',
				start_date: new Date().toISOString().split('T')[0],
				create_start_date: new Date().toISOString().split('T')[0]
			}
		},
		callSearchComponent: function ()
		{
			this.searchComponentState = true
			this.initPaggenationOnSearchComponent()
		},
		searchOnComponent: function ()
		{
			this.search_data.state = 'searching'
			var params = {
				closeBtn: 'Close',
				act_search: 'Find',
				option: this.search_data.params.option,
				partial: this.search_data.params.partial,
				status_choice: this.search_data.params.status_choice,
				rank_choice: this.search_data.params.rank_choice,
				start_date: this.search_data.params.start_date.split('-').reverse().join('-'),
				create_start_date: this.search_data.params.create_start_date.split('-').reverse().join('-'),
				column_choice: this.search_data.params.column_choice,
				search_txt: this.search_data.params.search_txt
			}
			if (!params.search_txt) {
				this.search_data.state = 'error'
				this.search_data.message = 'Field search kosong, silahkan masukkan kata kunci terlebih dahulu!'
				return
			}
			this.$http.post(config.backend_domain + '/user/search', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status === 'success') {
						if (!res.body.content.list || !res.body.content.list.length) {
							this.search_data.state = 'error'
							this.search_data.message = 'List data kosong, silahkan ulangi lagi pencariannya!'
							return
						}
						this.search_data.state = 'idle'
						this.search_data.message = ''
						this.search_data.response = res.body.content
						this.generatePaggenationOnSearchComponent(res.body.content)
					} else if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal('', this.searchOnComponent)
					} else {
						this.search_data.state = 'error'
						if (res.body.content.reason) {
							this.search_data.message = res.body.content.reason 
						} else if (res.body.message) {
							this.search_data.message = res.body.message
						} else {
							this.search_data.message = 'Gagal mendapatkan data searching, silahkan ulang lagi!'
						}
					}
				},
				function (err)
				{
					this.search_data.state = 'error'
					this.search_data.message = 'Connection error!'
					alert('Connection error!')
				}
			)
		},
		initPaggenationOnSearchComponent: function ()
		{
			this.pagination_on_searchComponent.first_page = 1,
			this.pagination_on_searchComponent.caption = '',
			this.pagination_on_searchComponent.last_page = '',
			this.pagination_on_searchComponent.current_page = '',
			this.pagination_on_searchComponent.prev_page = '',
			this.pagination_on_searchComponent.next_page = '',
			this.pagination_on_searchComponent.page_list = []
		},
		generatePaggenationOnSearchComponent: function (response)
		{
			this.initPaggenationOnSearchComponent()
			this.pagination_on_searchComponent.caption = response.caption
			if (response.page_list == 0) {
				this.pagination_on_searchComponent.current_page = 0
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
				if ((pages[0] - 1) >= this.pagination_on_searchComponent.first_page) {
					this.pagination_on_searchComponent.prev_page = pages[0] - 1
				}
				if ((pages[pages.length - 1] + 1) <= total_page) {
					this.pagination_on_searchComponent.next_page = pages[pages.length - 1] + 1
				}
				this.pagination_on_searchComponent.page_list = pages
				this.pagination_on_searchComponent.last_page = total_page
				if (typeof(page) === 'number'){
					this.pagination_on_searchComponent.current_page = page
				} else {
					this.pagination_on_searchComponent.current_page = parseInt(page)
				}
			}
		},
		getDataOnPageSearchComponent: function (page)
		{
			this.search_data.state = 'searching'
			this.search_data.message = ''
			this.pagination_on_searchComponent.caption = ''
			this.search_data.response = ''
			var params = {
				closeBtn: 'Close',
				act_search: 'Find',
				option: this.search_data.params.option,
				partial: this.search_data.params.partial,
				status_choice: this.search_data.params.status_choice,
				rank_choice: this.search_data.params.rank_choice,
				start_date: this.search_data.params.start_date.split('-').reverse().join('-'),
				create_start_date: this.search_data.params.create_start_date.split('-').reverse().join('-'),
				column_choice: this.search_data.params.column_choice,
				search_txt: this.search_data.params.search_txt,
				page: page
			}
			this.$http.post(config.backend_domain + '/user/search?page=' + page, params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status === 'timeout') {
						this.$root.callSessionTimeoutModal(page, this.getDataOnPageSearchComponent)
						return
					} else if (res.body.status === 'success') {
						this.search_data.response = res.body.content
						this.generatePaggenationOnSearchComponent(res.body.content)
						this.search_data.state = 'idle'
						this.search_data.message = ''
					} else if (res.body.status === 'failed') {
						this.search_data.state = 'error'
						if(res.body.content.reason){
							alert(res.body.content.reason)
							this.search_data.message = res.body.content.reason
						} else {
							alert(res.body.message)
							this.search_data.message = res.body.message
						}
						return
					} else {
						alert('Internal serer error!')
						this.search_data.state = 'error'
						this.search_data.message = 'Internal serer error!'
						return
					}
				},
				function (err)
				{
					alert('Connection error!')
					this.search_data.state = 'error'
					this.search_data.message = 'Connection error!'
					return
				}
			)
		},
		initInfoSchedule: function ()
		{
			this.schedule_info.selected_id = ''
			this.schedule_info.process_on = ''
			this.schedule_info.state = 'idle'
			this.schedule_info.message = ''
			this.schedule_info.content = ''
		}
	}
})
