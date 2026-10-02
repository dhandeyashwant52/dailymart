/**
 * Idempotent development/staging dataset. Uses Application Default Credentials
 * (GOOGLE_APPLICATION_CREDENTIALS or `gcloud auth application-default login`).
 * It never deletes data and only upserts documents with `isDemoData: true`.
 */
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!getApps().length) initializeApp({ credential: serviceAccount ? cert(JSON.parse(serviceAccount)) : applicationDefault(), ...(projectId ? { projectId } : {}) });
const db = getFirestore(); const auth = getAuth();
const DEMO_PASSWORD = process.env.DAILYMART_DEMO_PASSWORD ?? 'Demo@12345';
const SHOP_ID = 'demo-shop-shree-krishna';
const productRows = [
  ['india-gate-basmati-rice','India Gate Basmati Rice','Rice & Grains',180,25,'1 kg'], ['fortune-basmati-rice','Fortune Basmati Rice','Rice & Grains',150,30,'1 kg'], ['sona-masoori-rice','Sona Masoori Rice','Rice & Grains',70,40,'1 kg'],
  ['aashirvaad-atta','Aashirvaad Atta','Flour & Atta',65,35,'1 kg'], ['fortune-chakki-atta','Fortune Chakki Fresh Atta','Flour & Atta',60,30,'1 kg'],
  ['tata-sampann-toor-dal','Tata Sampann Toor Dal','Pulses',145,25,'1 kg'], ['moong-dal','Moong Dal','Pulses',130,20,'1 kg'], ['masoor-dal','Masoor Dal','Pulses',110,25,'1 kg'],
  ['fortune-sunflower-oil','Fortune Sunflower Oil','Cooking Oil',145,30,'1 litre'], ['fortune-groundnut-oil','Fortune Groundnut Oil','Cooking Oil',175,20,'1 litre'],
  ['amul-taaza-milk','Amul Taaza Milk','Dairy',30,50,'500 ml'], ['amul-butter','Amul Butter','Dairy',58,25,'100 g'], ['amul-cheese','Amul Cheese','Dairy',125,20,'200 g'],
  ['tata-tea','Tata Tea','Beverages',125,25,'250 g'], ['nescafe-classic','Nescafé Classic','Beverages',175,20,'100 g'], ['real-fruit-juice','Real Fruit Juice','Beverages',110,20,'1 litre'],
  ['lays-classic-salted','Lays Classic Salted','Snacks',20,60,'1 pack'], ['kurkure-masala-munch','Kurkure Masala Munch','Snacks',20,60,'1 pack'], ['haldirams-bhujia',"Haldiram's Bhujia",'Snacks',65,30,'200 g'],
  ['parle-g','Parle-G','Biscuits',10,100,'1 pack'], ['britannia-good-day','Britannia Good Day','Biscuits',30,70,'1 pack'], ['oreo','Oreo','Biscuits',40,60,'1 pack'],
  ['everest-turmeric','Everest Turmeric Powder','Spices',45,35,'100 g'], ['everest-red-chilli','Everest Red Chilli Powder','Spices',55,35,'100 g'], ['tata-salt','Tata Salt','Spices',28,50,'1 kg'],
  ['vim-dishwash-bar','Vim Dishwash Bar','Household',25,40,'1 bar'], ['surf-excel-matic','Surf Excel Matic','Cleaning',120,25,'500 g'], ['harpic-toilet-cleaner','Harpic Toilet Cleaner','Cleaning',95,25,'500 ml'],
  ['dove-soap','Dove Soap','Personal Care',55,30,'100 g'], ['colgate-toothpaste','Colgate Toothpaste','Personal Care',95,30,'100 g'],
] as const;
type DemoUser = { key: string; email: string; name: string; claim?: string };
const users: DemoUser[] = [
  { key: 'admin', email: 'admin@dailmart.com', name: 'DailyMart Demo Admin', claim: 'SUPER_ADMIN' },
  { key: 'owner', email: 'shopowner@dailymart.com', name: 'Shree Krishna Owner' },
  { key: 'customer', email: 'user@dailymart.com', name: 'DailyMart Demo Customer' },
  { key: 'delivery', email: 'delivery@dailymart.com', name: 'Shree Krishna Delivery' },
];
async function ensureUser(user: DemoUser) {
  let record; try { record = await auth.getUserByEmail(user.email); } catch (error: unknown) {
    if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
    record = await auth.createUser({ email: user.email, password: DEMO_PASSWORD, displayName: user.name, emailVerified: true });
  }
  if (user.claim) await auth.setCustomUserClaims(record.uid, { platformRole: user.claim });
  await db.doc(`users/${record.uid}`).set({ uid: record.uid, name: user.name, email: user.email, phone: '', status: 'ACTIVE', isDemoData: true, environment: 'demo', updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() }, { merge: true });
  return record.uid;
}
const line = (id: string, quantity: number) => { const item = productRows.find(([key]) => key === id); if (!item) throw new Error(`Unknown demo product ${id}`); const [, name,, price,, unit] = item; return { productId: `demo-product-${id}`, name, price, quantity, unit, subtotal: price * quantity }; };
async function main() {
  const ids = Object.fromEntries(await Promise.all(users.map(async user => [user.key, await ensureUser(user)] as const))) as Record<string, string>;
  const shop = db.doc(`shops/${SHOP_ID}`);
  await shop.set({ id: SHOP_ID, name: 'Shree Krishna General Store', ownerId: ids.owner, category: 'Grocery & General Store', description: 'A neighborhood grocery and daily essentials store.', phone: '+91 7122 000000', address: 'Jairaj Nagar, Tukum', city: 'Chandrapur', pincode: '442401', latitude: 19.9707, longitude: 79.2967, status: 'ACTIVE', operationalStatus: 'OPEN', verificationStatus: 'VERIFIED', isActive: true, isOpen: true, deliveryRadius: 12, deliveryFee: 20, freeDeliveryAbove: 299, minOrder: 99, estimatedDeliveryTime: '25–35 min', deliveryConfig: { isDeliveryAvailable: true, deliveryRadius: 12, deliveryFee: 20, freeDeliveryAbove: 299, estimatedDeliveryTime: '25–35 min', deliveryModel: 'SELF' }, tags: ['Groceries', 'Daily Essentials'], image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600', isDemoData: true, environment: 'demo', updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() }, { merge: true });
  const memberships = [
    { key: 'owner', role: 'SHOP_OWNER', permissions: ['PRODUCT_MANAGE','ORDER_MANAGE','EMPLOYEE_MANAGE','DELIVERY_MANAGE'] },
    { key: 'delivery', role: 'DELIVERY_STAFF', permissions: [] },
  ];
  await Promise.all(memberships.map(async ({ key, role, permissions }) => db.doc(`shopMembers/${ids[key]}_${SHOP_ID}`).set({ shopId: SHOP_ID, userId: ids[key], role, permissions, status: 'ACTIVE', createdBy: ids.owner, isDemoData: true, environment: 'demo', updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() }, { merge: true })));
  const batch = db.batch();
  for (const [slug, name, category, price, stockQuantity, unit] of productRows) batch.set(db.doc(`products/demo-product-${slug}`), { id: `demo-product-${slug}`, shopId: shop.id, shopName: 'Shree Krishna General Store', name, description: `${name} — development demo product; not an official brand affiliation.`, category, price, mrp: price, unit, stockQuantity, reservedQuantity: 0, lowStockThreshold: 10, inStock: stockQuantity > 0, isActive: true, isAvailable: true, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', isDemoData: true, environment: 'demo', updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
  const orders = [
    ['demo-order-delivered','DELIVERED','COD','COLLECTED',[line('aashirvaad-atta',1),line('amul-taaza-milk',2),line('parle-g',2)]],
    ['demo-order-out-for-delivery','OUT_FOR_DELIVERY','ONLINE','PAID',[line('india-gate-basmati-rice',1),line('fortune-sunflower-oil',1),line('tata-salt',1)]],
    ['demo-order-preparing','PREPARING','ONLINE','PAID',[line('amul-butter',1),line('colgate-toothpaste',1),line('lays-classic-salted',2)]],
  ] as const;
  for (const [id, orderStatus, paymentMethod, paymentStatus, items] of orders) { const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0); const totalAmount = subtotal + 20; await db.doc(`orders/${id}`).set({ id, orderId: id.replace('demo-order-', 'DM-DEMO-').toUpperCase(), customerId: ids.customer, customerName: 'DailyMart Demo Customer', customerPhone: '+91 7000000000', shopId: shop.id, shopName: 'Shree Krishna General Store', shopOwnerId: ids.owner, deliveryAddress: 'Jairaj Nagar, Tukum, Chandrapur 442401', items, subtotal, deliveryFee: 20, discount: 0, totalAmount, paymentMethod, paymentStatus, orderStatus, financials: { subtotal, deliveryFee: 20, discount: 0, tax: 0, platformFee: 0, totalAmount, merchantAmount: totalAmount, currency: 'INR', refundAmount: 0 }, isDemoData: true, environment: 'demo', updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() }, { merge: true }); await db.doc(`orderPayments/${id}`).set({ orderId: id, customerId: ids.customer, shopId: shop.id, method: paymentMethod, status: paymentStatus, amount: totalAmount, platformFee: 0, merchantAmount: totalAmount, isDemoData: true, environment: 'demo', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true }); }
  await db.doc('deliveryAssignments/demo-assignment-out-for-delivery').set({ orderId: 'demo-order-out-for-delivery', shopId: shop.id, deliveryStaffId: ids.delivery, status: 'OUT_FOR_DELIVERY', assignedAt: FieldValue.serverTimestamp(), isDemoData: true, environment: 'demo' }, { merge: true });
  await db.doc('merchantSubscriptions/demo-subscription-shree-krishna').set({ shopId: shop.id, plan: 'YEARLY', amount: 999, currency: 'INR', status: 'ACTIVE', provider: 'DEMO', paymentId: 'demo-subscription-payment', isDemoData: true, environment: 'demo', startDate: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.doc('supportTickets/demo-ticket-missing-item').set({ customerId: ids.customer, shopId: shop.id, orderId: 'demo-order-delivered', issueType: 'MISSING_ITEM', description: 'One item was missing from the delivered order.', status: 'SHOP_RESPONDING', isDemoData: true, environment: 'demo', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.doc('supportMessages/demo-ticket-missing-item-customer').set({ ticketId: 'demo-ticket-missing-item', customerId: ids.customer, shopId: shop.id, senderId: ids.customer, body: 'My delivered order is missing one item.', isDemoData: true, environment: 'demo', createdAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.doc('supportMessages/demo-ticket-missing-item-shop').set({ ticketId: 'demo-ticket-missing-item', customerId: ids.customer, shopId: shop.id, senderId: ids.owner, body: 'We are checking this with the packing team.', isDemoData: true, environment: 'demo', createdAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.doc('disputes/demo-dispute-escalated').set({ orderId: 'demo-order-delivered', customerId: ids.customer, shopId: shop.id, issueType: 'MISSING_ITEM', description: 'Demo escalation: customer requested admin review after no resolution.', status: 'ESCALATED', escalatedTo: ids.admin, isDemoData: true, environment: 'demo', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`Seeded ${productRows.length} products for ${shop.id}; all records are idempotent demo data.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
