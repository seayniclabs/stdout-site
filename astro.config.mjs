// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://stdout.seayniclabs.com',
  output: 'server',
  security: { checkOrigin: false },
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
});
