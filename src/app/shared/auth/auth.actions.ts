export class SetUserAction {
  public static readonly type = '[User] Set user from firebase';
  constructor(public uid: string) {}
}

export class LoginWithGoogleAction {
  public static readonly type = '[User] Login with google';
  constructor() {}
}

export class LogoutAction {
  public static readonly type = '[User] Logout user';
  constructor() {}
}

export class SetDBAction {
  public static readonly type = '[DB] Set localstorage data';
  constructor() {}
}

