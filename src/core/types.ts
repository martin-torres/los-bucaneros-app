export type OrderStatus =
  | 'recibido'
  | 'preparando'
  | 'empaquetando'
  | 'listo'
  | 'en_camino'
  | 'entregado'
  | 'pendiente_pago';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'conekta' | 'mercadopago' | 'codi';
export type DeliveryType = 'domicilio' | 'sucursal';
export type MenuCategory = 
  | 'gummies' | 'candy' | 'chocolate' | 'drinks' | 'present'
  | 'greenhouse_premium' | 'greenhouse_selecta' | 'living_soil' | 'hydro'
  | 'edibles' | 'prerolls' | 'infusionados' | 'hash_holes' | 'extractos' | 'vapes' | 'psicodelia';

export interface BundleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PromoItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'promo';
  image: string;
  active: boolean;
  bundleItems?: BundleItem[];
  discountType?: 'fixed' | 'percent';
  discountValue?: number;
  originalPrice?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  isWeightBased?: boolean;
  weightPricePerKg?: number;
  weightInGrams?: number;
  options?: ItemOption[];
  strain?: 'sativa' | 'indica' | 'hybrid';
  soldOut?: boolean;
}

export interface ItemOption {
  id: string;
  label: string;
  price: number;
  quantity?: number;
  unit?: string;
  dosage?: string;
  weight?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  weightInGrams?: number;
  selectedOption?: ItemOption;
  isBundle?: boolean;
  bundleItems?: BundleItem[];
}

export interface Order {
  id: string;
  collectionId?: string;
  collectionName?: string;
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  payWithAmount?: number;
  transferScreenshot?: string;
  deliveryDistanceKm?: number;
  deliveryFee?: number;
  timestamp: number;
  statusTimestamps: Partial<Record<OrderStatus, number>>;
  sessionId?: string;
}

export interface VisitorRecord {
  id: string;
  ip: string;
  userAgent?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  isPwaInstalled?: boolean;
  sessionId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  associatedOrders?: string[];
}

export interface CustomerInfo {
  name: string;
  address: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface UiTextSettings {
  loadingTitle?: string;
  errorTitle?: string;
  retryButton?: string;
  menuButton?: string;
  cartButton?: string;
  promotionsTitle?: string;
  checkoutTitle?: string;
  deliveryTitle?: string;
  paymentTitle?: string;
  confirmOrderPrefix?: string;
  pickupOptionLabel?: string;
  deliveryOptionLabel?: string;
  newOrderButton?: string;
  kitchenTitle?: string;
  kitchenInProgressLabel?: string;
  kitchenEmptyLabel?: string;
  kitchenAcceptLabel?: string;
  kitchenCookedLabel?: string;
  kitchenDeliverCustomerLabel?: string;
  kitchenSendRiderLabel?: string;
  kitchenConfirmDeliveryLabel?: string;
  dataTitle?: string;
  dataRefreshLabel?: string;
  dataLockTitle?: string;
  kitchenLockTitle?: string;
}

export interface Promotion {
  code: string;
  description: string;
  conditions: {
    orderBeforeHour?: number;
    orderAfterHour?: number;
    minOrderAmount?: number;
    daysOfWeek?: number[];
  };
  action: {
    type: 'free_item' | 'discount_percent' | 'discount_fixed';
    itemCode?: string;
    value?: number;
  };
}

export interface CutoffTime {
  lastOrderHour: number;
  enabled: boolean;
}

export interface PaymentProof {
  type: 'transfer_screenshot' | 'bank_receipt' | 'atm_receipt';
  file: File | string;
  bankName?: string;
  authorizationCode?: string;
}

export interface AppSkinSettings {
  name: string;
  currency?: string;
  shortName?: string;
  tagline?: string;
  description?: string;
  locationText?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  pickupLocationText?: string;
  adminPin?: string;
  kitchenPin?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  googleFontUrl?: string;
  googleFontName?: string;
  categories?: Array<{
    code: string;
    displayName: string;
  }>;
  uiText?: UiTextSettings;
  deliveryRules?: {
    thresholds?: Array<{
      km: number;
      fee: number;
    }>;
    storeLat?: number;
    storeLng?: number;
    promotions?: Promotion[];
    cutoffTimes?: {
      delivery?: CutoffTime;
      pickup?: CutoffTime;
    };
  };
  paymentSettings?: {
    conektaPublicKey?: string;
    mercadopagoPublicKey?: string;
    codiEnabled?: boolean;
    transferBankName?: string;
    transferAccountNumber?: string;
  };
  visitorTrackingEnabled?: boolean;
}