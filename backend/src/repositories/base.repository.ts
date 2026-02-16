import { Model, ModelCtor, WhereOptions, FindOptions, Order } from 'sequelize';

export abstract class BaseRepository<T extends Model> {
  constructor(protected readonly model: ModelCtor<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findByPk(id);
  }

  async findOne(where: WhereOptions): Promise<T | null> {
    return this.model.findOne({ where });
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll(options);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data as any);
  }

  async update(id: string, data: Partial<T>): Promise<[number, T[]]> {
    return this.model.update(data, { where: { id } as any, returning: true });
  }

  async delete(id: string): Promise<number> {
    return this.model.destroy({ where: { id } as any });
  }

  async softDelete(id: string): Promise<[number, T[]]> {
    return this.model.update(
      { deleted_at: new Date() } as any,
      { where: { id } as any, returning: true }
    );
  }

  async count(where?: WhereOptions): Promise<number> {
    return this.model.count({ where });
  }
}