({
	template: '',
	data: function()
	{
		return {
			monthlist : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
			terminal_list: [],
			groupaccount_list: [],
			balancesheet_activa: '',
			balancesheet_passiva: '',
			origin_account_name: '',
			account_name: '',
			coa_id: '',
			groupaccount_id: '',
			user_name: '',
			groupaccount_desc: '',
			coatype_code: '',
			coa_code: '',
			coa_name: '',
			lod: '',
			coa_desc: '',
			coa_created: '',
			isEdit: false,
			modalLoadingState: false,
			lod_list: [1, 2, 3, 4, 5],
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
		this.balanceSheetList()
	},
	methods: {
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
		balanceSheetList: function()
		{
			this.$http.get(config.backend_domain + '/balancesheet/list', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.balancesheet_activa = res.body.content.balancesheet_activa
						this.balancesheet_passiva = res.body.content.balancesheet_passiva
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.balanceSheetList)
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
		getGroupAccountList: function()
		{
			this.$http.get(config.backend_domain + '/groupaccount/list', {credential: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.init_page.state = 'success'
						this.init_page.message = ''
						this.groupaccount_list = res.body.content.list
					} else if (res.body.status == 'failed') {
						this.init_page.state = 'failed'
						this.init_page.message = 'Gagal mendapatkan akun grup !'
						alert('Gagal mendapatkan akun grup !')
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.balanceSheetList)
						$('.modal-backdrop').remove();
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
		restoreDropDown: function() {
			setTimeout(
				function () {
					this.doRestoreDropDown()
				}.bind(this), 200
			)
		},
		doRestoreDropDown: function() {
			var filtered_groupaccount = this.groupaccount_list.filter(
				function (groupaccount) {
					return groupaccount.groupaccount_id
				}.bind(this)
			)
		},
		filteredDropDown: function() {
			return this.groupaccount_list.filter(function (groupaccount) {
				return (groupaccount.groupaccount_name.toLowerCase().indexOf(this.account_name.toLowerCase()) >= 0)
			}.bind(this))
		},
		selectDropDown: function(data) {
			this.account_name = data.groupaccount_name
			this.origin_account_name = data.groupaccount_name
			this.groupaccount_id = data.groupaccount_id
		},
		underDevelopment: function()
		{
			alert('Sedang dalam tahap pengembangan!')
			return
		},
		addCoa: function()
		{
			var params = {
				'code': this.coa_code,
				'name': this.coa_name,
				'lod': this.lod,
				'desc': this.coa_desc,
				'groupaccount_id': this.groupaccount_id
			}
			this.$http.post(config.backend_domain + '/coa/ajaxadd', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						alert('Success melakukan tambah coa !')
						$('#myModal').modal('hide')
						this.balanceSheetList()
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.balanceSheetList)
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
		editCoa: function()
		{
			var params = {
				'id': this.coa_id,
				'code': this.coa_code,
				'name': this.coa_name,
				'lod': this.lod,
				'desc': this.coa_desc,
				'groupaccount_id': this.groupaccount_id
			}
			this.$http.post(config.backend_domain + '/coa/ajaxedit', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						alert('Success melakukan ubah coa !')
						$('#myModal').modal('hide')
						this.balanceSheetList()
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.balanceSheetList)
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
		openModal: function(method, id)
		{
			this.modalLoadingState = true
			if (method == 'Add') {
				this.isEdit = false
				$('#modal_title').html('ADD COA')
				this.$http.get(config.backend_domain + '/coa/add', {credential: true}).then(
					function (res)
					{
						this.user_name = this.coa_id = this.coa_code = this.coa_name = this.coa_desc = this.lod = this.groupaccount_id = this.account_name = this.coatype_code = this.coa_created = ''
						this.modalLoadingState = false
						this.getGroupAccountList()
							$('.modal-backdrop').remove();
					},
					function (err)
					{
						alert('Connection error !')
					}
				)
			} else if (method == 'Edit') {
				this.isEdit = true
				$('#modal_title').html('EDIT COA')
				this.$http.get(config.backend_domain + '/coa/edit/' + id, {credential: true}).then(
					function (res)
					{
						this.modalLoadingState = false
						if (res.body.status == 'success') {
							this.coa_id = res.body.content.list.coa_id
							this.groupaccount_id = res.body.content.list.groupaccount_id
							this.account_name = res.body.content.list.groupaccount_name
							this.getGroupAccountList()
							this.coatype_code = res.body.content.list.coatype_code
							this.coa_code = res.body.content.list.coa_code
							this.coa_name = res.body.content.list.coa_name
							this.lod = res.body.content.list.lod
							this.coa_desc = res.body.content.list.coa_desc
							this.user_name = res.body.content.list.user_name
							this.coa_created = res.body.content.list.coa_created
							$('.modal-backdrop').remove();
						} else if (res.body.status == 'failed') {
							alert(res.body.content.reason)
							$('.modal-backdrop').remove();
						} else if (res.body.status == 'timeout') {
							this.$root.callSessionTimeoutModal('', this.balanceSheetList)
							$('.modal-backdrop').remove();
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
				$('#modal_title').html('Unknown')
				$('#modal_body').html('Unknown')
			}
		}
	}
})
