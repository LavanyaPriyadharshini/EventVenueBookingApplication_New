// The abstraction that inverts the dependency: route handlers (and the CRUD factory they're
// built from) depend on THIS interface, never on Mongoose directly. Whatever implements it
// (MongooseRepository today, something else tomorrow) is free to change without touching a
// single route file.
export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findAll(filter: Record<string, any>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  updateById(id: string, data: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
}
