import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../lib/firebase';

const functions = getFunctions();
async function call<T>(name: string, data: unknown): Promise<T> {
  if (!auth.currentUser) throw new Error('UNAUTHENTICATED');
  const result = await httpsCallable<unknown, T>(functions, name)(data);
  return result.data;
}
export const marketplaceApi = {
  createOrder: (data: unknown) => call<{ orderId: string }>('createOrder', data),
  transitionOrder: (data: unknown) => call<{ ok: boolean }>('transitionOrder', data),
  manageProduct: (data: unknown) => call<{ productId: string }>('manageProduct', data),
  manageShopMember: (data: unknown) => call<{ ok: boolean }>('manageShopMember', data),
  markCodCollected: (data: unknown) => call<{ ok: boolean }>('markCodCollected', data),
  resolveAccess: () => call<{ adminRole: string | null; ownedShopIds: string[]; deliveryShopIds: string[] }>('resolveAccess', {}),
  submitSellerApplication: (data: unknown) => call<{ applicationId: string }>('submitSellerApplication', data),
};
