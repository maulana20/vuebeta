var app = new Vue({
	components: {
		'app-view': {
			template: ' '
		},
		'sessiontimeout': {
			template: '#timeout-modal-template',
			props: ['params', 'callback'],
			data: function () {
				return {
					session_data: {
						user_name: '',
						user_password: ''
					},
					session_path: '/admin',
					session_state: 'idle'
				}
			},
			methods: {
				close: function () {
					this.$emit('callbackinit')
				},
				submitSession: function () {
					var params = {
						user: this.session_data.user_name.trim(),
						password: this.session_data.user_password
					}
					if (!this.session_data.user_name || !this.session_data.user_password) {
						alert('Mohon lengkapi username dan passwordnya!')
						return
					}
					this.session_state = 'checking'
					this.$http.post(config.backend_domain + this.session_path, params, { credentials: true }).then(
						function (res) {
							if (res.body.status === 'success') {
								this.callback(this.params)
								this.close()
							} else {
								this.session_state = 'failed'
								if (res.body.content.reason) {
									alert(res.body.content.reason)
								} else if (res.body.message) {
									alert(res.body.message)
								} else {
									alert('Internal server error!')
								}
							}
						},
						function (err) {
							this.session_state = 'idle'
							alert('Connection error!')
						}
					)
				}
			}
		}
	},
	data: {
		shortcut: null,
		propsdata: null,
		user_data: {},
		is_login: false,
		sidebar_menu: [
			{
				title: 'Beranda',
				icon: 'fa-home',
				link: '#/dashboard',
				status: true
			},
			{
				title: 'Administrasi',
				icon: 'fa-user',
				status: false,
				check_key: 'Administration',
				children: [
					{
						title: 'User',
						link: '#/administration/user',
						status: false,
						check_key: 'Administration.User'
					},
					{
						title: 'Group',
						link: '#/administration/group',
						status: false,
						check_key: 'Administration.Group'
					},
					{
						title: 'User Log',
						link: '#/administration/user-log',
						status: false,
						check_key: 'Administration.Show User Log'
					}
				]
			},
			{
				title: 'Operational',
				icon: 'fa-user',
				status: false,
				check_key: 'Operational'
			},
			{
				title: 'Accounting',
				icon: 'fa-user',
				status: false,
				check_key: 'Accounting',
				children: [
					{
						title: 'Journal',
						link: '#/accounting/journal',
						status: false,
						check_key: 'Accounting.Journal'
					},
					{
						title: 'General Ledger',
						link: '#/accounting/generalledger',
						status: false,
						check_key: 'Accounting.General Ledger'
					},
					{
						title: 'Trial Balance',
						link: '#/accounting/trialbalance',
						status: false,
						check_key: 'Accounting.Trial Balance'
					},
					{
						title: 'Balance Sheet (Account)',
						link: '#/accounting/balancesheet-account',
						status: false,
						check_key: 'Accounting.Balance Sheet'
					},
					{
						title: 'Posting',
						link: '#/accounting/posting',
						status: false,
						check_key: 'Accounting.Posting'
					},
					{
						title: 'Closing',
						link: '#/accounting/closing',
						status: false,
						check_key: 'Accounting.Closing'
					}
				]
			},
			{
				title: 'Finance',
				icon: 'fa-user',
				status: false,
				check_key: 'Finance',
				children: [
					{
						title: 'General Cash Bank',
						link: '#/finance/general-cash-bank',
						status: false,
						check_key: 'Finance.General Cash Bank'
					},
					{
						title: 'Inter Cash Bank',
						link: '#/finance/inter-cash-bank',
						status: false,
						check_key: 'Finance.Inter Cash Bank'
					}
				]
			}
		],
		conditional_menu: {},
		sidebar_menu_old: [],
		showSessionModal: false,
		sessionTimeoutCallbackParams: null,
		sessionTimeoutCallback: null,
		monthlist : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
		notification: {
			total_count: 0
		}
	},
	mounted: function () {
		this.checkLogin()
		setTimeout(function () {
			if (!this.is_login) {
				window.location.href = '/login'
				window.localStorage.clear()
			}
		}.bind(this), 5000)
		setInterval( function () {
		}.bind(this), 60000)
		$(window).on('hashchange', function () {
			this.$appRouter.route(window.location.hash.slice(1))
			if (window.innerWidth < 500) {
				$('html').removeClass('hidden-menu-mobile-lock')
				$('body').removeClass('hidden-menu')
				$('body').removeClass('minified')
			}
		}.bind(this))
		this.shortcut = window.$('#shortcut')
	},
	methods: {
		intToISODate: function (date) {
			var temp = new Date(date * 1000)
			var result = new Date(temp.valueOf() - (temp.getTimezoneOffset() * 60 * 1000)).toISOString().split('.')[0]
			return result
		},
		changeFormatDate: function (stringdate) {
			var fulldate = stringdate.split('-')
			var month = parseInt(fulldate[1]) - 1
            fulldate[1] = this.monthlist[month]
            return fulldate.reverse().join(' ')
		},
		isValidMenu: function (check_key) {
			if (!check_key) {
				return false
			}
			var check_key_arr = check_key.split('.').reverse()
			var deep = 1
			var custom_menu = Object.assign({}, this.conditional_menu)
			while (check_key_arr.length && custom_menu) {
				var key = check_key_arr.pop()
				if (deep == 1) {
					custom_menu = custom_menu[key]
				} else {
					custom_menu = custom_menu.filter(function (item) {
						return item == key || item[key]
					})
					if (custom_menu.length) {
						custom_menu = custom_menu[0]
						if (typeof custom_menu != 'string') {
							custom_menu = custom_menu[key]
						}
					} else {
						custom_menu = null
					}
				}
				deep++
			}
			if (custom_menu) {
				return true
			} else {
				return false
			}
		},
		initSidebarSubmenu: function () {
			window.$('nav ul').jarvismenu({
				accordion: true,
				speed: 235,
				closedSign: '<em class="fa fa-plus-square-o"></em>',
				openedSign: '<em class="fa fa-minus-square-o"></em>'
			})
		},
		checkLogin: function () {
			window.$('#app-loading-message').text('Checking login state')
			var requesturl = window.config.backend_domain + '/admin/isonlogin'
			this.$http.get(requesturl, null, { credentials: true }).then(
				function (res) {
					if (res.body.status === 'failed' || !res.body.content) {
						window.location.href = '/login'
						window.localStorage.clear()
					} else if(res.body.status == 'changepassword') {
						location.href = '/resetpassword'
					} else {
						this.$http.get(config.backend_domain + '/admin/getmenu', { credentials: true }).then(
							function (res) {
								if (res.body.status === 'success') {
									this.conditional_menu = res.body.content.menu
									window.$('#app-loading-message').text('Application Loading')
									window.$('body').removeClass('loading')
									window.$('#timeout-modal-template').css('display', 'none')
									if (window.location.hash.length <= 2) {
										window.history.replaceState({},'','/#/dashboard')
										this.$appRouter.route('/dashboard')
									} else {
										this.$appRouter.route(window.location.hash.slice(1))
									}
									this.getUserData()
									this.is_login = true
									Vue.nextTick(this.initSidebarSubmenu)
								}
							},
							function (err) {
								Vue.nextTick(this.initSidebarSubmenu)
								alert('Connection error!')
							}
						)
					}
				},
				function () {
					this.$appRouter.route(window.location.hash.slice(1))
				}
			)
		},
		getUserData: function () {
			var requesturl = window.config.backend_domain + '/admin/getuserlogin'
			this.$http.get(requesturl, { credentials: true }).then(
				function (res) {
					if (res.body.status === 'success') {
						this.user_data = res.body.content.data.user
					}
				},
				function (err) {
					console.log('connection error at ' + new Date().toISOString())
				}
			)
		},
		logout: function () {
			var requesturl = window.config.backend_domain + '/admin/logout'
			this.$http.get(requesturl, { credentials: true }).then(
				function (res) {
					this.$alertResponseHandler(res)
					this.checkLogin()
				},
				function (err) {
					console.log('connection error at ' + new Date().toISOString())
				}
			)
		},
		toggleMenu: function () {
			var $ = window.$
			if (!$('body').hasClass('menu-on-top')) {
				$('html').toggleClass('hidden-menu-mobile-lock')
				$('body').toggleClass('hidden-menu')
				$('body').removeClass('minified')
			} else if ($('body').hasClass('menu-on-top') && $(window).width() < 979) {
				$('html').toggleClass('hidden-menu-mobile-lock')
				$('body').toggleClass('hidden-menu')
				$('body').removeClass('minified')
			}
		},
		toggleFullScreen: function () {
			var $ = window.$
			var body = $('body')
			var element = document.documentElement
			if (!body.hasClass('full-screen')) {
				body.addClass('full-screen')
				if (element.requestFullscreen) {
					element.requestFullscreen()
				} else if (element.mozRequestFullscreen) {
					element.mozRequestFullscreen()
				} else if (element.webkitRequestFullscreen) {
					element.webkitRequestFullscreen()
				} else if (element.msRequestFullscreen) {
					element.msRequestFullscreen()
				}
			} else {
				body.removeClass('full-screen')
				if (window.document.exitFullscreen) {
					window.document.exitFullscreen()
				} else if (window.document.webkitExitFullscreen) {
					window.document.webkitExitFullscreen()
				} else if (window.document.mozCancelFullscreen) {
					window.document.mozCancelFullscreen()
				}
			}
		},
		callSessionTimeoutModal: function (data, callback) {
			this.sessionTimeoutCallbackParams = data
			this.sessionTimeoutCallback = callback
			this.showSessionModal = true
		},
		sessionTimeoutOnCallbackHandler: function () {
			this.showSessionModal = false
			this.sessionTimeoutCallbackParams = null
			this.sessionTimeoutCallback = null
		},
		formatCurrency: function (val) {
            return val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,").split(',').join('.')
        }
	}
})
var router = new Router(app, routes)
app.$mount('#vas')
