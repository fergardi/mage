import { User } from './auth.state';

export class SetUserAction {
  public static readonly type = '[User] Set user from firebase';
  constructor(public payload: User) {}
}

export class LoginWithGoogleAction {
  public static readonly type = '[User] Login with google';
  constructor() {}
}

export class LogoutAction {
  public static readonly type = '[User] Logout user';
  constructor() {}
}

