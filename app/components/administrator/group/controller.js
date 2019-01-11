({
	template: '',
	data: function ()
	{
		return {
			group_list: '',
			group_id: '',
			group_code: '',
			group_name: '',
			group_bar: '',
			super_user: false,
			del_button_loading : false,
			add_button_loading : false,
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
			canEdit: false,
			isEdit: false,
			modalLoadingState: false
		}
	},
	mounted: function ()
	{
		this.groupList()
	},
	methods: {
		groupList: function ()
		{
			this.$http.get(config.backend_domain + '/group/list', {credentials: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.group_list = res.body.content.list
						this.super_user = res.body.content.super_user
						this.canEdit = res.body.content.canEdit
						this.generatePaggenation(res.body.content)
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
					} else if (res.body.status == 'timeout') {
						this.$root.callSessionTimeoutModal('', this.groupList)
					} else {
						alert('Connection error!')
					}
				},
				function (err)
				{
					alert('Connection error!')
				}
			)
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
			if (response.page_list == 0) {
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
		changeFormatDate: function (stringdate)
		{
			var fulldate = stringdate.split('-')
			var month = parseInt(fulldate[1]) - 1
			fulldate[1] = this.monthlist[month]
			return fulldate.reverse().join(' ')
		},
		intToISODate: function (date)
		{
			if (typeof (date) == 'string') {
				date = parseInt(date);
			}
			var temp = new Date(date * 1000)
			var result = new Date(temp.valueOf() - (-420  * 60 * 1000)).toISOString().split('.')[0]
			return result
		},
		deleteGroup: function (id, index)
		{
			var r = confirm('Delete this Group ?')
			if (r != true) {
				return
			}
			if (this.del_button_loading) {
				alert('The Page still loading')
				return
			}
			this.del_button_loading = true
			var params = {
				'id': id
			}
			this.$http.post(config.backend_domain + '/group/ajaxdelete', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						this.del_button_loading = false
						this.groupList()
					} else if (res.body.status == 'failed') {
						this.del_button_loading = false
						alert(res.body.content.reason)
					} else {
						alert('Internal server error!')
					}
				},
				function (err)
				{
					alert('Internal server error!')
				}
			)
		},
		addGroup: function ()
		{
			var form = document.form
			var access = ''
			for (i = 0; i < form.length; i++) {
				if (form.elements[i].disabled) continue
				if (form.elements[i].type = 'checkbox') {
					if (form.elements[i].checked) access += ' ' + form.elements[i].value
				}
			}
			access = access.trim()
			var params = {
				'id': this.group_id,
				'code': this.group_code,
				'name': this.group_name,
				'access': access
			}
			this.$http.post(config.backend_domain + '/group/ajaxadd', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status == 'success'){
						alert('Success melakukan add group !')
						$('#myModal').modal('hide')
						this.groupList()
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
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
		editGroup: function ()
		{
			var form = document.form
			var access = ''
			for (i = 0; i < form.length; i++) {
				if (form.elements[i].disabled) continue
				if (form.elements[i].type = 'checkbox') {
					if (form.elements[i].checked) access += ' ' + form.elements[i].value
				}
			}
			access = access.trim()
			var params = {
				'id': this.group_id,
				'code': this.group_code,
				'name': this.group_name,
				'access': access
			}
			this.$http.post(config.backend_domain + '/group/ajaxedit', params, {credentials: true}).then(
				function (res)
				{
					if (res.body.status == 'success') {
						alert('Success melakukan edit group !')
						$('#myModal').modal('hide')
						this.groupList()
					} else if (res.body.status == 'failed') {
						alert(res.body.content.reason)
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
		createColumn: function(menu)
		{
			var result = []
			if (menu != null && menu != '' && menu.length) {
				menu.forEach(function (mainmenu) {
					var grouping = []
					var onclick = ''
					var access = []
					
					//looping for get how many child-node here
					if (mainmenu.node && mainmenu.node.length) {
						mainmenu.node.forEach(function (item) {
							access.push("'" + item.access.toLowerCase() + "'")
						})
					}
					if (access.length > 0) onclick = "[" + access.join(",") + "]"
					
					// parent-node here
					grouping.push({
						'caption': mainmenu['caption'],
						'ref': 0,
						'access': mainmenu['access'],
						'onClick': onclick,
						'style': ''
					})
					
					// init for child-node
					if (mainmenu.node && mainmenu.node.length) {
						mainmenu.node.forEach(function (childmenu) {
							onclick = ''
							access = []
							
							if (childmenu.node && childmenu.node.length) {
								childmenu.node.forEach(function (subitem) {
									access.push("'" + subitem.access.toLowerCase() + "'")
								})
							}
							if (access.length > 0) onclick = "[" + access.join(",") + "]"
							
							grouping.push({
								'caption': childmenu['caption'],
								'ref': 1,
								'access': childmenu['access'],
								'onClick': onclick,
								'style': 'padding-left:10px;'
							})
							
							// init for subchild-node
							if (childmenu.node && childmenu.node.length) {
								childmenu.node.forEach(function (subchildmenu) {
									grouping.push({
										'caption': subchildmenu['caption'],
										'ref': 2,
										'access': subchildmenu['access'],
										'onClick': '',
										'style': 'padding-left:20px;'
									}) 
								})
							}
						})
					}
					
					//sett on result based on grouping
					result.push(grouping)
				})
			}
			
			return result
		},
		groupBar: function(menu, params)
		{
			var data = []
			for (var i = 0; i < params.length; i++) {
				data[params[i]] = params[i]
			}
			var group_array = this.createColumn(menu)
			var max = 0
			group_array.forEach(function (item, index) {
				max = Math.max(max, group_array[index].length)
			})
			var length_col = Math.floor(100 / menu.length)
			var form_html = ''
			form_html += '<form name="form" method="post" action="" onsubmit="return false;">' + '\n'
			form_html += '<table width="100%" border="1" bordercolor="#fafcf2" cellpadding="0" cellspacing="0">' + '\n'
			for (i = 0; i < max; i++) {
				form_html += '<tr>' + '\n'
				menu.forEach(function (mainmenu, index) {
					var color = ''
					color = (index % 2 != 0) ? '#A3C8AC' : '#A2D8A2'
					
					var group_list = group_array[index][i]
					if (group_list != undefined) {
						form_html += '<td height="21" width="' + length_col + '%" bgcolor="' + color + '" style="' + ( group_list.style != null && group_list.style != '' ? group_list.style : 'padding-left:5px;' ) + '">' + '\n'
						
						var font_attr = ''
						if (group_list.style != null && group_list.style != '') {
							font_attr = 'style="font-size:12px;"'
							form_html += '<font color="' + ( group_list.ref == 1 ? '#000000' : '#0000FF' ) + '" size="-2">&#9654;</font>'
						} else {
							font_attr = 'style="font-size:12px; font-weight:bold;"'
						}
						
						if (group_list.caption != null && group_list.caption != '') {
							var attr = ''
							if (group_list.onClick != null && group_list.onClick != '') {
								attr = 'id="' + group_list.access.toLowerCase() + '" onclick="' + 'onClick(this,' + group_list.onClick + ')' + '"'
							} else {
								attr = 'id="' + group_list.access.toLowerCase() + '"'
							}
							form_html += '<input type="checkbox" id="' + group_list.access.toLowerCase() + '" value="' + group_list.access + '" ' + ( ( (data[group_list.access] != null && data[group_list.access] != '') && (data[group_list.access] == group_list.access) ) ? 'checked' : '' ) + ' ' + attr + ' >&nbsp;';
							form_html += '<label for="' + group_list.access.toLowerCase() + '"><font ' + font_attr + '>' + group_list.caption + '</font></label>';
						} else {
							form_html += '&nbsp;'
						}
						form_html += '</td>' + '\n'
					} else {
						form_html += '<td bgcolor="' + color + '">&nbsp;</td>' + '\n'
					}
				})
				form_html += '</tr>' + '\n'
			}
			form_html += '</table>' + '\n'
			form_html += '</form>' + '\n'
			
			return form_html
		},
		openModal: function(method, id)
		{
			this.modalLoadingState = true
			if (method == 'Add') {
				this.isEdit = false
				$('#modal_title').html('ADD GROUP')
				this.$http.get(config.backend_domain + '/group/add', {credential: true}).then(
					function (res)
					{
						this.modalLoadingState = false
						if (res.body.status == 'success') {
							var script = document.createElement('script')
							script.src = "/static/js/groupBar.js"
							document.head.appendChild(script)
							
							this.group_id = res.body.content.group_id
							this.group_code = res.body.content.group_code
							this.group_name = res.body.content.group_name
							this.super_user = res.body.content.super_user
							this.group_bar = this.groupBar(res.body.content.group_menu, res.body.content.group_data)
						} else if (res.body.status == 'failed') {
							alert(res.body.content.reason)
						} else if (res.body.status == 'timeout') {
							this.$root.callSessionTimeoutModal('', this.groupList)
						} else {
							alert('Connection error !')
						}
					},
					function (err)
					{
						alert('Connection error !')
						this.modalLoadingState = false
						$('modal-body').html('Connection error !')
					}
				)
			} else if (method == 'Edit') {
				this.isEdit = true
				$('#modal_title').html('EDIT GROUP')
				this.$http.get(config.backend_domain + '/group/edit/' + id, {credential: true}).then(
					function (res)
					{
						this.modalLoadingState = false
						if (res.body.status == 'success') {
							var script = document.createElement('script')
							script.src = "/static/js/groupBar.js"
							document.head.appendChild(script)
							
							this.group_id = res.body.content.group_id
							this.group_code = res.body.content.group_code
							this.group_name = res.body.content.group_name
							this.super_user = res.body.content.super_user
							this.group_bar = this.groupBar(res.body.content.group_menu, res.body.content.group_data)
						} else if (res.body.status == 'failed') {
							alert(res.body.content.reason)
						} else if (res.body.status == 'timeout') {
							this.$root.callSessionTimeoutModal('', this.groupList)
						} else {
							alert('Connection error !')
						}
					},
					function (err)
					{
						alert('Connection error !')
						this.modalLoadingState = false
						$('modal-body').html('Connection error !')
					}
				)
			} else {
				$('#modal_title').html('Unknown')
				$('#modal_body').html('Unknown')
			}
		},
		underDevelopment: function()
		{
			alert('Sedang dalam tahap pengembangan!')
			return
		},
	}
})
