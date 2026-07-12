import { ObjectId } from 'mongodb';

export function isObjectIdString(value: string | undefined | null): value is string {
  return typeof value === 'string' && ObjectId.isValid(value);
}

export function toObjectId(value: string | ObjectId): ObjectId {
  if (value instanceof ObjectId) {
    return value;
  }

  if (!ObjectId.isValid(value)) {
    throw new Error(`Invalid MongoDB ObjectId: ${value}`);
  }

  return new ObjectId(value);
}

export function tryObjectId(value: string | ObjectId | undefined | null): ObjectId | null {
  if (!value) {
    return null;
  }

  try {
    return toObjectId(value);
  } catch {
    return null;
  }
}

export function objectIdToString(value: ObjectId | string | undefined | null): string {
  if (!value) {
    return '';
  }

  return typeof value === 'string' ? value : value.toHexString();
}

export type Serialized<T> = Omit<T, '_id'> & { id: string };

export function serializeDocument<T extends { _id: ObjectId }>(document: T): Serialized<T> {
  const { _id, ...rest } = document;

  return {
    ...rest,
    id: _id.toHexString(),
  } as Serialized<T>;
}

export function serializeDocuments<T extends { _id: ObjectId }>(documents: T[]): Serialized<T>[] {
  return documents.map((document) => serializeDocument(document));
}
