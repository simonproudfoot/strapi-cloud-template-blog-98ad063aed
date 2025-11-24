import pluginId from './pluginId.js';
import { PluginIcon } from './PluginIcon.js';
import { Initializer } from './Initializer.js';

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.menu.label`,
        defaultMessage: 'AI Recipes',
      },
      Component: async () => {
        const component = await import('./pages/App/index.jsx');
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
