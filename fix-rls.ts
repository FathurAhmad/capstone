import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow Frontend to Upload Signatures" ON storage.objects;`);
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Allow Frontend to Upload Evidences" ON storage.objects;`);
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Access signatures" ON storage.objects;`);
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Access evidences" ON storage.objects;`);
  
  await prisma.$executeRawUnsafe(`CREATE POLICY "Public Access signatures" ON storage.objects FOR SELECT USING (bucket_id = 'signatures');`);
  await prisma.$executeRawUnsafe(`CREATE POLICY "Public Access evidences" ON storage.objects FOR SELECT USING (bucket_id = 'evidences');`);
  
  // Create INSERT policies without tying to auth.uid() since it's anonymous
  await prisma.$executeRawUnsafe(`CREATE POLICY "Allow Frontend to Upload Signatures" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'signatures');`);
  await prisma.$executeRawUnsafe(`CREATE POLICY "Allow Frontend to Upload Evidences" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'evidences');`);
  
  console.log('RLS Policies applied successfully!');
}

main().catch(console.error).finally(() => process.exit(0));
