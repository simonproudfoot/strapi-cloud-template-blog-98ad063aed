declare module './routes' {
  import { Route } from '@strapi/strapi';
  const routes: Route[];
  export default routes;
}

declare module './controllers' {
  const controllers: Record<string, any>;
  export default controllers;
}

declare module './services' {
  const services: Record<string, any>;
  export default services;
}



