import { Router } from 'express';
import { IRepository } from '../interfaces/IRepository';
import { createOne, getAll, getOne, updateOne, deleteOne } from './crudFactory';
import { protect, restrictTo } from '../middlewares/auth.middleware';

interface CrudRouterOptions {
  // Roles allowed to create/update. Omit (or pass []) to leave create/update open to anyone.
  writeRoles?: string[];
  // Roles allowed to delete. Omit (or pass []) to leave delete open to anyone.
  deleteRoles?: string[];
}

// Builds the exact GET/POST/PATCH/DELETE wiring every resource in this codebase needs —
// venue.routes.ts, section.routes.ts, row.routes.ts and seat.routes.ts were each 15+ lines
// that differed only by which model and which roles. This is that one shared shape, written
// once: pass it a repository and a role policy, get a fully wired router back.
export function createCrudRouter<T>(repo: IRepository<T>, options: CrudRouterOptions = {}): Router {
  const { writeRoles = [], deleteRoles = [] } = options;
  const router = Router();

  const writeGuard = writeRoles.length ? [protect, restrictTo(...writeRoles)] : [];
  const deleteGuard = deleteRoles.length ? [protect, restrictTo(...deleteRoles)] : [];

  router
    .route('/')
    .get(getAll(repo))
    .post(...writeGuard, createOne(repo));

  router
    .route('/:id')
    .get(getOne(repo))
    .patch(...writeGuard, updateOne(repo))
    .delete(...deleteGuard, deleteOne(repo));

  return router;
}
