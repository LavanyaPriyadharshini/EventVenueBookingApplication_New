import { Model } from 'mongoose';
import { IRepository } from '../interfaces/IRepository';

// The ONLY place in the whole request path that is allowed to know Mongoose exists. Every
// route file, and the CRUD factory itself, talks to IRepository<T> instead — this class is
// what actually implements that contract against MongoDB.
export class MongooseRepository<T> implements IRepository<T> {
  constructor(private readonly model: Model<any>) {}

  create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  findAll(filter: Record<string, any> = {}): Promise<T[]> {
    return this.model.find(filter);
  }

  findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  updateById(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }
}
