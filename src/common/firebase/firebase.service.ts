/* eslint-disable @typescript-eslint/no-var-requires */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { FUserModiDto } from './dto/FUserModiDto';
import { CustomTokenDto, CustomTokenRo, CUSTOM_TOKEN_TYPE } from './dto/CustomTokenDto';
import * as firebaseConfig from './firebase.config.json';


const firebase_params = {
  type: firebaseConfig.type,
  projectId: firebaseConfig.project_id,
  privateKeyId: firebaseConfig.private_key_id,
  privateKey: firebaseConfig.private_key,
  clientEmail: firebaseConfig.client_email,
  clientId: firebaseConfig.client_id,
  authUri: firebaseConfig.auth_uri,
  tokenUri: firebaseConfig.token_uri,
  authProviderX509CertUrl: firebaseConfig.auth_provider_x509_cert_url,
  clientC509CertUrl: firebaseConfig.client_x509_cert_url,
};


@Injectable()
export class FirebaseService {
  logger: Logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {
    admin.initializeApp({
      credential: admin.credential.cert(firebase_params),
    });
  }

  // 토큰 검증
  async authTokenVerify(idToken: string): Promise<object> {
    const checkRevoked = true;
    try {
      const payload = await admin.auth().verifyIdToken(idToken, checkRevoked);
      // this.logger.debug("verify success ::", payload)
      return payload;
    } catch (error) {
      this.logger.error(error);
      if (error.code === 'auth/id-token-revoked') {
        // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
        throw new HttpException('Token is revoked.', HttpStatus.UNAUTHORIZED);
      } else {
        // Token is invalid.
        throw new HttpException('Token is invalid.', HttpStatus.UNAUTHORIZED);
      }
    }
  }

  // 토큰 만료
  async expireToken(uid: string): Promise<object> {
    this.logger.debug(uid);
    await admin.auth().revokeRefreshTokens(uid);

    // revoke 시간 확인
    const userRecord = await admin.auth().getUser(uid);
    const timestamp =
      new Date(userRecord.tokensValidAfterTime).getTime() / 1000;
    this.logger.debug(`Tokens revoked at: ${timestamp}`);

    return userRecord;
  }

  // uid 유저 찾기
  async getUserByUid(uid: string): Promise<UserRecord> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException('Error fetching user data', HttpStatus.NOT_FOUND);
    }
  }

  // email 유저 찾기
  async getUserByEmail(email: string): Promise<UserRecord> {
    try {
      return await admin.auth().getUserByEmail(email);
    } catch (error) {
      return {} as UserRecord;
    }
  }

  // 계정 삭제
  async delUserByUid(uid: string[]): Promise<any> {
    try {
      return await admin.auth().deleteUsers(uid);
    } catch (error) {
      this.logger.error(error);
    }
  }

  // 이메일 인증 by firebase (이메일 가입 전용)
  async verifyUserEmail(email: string, verified: boolean): Promise<UserRecord> {
    try {
      const getuser = await this.getUserByEmail(email);

      if (getuser.uid) {
        const userRecord = await admin.auth().updateUser(getuser.uid, {
          emailVerified: verified,
        });
        return userRecord;
      } else {
        throw new HttpException('User Is Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException('Error updating user', HttpStatus.NOT_FOUND);
    }
  }

  // 비밀번호 변경
  async changeUserPwd(uid: string, newPwd: string): Promise<void> {
    try {
      await admin.auth().updateUser(uid, {
        password: newPwd,
      });
    } catch (error) {
      this.logger.error('Error updating user:', error);
      throw new HttpException('User Is Not Found.', HttpStatus.NOT_FOUND);
    }
  }

  // 유저 정보 변경
  async modiUser(fUserModiDto: FUserModiDto): Promise<UserRecord> {
    try {
      const userRecord = await admin
        .auth()
        .updateUser(fUserModiDto.uid, fUserModiDto);
      return userRecord;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException('Error updating user', HttpStatus.NOT_FOUND);
    }
  }

  // 유저 생성
  private async getUserOrCreateUser(
    provider: string,
    uid: string,
    email: string,
  ) {
    try {
      return await admin.auth().getUser(uid);
    } catch (err) {
      this.logger.debug(err.code);
      if (err.code === 'auth/user-not-found') {
        return await this._createUser({
          provider,
          displayName: email,
          email,
          uid,
        });
      }
      throw err;
    }
  }

  private _createUser = async (createParam: {
    provider: string;
    displayName: string;
    email: string;
    uid: string;
  }) => {
    try {
      return await admin.auth().createUser(createParam);
    } catch (err) {
      this.logger.error(err.code);
      if (err.code === 'auth/email-already-exists') {
        throw new HttpException('email-already-exists.', HttpStatus.CONFLICT);
      }
    }
  };

  // 커스텀 토큰 발급
  async createFirebaseToken(user: CustomTokenDto): Promise<CustomTokenRo> {
    if (!user.id) {
      throw new HttpException('Token is invalid.', HttpStatus.UNAUTHORIZED);
    }
    if (user.type === CUSTOM_TOKEN_TYPE.KAKAO && !user.email) {
      throw new HttpException('email is not null.', HttpStatus.UNAUTHORIZED);
    }

    const userRecord: any = await this.getUserOrCreateUser(
      user.type,
      `${user.type}:${user.id}`,
      `${user.id}.${user.email}`,
    );

    const uId = userRecord.uid;
    const ftoken = await admin
      .auth()
      .createCustomToken(uId, { provider: user.type });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.logger.debug(`파이이베이스 커스텀 토큰 생성 성공. uid ::${uId}`);

    return {
      customToken: ftoken,
    };
  }
}
