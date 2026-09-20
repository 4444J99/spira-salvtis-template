import { defineConfig, sessionDrivers } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://hub-example.com',
  // imageService 'compile' uses Astro's build-time image service (the site
  // does no astro:assets optimization), avoiding the v13 default that requires
  // a Cloudflare 'IMAGES' binding this project doesn't provision.
  adapter: cloudflare({ imageService: 'compile' }),
  // The site uses no Astro.session. Declaring a driver stops @astrojs/cloudflare
  // v13 from auto-injecting a Cloudflare KV 'SESSION' binding requirement (it
  // only does so when no session driver is set). The in-memory driver is inert
  // here since sessions are never read/written, and needs no Cloudflare binding.
  // (Driver factory, not the deprecated bare-string signature.)
  session: { driver: sessionDrivers.memory() },
  // Keep client-private planning surfaces out of the sitemap so they aren't
  // advertised to crawlers — /decisions (revenue terms, webhook + deploy-token
  // pathways) and /admin/* (internal node studio). These pages also carry a
  // noindex meta (see Base.astro) and stay reachable by direct link.
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/decisions') && !page.includes('/admin'),
    }),
  ],
  server: {
    host: true, // bind 0.0.0.0 — required for tunnel access
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Explicit list because allowedHosts:true sometimes doesn't propagate
      // through Astro's adapter chain. Wildcard prefixes accept any subdomain.
      allowedHosts: [
        '.trycloudflare.com',
        '.ngrok-free.app',
        '.ngrok-free.dev',
        '.ngrok.io',
        'localhost',
        '127.0.0.1',
      ],
    },
  },
});
