import { createRouter, intentPreload } from '@solidjs/router';
import { fileRoutes } from '@solidjs/router/fs';
import { pageRoutes } from 'virtual:file-routes';

export const Router = createRouter({
  routes: fileRoutes(pageRoutes),
  preloadLinks: intentPreload({ delay: 120, data: true }),
});
export const { paths } = Router;
