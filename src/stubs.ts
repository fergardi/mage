import { AuthState } from './app/shared/auth/auth.state';

export const NotificationServiceStub: any = {
  success: () => null,
  warning: () => null,
  error: () => null,
};

export const StoreStub: any = {
  selectSnapshot: (type: any) => {
    switch (type) {
      case AuthState.getKingdomGold:
        return { quantity: 1000 };
      case AuthState.getUserUID:
        return 'uid';
    }
  },
};

export const DialogRefStub: any = {
  close: () => null,
};

export const ApiServiceStub: any = {
  disbandTroop: () => null,
  bidAuction: () => null,
  recruitUnit: () => null,
};

export const FirebaseServiceStub: any = {
  selfJoin: (a: any) => a,
};
