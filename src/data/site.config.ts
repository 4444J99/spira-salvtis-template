const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const envOrigin =
  typeof import.meta !== 'undefined'
    ? import.meta.env.PUBLIC_SITE_ORIGIN
    : undefined;

export const siteConfig = {
  githubRepo:
    'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template',
  cloudflare: {
    workerName: 'spira-salvtis',
    reviewOrigin: trimTrailingSlash(
      envOrigin || 'https://spira-salvtis.ivixivi.workers.dev',
    ),
    legacyPagesOrigin: 'https://spira-salvtis.pages.dev',
  },
  domains: {
    primary: 'hub-spira-salvtis.dev',
    gateway: 'gateway-spira-salvtis.dev',
    business: 'business-spira-salvtis.dev',
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
