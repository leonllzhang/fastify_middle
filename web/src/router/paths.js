export default [
    {
      path: '/',
      name: 'DefaultPage',
      view: 'home',
      pageType: 'home',
      requiresAuth: true
    },
    {
      path: '/page/:pageView/:p1?/:p2?/:p3?/:p4?/:p5?',
      name: 'ChooseView',
      view: 'page',
      pageType: 'page',
      requiresAuth: true
    },   
    {
      path: '/systemmessage/:errorCode/:detailCode?',
      name: 'error',
      view: 'error',
      pageType: 'error',
      requiresAuth: false
    },
    {
      path: '/form/:formAlias/:p1?/:p2?/:p3?/:p4?/:p5?',
      name: 'form',
      view: 'form',
      pageType: 'form',
      requiresAuth: true
    }

  ]
  