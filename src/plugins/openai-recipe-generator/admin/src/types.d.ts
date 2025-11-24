declare module './pluginId' {
  const pluginId: string;
  export default pluginId;
}

declare module './PluginIcon' {
  import { ComponentType } from 'react';
  export const PluginIcon: ComponentType;
}

declare module './Initializer' {
  import { ComponentType } from 'react';
  export const Initializer: ComponentType;
}

declare module './pages/App' {
  import { ComponentType } from 'react';
  const AppPage: ComponentType;
  export default AppPage;
}



