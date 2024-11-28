import { DBError } from './types/database-types';

export const isDBError = (error: unknown): error is DBError => {
  if (!error) {
    return false;
  }

  if (typeof error !== 'object') {
    return false;
  }

  if (!('code' in error)) {
    return false;
  } else if (typeof error.code !== 'string') {
    return false;
  }

  if (!('message' in error)) {
    return false;
  } else if (typeof error.message !== 'string') {
    return false;
  }

  return true;
};
