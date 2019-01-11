function Router (app, routes_config) {
  this.__generateRoutes = function (prefix, routes) {
    for (var i in routes) {
      this.routes[prefix + '/' + routes[i].path] = routes[i]
      if (routes[i].children) {
        this.__generateRoutes(prefix + '/' + routes[i].path, routes[i].children)
      }
      this.routes[prefix + '/' + routes[i].path].path = (prefix + '/' + routes[i].path).slice(1)
    }
  }
  this.__app = app
  this.__app.$appRouter = this
  this.routes = {}
  this.__generateRoutes('', routes_config)
 
  this.route = function (path) {
    this.__app.$options.components['app-view'] = {template: "<div class='text-center'>Loading</div>"}
    this.__app.app_view_state = path
    this.__app.$forceUpdate()
    var route_config = this.routes[path]
    if (!route_config) {
      route_config = MatchDynamicRoute(this.routes, path)
    }
    $('.mobile-menu-container').hide()

    if (route_config.component.constructor.name === 'AsyncComponent') {
      route_config.component.get().then(
        function (component) {
          if (route_config.style) {
            StyleDecorator(component, route_config.style)
          }
          getRouteParams(this.__app, component, path, route_config.path)
          if (route_config.innerComponents) {
            InnerComponentFactory(route_config.innerComponents).then(
              function (innerComponents) {
                component.components = innerComponents
                this.__app.$options.components['app-view'] = component
                this.__app.$forceUpdate()
                $(document).scrollTop(0)
              }.bind(this)
            )
          } else {
            this.__app.$options.components['app-view'] = component
            this.__app.$forceUpdate()
            $(document).scrollTop(0)
          }
        }.bind(this),
        function (err) {
          console.log('Error at ' + new Date())
        }
      )
    } else {
      if (route_config.style) {
        StyleDecorator(route_config.component, route_config.style)
      }
      this.__app.$options.components['app-view'] = route_config.component
      this.__app.$forceUpdate()
      $(document).scrollTop(0)
    }
  }

}

function MatchDynamicRoute (routes, route) {
  for (var attr in routes) {
    if (attr.indexOf(':') >= 0 && MatchRegExpRoute(attr, (routes[attr].props_config || {}), route)) {
      return routes[attr]
    }
  }
  return {
    component: new AsyncComponent('/app/components/__404'),
  }
}

function getRouteParams (app, component, path, path_config) {
  component.props = {}
  var propsdata = {}
  path_config = '/' + path_config  
  for(var i in path_config.split('/')) {
    if (path_config.split('/')[i].indexOf(':') >= 0) {
      component.props[path_config.split('/')[i].slice(1)] = {}
      try {
          component.props[path_config.split('/')[i].slice(1)]['default'] = eval(path.split('/')[i])
          propsdata[path_config.split('/')[i].slice(1)] = eval(path.split('/')[i])
      }
      catch(err) {
          component.props[path_config.split('/')[i].slice(1)]['default'] = path.split('/')[i]
          propsdata[path_config.split('/')[i].slice(1)] = path.split('/')[i]
      }
    }
  }
  component.props.propsdata = {}
  app.propsdata = propsdata
}

function MatchRegExpRoute (route, config, path) {
  var regexp_route = []
  for (var i in route.split('/')) {
    if (route.split('/')[i].indexOf(':') >= 0) {
      if (i == route.split('/').length - 1) {
        regexp_route.push(config[route.split('/')[i].slice(1)] + '$')
      } else {
        regexp_route.push(config[route.split('/')[i].slice(1)])
      }
    } else {
      regexp_route.push(route.split('/')[i])
    }
  }
  regexp_route = regexp_route.join('/')
  if (path.match(regexp_route)) {
    return true
  } else {
    return false
  }
}

function StyleDecorator (component, style_src) {
  component.template = component.template.replace(">", "> <link href='" + style_src + "' rel='stylesheet' media='screen'>")
}

async function InnerComponentFactory (inner_components) {
  var components = {}
  for (var index in inner_components) {
    await inner_components[index].component.get().then(
      function (component) {
        if (inner_components[index].style) {
          StyleDecorator(component, inner_components[index].style)
        }
        components[inner_components[index].name] = component
      }
    )
  }
  return components
}

function AsyncComponent (path, noTemplating) {
  this.__component = null
  this.__path = path
  this.__noTemplating = noTemplating
  this.get = function () {
    if (!this.__component) {
      return new Promise(function (resolve, reject) {
        Vue.http.get(this.__path + '/controller.js?v=' + window.config.version).then(
          function (res) {
            this.__component = eval(res.body)
            if (!this.__noTemplating) {
              Vue.http.get(this.__path + '/template.html?v=' + window.config.version).then(
                function (res) {
                  this.__component.template = res.body
                  resolve(this.__component)
                }.bind(this),
                function (err) {
                  reject(null)
                }
              )
            } else {
              resolve(this.__component)
            }
          }.bind(this),
          function (err) {
            reject(null)
          }
        )
      }.bind(this))
    } else {
      return Promise.resolve(this.__component)
    }
  }
}
