import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const usuarios = await p.usuario.findMany({ 
    take: 5, 
    select: { 
      correo: true, 
      codigo_rol: true, 
      contrase_a: true 
    } 
  });
  console.log('Usuarios encontrados:');
  console.log(JSON.stringify(usuarios, null, 2));
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
