import { describe, expect, it } from 'vitest';
import {
  getActiveServices,
  serviceIds,
  services,
  serviceStatuses,
} from '../../../src/data/services';
import { locales } from '../../../src/lib/i18n/ui';

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
