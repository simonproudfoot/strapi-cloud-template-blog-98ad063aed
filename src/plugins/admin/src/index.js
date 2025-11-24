'use strict';

const pluginId = require('./pluginId');
const { PluginIcon } = require('./PluginIcon');
const { Initializer } = require('./Initializer');

module.exports = {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.menu.label`,
        defaultMessage: 'AI Recipes',
      },
      Component: async () => {
        const component = await Promise.resolve().then(() => require('./pages/App'));
        return component.default || component;
      },
      permissions: [],
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: 'AI Recipes',
    });
  },
  bootstrap(app) {},
};
