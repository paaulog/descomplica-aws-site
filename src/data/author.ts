export interface AuthorLink {
  label: string;
  href: string;
}

export const author = {
  name: 'Paulo Gomes',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/paulogomesff/' },
    { label: 'GitHub', href: 'https://github.com/paaulog' },
  ],
} as const satisfies { name: string; links: readonly AuthorLink[] };

export const repositoryUrl = 'https://github.com/paaulog/descomplica-aws-site';
