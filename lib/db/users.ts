import type { UpdateFilter } from 'mongodb';
import type { CreateUserInput, UserDocument, UserRole } from '@/types/database';
import { COLLECTIONS, getCollection } from './collections';
import { tryObjectId } from './object-id';

async function usersCollection() {
  return getCollection<UserDocument>(COLLECTIONS.users);
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const collection = await usersCollection();
  return collection.findOne({ _id: objectId });
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const collection = await usersCollection();
  return collection.findOne({ email: email.toLowerCase().trim() });
}

export async function createUser(input: CreateUserInput): Promise<UserDocument> {
  const collection = await usersCollection();
  const now = new Date();
  const document: Omit<UserDocument, '_id'> = {
    ...input,
    email: input.email.toLowerCase().trim(),
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(document as UserDocument);
  return { ...document, _id: result.insertedId } as UserDocument;
}

export async function createCustomer(input: Omit<CreateUserInput, 'role'>): Promise<UserDocument> {
  return createUser({ ...input, role: 'customer' });
}

export async function createAdmin(input: Omit<CreateUserInput, 'role'>): Promise<UserDocument> {
  return createUser({ ...input, role: 'admin' });
}

export async function updateUserRole(id: string, role: UserRole): Promise<UserDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const collection = await usersCollection();
  const update: UpdateFilter<UserDocument> = {
    $set: {
      role,
      updatedAt: new Date(),
    },
  };

  const result = await collection.findOneAndUpdate({ _id: objectId }, update, { returnDocument: 'after' });
  return result;
}
