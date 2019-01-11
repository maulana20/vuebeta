var routes = [
	{
		path: 'dashboard',
		component: new AsyncComponent('/app/components/dashboard'),
		style: '/app/components/dashboard/style.css?v=' + window.config.version,
		innerComponents: [
			{
				name: 'slideshow',
				component: new AsyncComponent('/app/components/__slideshow'),
				style: '/app/components/__slideshow/style.css?v=' + window.config.version
			},
			{
				name: 'info-system-update',
				component: new AsyncComponent('/app/components/__info_system_update'),
				style: '/app/components/__info_system_update/style.css?v=' + window.config.version
			}
		]
	},
	{
		path: 'administration',
		children: [
			{
				path: 'user',
				component: new AsyncComponent('/app/components/administrator/user'),
				style: '/app/components/administrator/user/style.css?v=' + window.config.version
			},
			{
				path: 'group',
				component: new AsyncComponent('/app/components/administrator/group'),
				style: '/app/components/administrator/group/style.css?v=' + window.config.version
			},
			{
				path: 'user-log',
				component: new AsyncComponent('/app/components/administrator/user_log'),
				style: '/app/components/administrator/user_log/style.css?v=' + window.config.version
			},
		]
	},
	{
		path: 'operational'
	},
	{
		path: 'accounting',
		children: [
			{
				path: 'journal',
				component: new AsyncComponent('/app/components/accounting/journal'),
				style: '/app/components/accounting/journal/style.css?v=' + window.config.version
			},
			{
				path: 'generalledger',
				component: new AsyncComponent('/app/components/accounting/generalledger'),
				style: '/app/components/accounting/generalledger/style.css?v=' + window.config.version
			},
			{
				path: 'trialbalance',
				component: new AsyncComponent('/app/components/accounting/trialbalance'),
				style: '/app/components/accounting/trialbalance/style.css?v=' + window.config.version
			},
			{
				path: 'balancesheet-account',
				component: new AsyncComponent('/app/components/accounting/balancesheet-account'),
				style: '/app/components/accounting/balancesheet-account/style.css?v=' + window.config.version
			},
			{
				path: 'posting',
				component: new AsyncComponent('/app/components/accounting/posting'),
				style: '/app/components/accounting/posting/style.css?v=' + window.config.version
			},
			{
				path: 'closing',
				component: new AsyncComponent('/app/components/accounting/closing'),
				style: '/app/components/accounting/closing/style.css?v=' + window.config.version
			},
		]
	},
	{
		path: 'finance',
		children: [
			{
				path: 'general-cash-bank',
				component: new AsyncComponent('/app/components/finance/general-cash-bank'),
				style: '/app/components/finance/general-cash-bank/style.css?v=' + window.config.version
			},
			{
				path: 'inter-cash-bank',
				component: new AsyncComponent('/app/components/finance/inter-cash-bank'),
				style: '/app/components/finance/inter-cash-bank/style.css?v=' + window.config.version
			}
		]
	}
]
