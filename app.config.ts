import pages from './navigation'

export default defineAppConfig({

  tairo: {
    title: 'Front Structure',

    collapse: {
      toolbar: {
        enabled: true,
        showTitle: true,
        showNavBurger: true,
        tools: [
          {
            component: 'DemoThemeToggle',
          },
          {
            component: 'DemoToolbarNotifications',
          },
          {
            component: 'AppSettings',
          },
          {
            component: 'AppAccountMenu',
          },
        ],
      },
      circularMenu: {
        enabled: false
      },
      navigation: {
        enabled: true,
        header: {
          component: 'DemoCollapseNavigationFooter',
        },
        items: pages as any,
      },
    },
    sidebar: {
      toolbar: {
        enabled: true,
        showTitle: true,
        showNavBurger: true,
        tools: [
          {
            component: 'DemoThemeToggle',
          },
          {
            component: 'DemoToolbarNotifications',
          },
          {
            component: 'AppSettings',
          },
          {
            component: 'AppAccountMenu',
          },
        ],
      },
      circularMenu: {
        enabled: false
      },
      navigation: {
        enabled: true,
        items: pages as any,
      },
    }

  },

})
