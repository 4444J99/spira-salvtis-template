const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const envOrigin =
  typeof import.meta !== 'undefined'
    ? import.meta.env.PUBLIC_SITE_ORIGIN
    : undefined;

export const siteConfig = {
  githubRepo:
    'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template',
  cloudflare: {
    workerName: 'sovereign-systems-spiral',
    reviewOrigin: trimTrailingSlash(
      envOrigin || 'https://sovereign-systems-spiral.ivixivi.workers.dev',
    ),
    legacyPagesOrigin: 'https://sovereign-systems-spiral.pages.dev',
  },
  domains: {
    primary: 'hub-example.com',
    water: 'water-example.com',
    business: 'business-example.com',
  },
} as const;

export function siteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.cloudflare.reviewOrigin}${normalizedPath}`;
}

export function repoUrl(path = ''): string {
  const normalizedPath = path.replace(/^\/+/, '');
  return normalizedPath
    ? `${siteConfig.githubRepo}/${normalizedPath}`
    : siteConfig.githubRepo;
}
