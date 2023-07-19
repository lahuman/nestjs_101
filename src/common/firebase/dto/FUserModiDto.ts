import { UpdateRequest } from 'firebase-admin/lib/auth/auth-config';

export interface FUserModiDto extends UpdateRequest {
  uid: string;
}
