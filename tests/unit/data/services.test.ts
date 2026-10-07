import { describe, expect, it } from 'vitest';
import {
  getActiveServices,
  getNextService,
  serviceIds,
  services,
  serviceStatuses,
} from '@/data/services';
import { locales } from '@/lib/i18n/ui';

describe('services', () => {
  it('tem ids únicos e conhecidos', () => {
    const ids = services.map((service) => service.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(serviceIds).toContain(id);
  });

  it('tem order único', () => {
    const orders = services.map((service) => service.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('usa só os status permitidos', () => {
    for (const service of services) expect(serviceStatuses).toContain(service.status);
  });

  it('tem título e tagline nos dois idiomas', () => {
    for (const service of services) {
      for (const locale of locales) {
        expect(service.title[locale]).toBeTruthy();
        expect(service.tagline[locale]).toBeTruthy();
      }
    }
  });

  it('na v1, só o S3 está ativo', () => {
    expect(getActiveServices().map((service) => service.id)).toEqual(['s3']);
  });
});

describe('getNextService', () => {
  it('devolve o serviço "em breve" de menor order', () => {
    const soon = services.filter((service) => service.status === 'soon');
    const lowestOrder = Math.min(...soon.map((service) => service.order));
    expect(getNextService()?.order).toBe(lowestOrder);
    expect(getNextService()?.status).toBe('soon');
  });

  it('na v1, o próximo serviço é o EC2', () => {
    expect(getNextService()?.id).toBe('ec2');
  });
});
