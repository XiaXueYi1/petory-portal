import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
