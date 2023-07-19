import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FirebaseService], // 현재 모듈에서 사용
  exports: [FirebaseService], // 다른 모듈에서 사용가능
})
export class FirebaseModule {}
