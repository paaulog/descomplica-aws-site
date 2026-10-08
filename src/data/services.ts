import type { Locale } from '../lib/i18n/ui';

export const serviceIds = ['s3', 'ec2', 'lambda', 'vpc'] as const;
export type ServiceId = (typeof serviceIds)[number];

export const serviceStatuses = ['active', 'soon'] as const;
export type ServiceStatus = (typeof serviceStatuses)[number];

export const accentTokens = ['green', 'orange', 'amber', 'violet'] as const;
export type AccentToken = (typeof accentTokens)[number];

export interface Service {
  id: ServiceId;
  status: ServiceStatus;
  phase: number;
  accent: AccentToken;
  order: number;
  title: Record<Locale, string>;
  tagline: Record<Locale, string>;
}

export const services: readonly Service[] = [
  {
    id: 's3',
    status: 'active',
    phase: 1,
    accent: 'green',
    order: 1,
    title: { 'pt-br': 'Amazon S3', en: 'Amazon S3' },
    tagline: {
      'pt-br': 'Guarde arquivos na nuvem sem se preocupar com espaço.',
      en: 'Store files in the cloud without worrying about space.',
    },
  },
  {
    id: 'ec2',
    status: 'soon',
    phase: 2,
    accent: 'orange',
    order: 2,
    title: { 'pt-br': 'Amazon EC2', en: 'Amazon EC2' },
    tagline: {
      'pt-br': 'Servidores virtuais que você liga e desliga quando quiser.',
      en: 'Virtual servers you turn on and off whenever you want.',
    },
  },
  {
    id: 'lambda',
    status: 'soon',
    phase: 3,
    accent: 'amber',
    order: 3,
    title: { 'pt-br': 'AWS Lambda', en: 'AWS Lambda' },
    tagline: {
      'pt-br': 'Rode código sem servidor e pague só quando ele executa.',
      en: 'Run code without servers and pay only when it runs.',
    },
  },
  {
    id: 'vpc',
    status: 'soon',
    phase: 4,
    accent: 'violet',
    order: 4,
    title: { 'pt-br': 'Amazon VPC', en: 'Amazon VPC' },
    tagline: {
      'pt-br': 'Sua própria rede privada dentro da AWS.',
      en: 'Your own private network inside AWS.',
    },
  },
];

export function getActiveServices(): Service[] {
  return services.filter((service) => service.status === 'active');
}

export function isServiceId(value: unknown): value is ServiceId {
  return serviceIds.includes(value as ServiceId);
}

export function getNextService(): Service | undefined {
  return services
    .filter((service) => service.status === 'soon')
    .toSorted((first, second) => first.order - second.order)[0];
}
