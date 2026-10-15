import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main(){
  // products
  const itemsDir = path.join(__dirname, '../../ban/items');
  if(fs.existsSync(itemsDir)){
    const files=fs.readdirSync(itemsDir).filter(f=>f.endsWith('.txt'));
    for(const f of files){
      const content=fs.readFileSync(path.join(itemsDir,f),'utf-8');
      for(const line of content.split('\n')){
        const t=line.trim(); if(!t||t.startsWith('#')) continue;
        const [idS, donGiaS, maxQtyS, maVp]=t.split(':');
        const id=parseInt(idS), donGia=parseInt(donGiaS), maxQty=parseInt(maxQtyS||'999');
        if(!id||!donGia) continue;
        await prisma.product.upsert({ where:{ id }, create:{ id, donGia, maxQty, maVp:maVp||null }, update:{ donGia, maxQty, maVp:maVp||null } });
      }
    }
    console.log('Products seeded');
  }
  // admin user
  const email='admin@example.com';
  const exists=await prisma.user.findUnique({ where:{ email } });
  if(!exists){
    const hash=await bcrypt.hash('admin123',10);
    await prisma.user.create({ data:{ email, password:hash, role:'ADMIN', balanceTt: 100000000 } });
    console.log('Admin created admin@example.com / admin123');
  }
  // demo user
  const demo='demo@example.com';
  if(!await prisma.user.findUnique({ where:{ email:demo } })){
    const h=await bcrypt.hash('demo123',10);
    await prisma.user.create({ data:{ email:demo, password:h, balanceTt: 5000000 } });
  }
}
main().catch(e=>{ console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
