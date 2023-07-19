export const CUSTOM_TOKEN_TYPE = {
  NAVER: 'naver',
  KAKAO: 'kakao',
} as const;
export type CUSTOM_TOKEN_TYPE =
  (typeof CUSTOM_TOKEN_TYPE)[keyof typeof CUSTOM_TOKEN_TYPE];

export class CustomTokenDto {
  id: string;

  email: string;

  type: CUSTOM_TOKEN_TYPE;
}

export class CustomTokenRo {
  customToken: string;
}
