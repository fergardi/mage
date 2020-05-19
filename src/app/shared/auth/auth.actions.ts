export class SetKingdomAction {
  public static readonly type = '[User] Set Kingdom';
  constructor(public uid: string) {}
}

export class SetKingdomSuppliesAction {
  public static readonly type = '[User] Set Kingdom supplies';
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

