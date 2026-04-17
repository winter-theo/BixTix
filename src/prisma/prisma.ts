
import {PrismaNeon} from '@prisma/adapter-neon';
import {PrismaClient} from '../generated/prisma/client';

// The following is the same as writing import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();

// Créer le client Neon adapter
const adapter = new PrismaNeon({
connectionString: process.env.DATABASE_URL,
});

// Créer le client Prisma avec l'adaptateur Neon
const prisma = new PrismaClient({
adapter,
log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
