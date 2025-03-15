import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationService } from './verification.service';
import { Verification } from './entities/verification.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Verification])], 
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
