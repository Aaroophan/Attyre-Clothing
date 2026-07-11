import { MongoClient } from 'mongodb';

const options = {};

declare global {
  var _attyreMongoClientPromise: Promise<MongoClient> | undefined;
  var _attyreMongoUri: string | undefined;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Add it to .env.local before using MongoDB.');
  }

  return uri;
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(getMongoUri(), options);
  return client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    const uri = getMongoUri();

    if (!globalThis._attyreMongoClientPromise || globalThis._attyreMongoUri !== uri) {
      globalThis._attyreMongoUri = uri;
      globalThis._attyreMongoClientPromise = createClientPromise();
    }

    return globalThis._attyreMongoClientPromise;
  }

  return createClientPromise();
}

export async function closeMongoClient(): Promise<void> {
  if (globalThis._attyreMongoClientPromise) {
    const client = await globalThis._attyreMongoClientPromise;
    await client.close();
    globalThis._attyreMongoClientPromise = undefined;
    globalThis._attyreMongoUri = undefined;
  }
}
