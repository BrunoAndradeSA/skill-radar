import { describe, it, expect } from 'vitest';
import { transformKeysToCamel, transformKeysToSnake } from './case-transform';

describe('transformKeysToCamel', () => {
  it('converte objeto simples snake_case para camelCase', () => {
    const input = { first_name: 'João', last_name: 'Silva' };
    const result = transformKeysToCamel(input);
    expect(result).toEqual({ firstName: 'João', lastName: 'Silva' });
  });

  it('converte array de objetos', () => {
    const input = [{ user_name: 'admin' }, { user_name: 'user' }];
    const result = transformKeysToCamel(input);
    expect(result).toEqual([{ userName: 'admin' }, { userName: 'user' }]);
  });

  it('converte chaves ID numéricas para string', () => {
    const input = { id: 42, theme_id: 7, competency_ids: [1, 2, 3] };
    const result = transformKeysToCamel(input);
    expect(result).toEqual({ id: '42', themeId: '7', competencyIds: ['1', '2', '3'] });
  });

  it('converte aninhamento profundo', () => {
    const input = {
      user_profile: {
        full_name: 'João',
        address_info: { zip_code: '12345' },
      },
    };
    const result = transformKeysToCamel(input);
    expect(result).toEqual({
      userProfile: { fullName: 'João', addressInfo: { zipCode: '12345' } },
    });
  });

  it('retorna primitivos sem alteração', () => {
    expect(transformKeysToCamel('hello')).toBe('hello');
    expect(transformKeysToCamel(42)).toBe(42);
    expect(transformKeysToCamel(null)).toBeNull();
  });

  it('retorna undefined para undefined', () => {
    expect(transformKeysToCamel(undefined)).toBeUndefined();
  });
});

describe('transformKeysToSnake', () => {
  it('converte objeto simples camelCase para snake_case', () => {
    const input = { firstName: 'João', lastName: 'Silva' };
    const result = transformKeysToSnake(input);
    expect(result).toEqual({ first_name: 'João', last_name: 'Silva' });
  });

  it('converte IDs string numéricas para número', () => {
    const input = { id: '42', themeId: '7', competencyIds: ['1', '2'] };
    const result = transformKeysToSnake(input);
    expect(result).toEqual({ id: 42, theme_id: 7, competency_ids: [1, 2] });
  });

  it('converte array de objetos', () => {
    const input = [{ userName: 'admin' }];
    const result = transformKeysToSnake(input);
    expect(result).toEqual([{ user_name: 'admin' }]);
  });

  it('não converte IDs string não-numéricas', () => {
    const input = { id: 'uuid-abc', competencyIds: ['uuid-1'] };
    const result = transformKeysToSnake(input);
    expect(result).toEqual({ id: 'uuid-abc', competency_ids: ['uuid-1'] });
  });

  it('converte aninhamento profundo', () => {
    const input = {
      userProfile: { fullName: 'João', addressInfo: { zipCode: '12345' } },
    };
    const result = transformKeysToSnake(input);
    expect(result).toEqual({
      user_profile: { full_name: 'João', address_info: { zip_code: '12345' } },
    });
  });

  it('retorna primitivos sem alteração', () => {
    expect(transformKeysToSnake('hello')).toBe('hello');
    expect(transformKeysToSnake(42)).toBe(42);
    expect(transformKeysToSnake(null)).toBeNull();
  });
});

describe('round-trip (camel ↔ snake)', () => {
  it('mantém fidelidade em ida-e-volta', () => {
    const original = {
      userId: '42',
      userName: 'admin',
      profileData: { isActive: true, roleIds: ['1', '2'] },
    };
    const snake = transformKeysToSnake(original);
    const back = transformKeysToCamel(snake);
    expect(back).toEqual(original);
  });
});
