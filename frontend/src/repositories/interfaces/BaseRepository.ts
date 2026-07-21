import { Entity, CreateEntity, UpdateEntity } from '../../models/types';

export interface BaseRepository<T extends Entity> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateEntity<T>): Promise<T>;
  update(id: string, data: UpdateEntity<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
