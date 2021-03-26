export class SetUserAction {
  public static readonly type = '[User] Set User';
  constructor(public uid: string) {}
}

export class SetKingdomAction {
  public static readonly type = '[User] Set Kingdom';
  constructor(public uid: string) {}
}

export class SetKingdomSuppliesAction {
  public static readonly type = '[User] Set Kingdom supplies';
  constructor(public uid: string) {}
}

export class SetKingdomBuildingsAction {
  public static readonly type = '[User] Set Kingdom buildings';
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

export class SetPopupAction {
  public static readonly type = '[World] Set Popup status';
  constructor(public uid: string | null) {}
}
