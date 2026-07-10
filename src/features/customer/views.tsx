import React, { useState } from 'react';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Minus,
  MapPin,
  Bike,
  Store,
  CreditCard,
  Banknote,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ChefHat,
  ShoppingBag,
  Smartphone,
  Star,
} from 'lucide-react';
import type { OrderStatus } from '../../core/types';
import type { ResolvedUiSettings } from '../../core/uiSettings';
import { TabBar } from './components/TabBar';
import { LanguageSelector } from './components/LanguageSelector';
import { WeightOrderModal } from './components/WeightOrderModal';
import { OptionSelector } from './components/OptionSelector';
import { useTranslations } from '../../hooks/useTranslations';
import { useUnlockState } from '../../hooks/useUnlockState';

const formatMoney = (value: number, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

// ─── LANDING VIEW ─────────────────────────────────────────────────
export const LandingView = ({
  addToCart,
  setActiveScreen,
  promos,
  settings,
  primaryColor = '#C53030',
  secondaryColor = '#1A1A2E',
}: {
  addToCart: (item: any) => void;
  setActiveScreen: (screen: any) => void;
  promos: any[];
  settings?: ResolvedUiSettings;
  primaryColor?: string;
  secondaryColor?: string;
}) => {
  const { t, getItemDescription } = useTranslations();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Hero ── */}
      <div
        className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-lg"
        style={{ backgroundColor: secondaryColor }}
      >
        {settings?.heroImageUrl ? (
          <img
            src={settings.heroImageUrl}
            alt={settings.name || 'Restaurante'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: settings?.heroImageUrl
              ? `linear-gradient(to top, ${secondaryColor}dd, ${secondaryColor}20 60%, transparent)`
              : `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor})`,
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <span
            className="inline-block text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-tighter mb-2"
            style={{ backgroundColor: primaryColor }}
          >
            {settings?.locationText || 'Restaurante'}
          </span>
          <h1
            className="text-4xl font-black italic uppercase leading-none tracking-tight mb-2 text-white"
          >
            {settings?.name || 'Menú Digital'}
          </h1>
          <p className="text-white/80 text-sm font-medium max-w-[75%]">
            {settings?.tagline || 'Pide directo, sin comisiones'}
          </p>
        </div>
      </div>

      {/* ── Promos ── */}
      {promos && promos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <h2 className="text-xl font-bold italic">
              {t('promotionsTitle', 'Promociones')}
            </h2>
          </div>
          <div className="grid gap-3">
            {promos.map((promo: any, idx: number) => (
              <div
                key={promo.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden flex cursor-pointer card-hover animate-fade-in-up delay-${Math.min(idx + 1, 6)}`}
                onClick={() => addToCart(promo)}
              >
                {promo.image ? (
                  <div className="w-24 h-24 shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src={promo.image}
                      className="w-full h-full object-cover"
                      alt={promo.name}
                    />
                  </div>
                ) : null}
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-gray-800 mb-1">{promo.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {getItemDescription(promo.id, promo.description)}
                  </p>
                  <span
                    className="mt-2 inline-block text-white text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {promo.promoActive
                      ? `$${promo.promoPrice ?? promo.price}`
                      : `$${promo.price}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quick Actions ── */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveScreen('menu')}
            className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 text-center card-hover btn-press active:scale-[0.97] transition-all"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: primaryColor }}
            >
              <Store className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-black uppercase text-sm tracking-wider text-gray-800">
              {t('menuButton', 'Ver Menú')}
            </h3>
          </button>
          <button
            onClick={() => setActiveScreen('checkout')}
            className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 text-center card-hover btn-press active:scale-[0.97] transition-all"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: primaryColor }}
            >
              <Bike className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-black uppercase text-sm tracking-wider text-gray-800">
              {t('orderNow', 'Ordenar Ahora')}
            </h3>
          </button>
        </div>
      </section>

      {/* ── Info Footer ── */}
      <footer className="mb-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
          {settings?.name || ''}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {settings?.tagline || 'Pide directo, sin comisiones'}
        </p>
        <LanguageSelector />
      </footer>
    </div>
  );
};

// ─── MENU VIEW ─────────────────────────────────────────────────────
export const MenuView = ({
  addToCart,
  setCart,
  setActiveScreen,
  menuItems,
  settings,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
}: any) => {
  const { t, getItemDescription } = useTranslations();
  const { isUnlocked } = useUnlockState();
  const categories = settings?.categories || [];
  const LOCKED_CATS = ['gummies', 'candy', 'chocolate'];
  const [selectedCategory, setSelectedCategory] = React.useState(categories[0]?.code || 'promo');
  const [selectedWeightItem, setSelectedWeightItem] = React.useState<any>(null);
  const [showWeightModal, setShowWeightModal] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [selectedOptionItem, setSelectedOptionItem] = React.useState<any>(null);

  const visibleCategories = categories.filter(cat =>
    menuItems.some((item: any) => item.category === cat.code)
  );

  React.useEffect(() => {
    if (
      visibleCategories.length > 0 &&
      !visibleCategories.some(cat => cat.code === selectedCategory)
    ) {
      setSelectedCategory(visibleCategories[0].code);
    }
  }, [visibleCategories, selectedCategory]);

  React.useEffect(() => {
    if (
      !visibleCategories.some(cat => cat.code === selectedCategory) &&
      visibleCategories.length > 0
    ) {
      setSelectedCategory(visibleCategories[0].code);
    }
  }, [isUnlocked, visibleCategories, selectedCategory]);

  if (categories.length === 0) {
    return (
      <div className="animate-in fadein slide-in-from-right-4 duration-300 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 font-medium">
            {t('noCategories', 'No hay categorías disponibles')}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {t('configureCategories', 'Por favor configura las categorías en ajustes')}
          </p>
        </div>
      </div>
    );
  }

  const filteredItems = menuItems.filter((i: any) => i.category === selectedCategory);

  const handleItemClick = (item: any) => {
    if (item.options && item.options.length > 0) {
      setSelectedOptionItem(item);
      setShowOptions(true);
    } else if (item.isWeightBased) {
      setSelectedWeightItem(item);
      setShowWeightModal(true);
    } else {
      addToCart(item);
    }
  };

  return (
    <div className="animate-in fadein slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between relative mb-6">
        <button
          onClick={() => setActiveScreen('landing')}
          className="absolute left-0 p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-2xl font-bold italic font-black uppercase">
          {t('menuTitle', 'Menú')} {settings?.shortName || settings?.name || ''}
        </h2>
      </div>

      {visibleCategories.length > 0 && (
        <TabBar
          categories={visibleCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          primaryColor={primaryColor}
        />
      )}

      <div className="mb-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-8">
            <p className="text-gray-500 font-medium text-lg">
              {t('noProducts', 'No hay productos disponibles')}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              {t('noProductsInCategory', 'Esta categoría no tiene items activos')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item: any, idx: number) => (
              <div
                key={item.id}
                className={`bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-soft flex items-center group cursor-pointer card-hover animate-fade-in-up delay-${Math.min(idx + 1, 6)}`}
                onClick={() => handleItemClick(item)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = primaryColor)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div className="relative w-24 h-24 shrink-0 overflow-hidden bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={item.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Plus className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-4 leading-relaxed">
                    {getItemDescription(item.id, item.description)}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0 pr-4">
                  {item.options && item.options.length > 0 ? (
                    <>
                      <span
                        className="text-black px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Opciones
                      </span>
                      <span className="font-black text-xl" style={{ color: secondaryColor }}>
                        Desde ${Math.min(...item.options.map((o: any) => o.price))}
                      </span>
                    </>
                  ) : item.isWeightBased ? (
                    <>
                      <span
                        className="text-black px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Peso
                      </span>
                      <span className="font-black text-sm text-gray-500 italic">
                        {item.weightPricePerKg} MXN/kg
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="text-black px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t('addButton', '+ Agregar')}
                      </span>
                      <span className="font-black text-xl" style={{ color: secondaryColor }}>
                        ${item.promoActive ? item.promoPrice ?? item.price : item.price}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weight Modal */}
      <WeightOrderModal
        isOpen={showWeightModal}
        item={selectedWeightItem || {}}
        onClose={() => {
          setShowWeightModal(false);
          setSelectedWeightItem(null);
        }}
        onConfirm={(weightInGrams: number, price: number) => {
          if (selectedWeightItem && weightInGrams > 0 && price > 0) {
            const itemWithWeight = {
              ...selectedWeightItem,
              quantity: 1,
              weightInGrams,
              price,
            };
            setCart((prev: any) => {
              const existing = prev.find((i: any) => i.id === selectedWeightItem.id);
              if (existing)
                return prev.map((i: any) =>
                  i.id === selectedWeightItem.id
                    ? { ...i, quantity: i.quantity + 1, weightInGrams, price }
                    : i
                );
              return [...prev, itemWithWeight];
            });
            setShowWeightModal(false);
            setSelectedWeightItem(null);
          }
        }}
      />

      {/* Options Modal */}
      {showOptions && selectedOptionItem && (
        <OptionSelector
          options={selectedOptionItem?.options || []}
          primaryColor={primaryColor}
          onSelect={(option: any) => {
            if (selectedOptionItem) {
              const itemWithOption = {
                ...selectedOptionItem,
                quantity: 1,
                selectedOption: option,
                price: option.price,
              };
              setCart((prev: any) => {
                const existing = prev.find(
                  (i: any) =>
                    i.id === selectedOptionItem.id && i.selectedOption?.id === option.id
                );
                if (existing)
                  return prev.map((i: any) =>
                    i.id === selectedOptionItem.id && i.selectedOption?.id === option.id
                      ? { ...i, quantity: i.quantity + 1 }
                      : i
                  );
                return [...prev, itemWithOption];
              });
              setShowOptions(false);
              setSelectedOptionItem(null);
            }
          }}
          onClose={() => {
            setShowOptions(false);
            setSelectedOptionItem(null);
          }}
        />
      )}
    </div>
  );
};

// ─── CHECKOUT VIEW ─────────────────────────────────────────────────
export const CheckoutView = ({
  cart,
  setCart,
  addToCart,
  removeFromCart,
  setActiveScreen,
  deliveryType,
  setDeliveryType,
  customerInfo,
  setCustomerInfo,
  payWithAmount,
  setPayWithAmount,
  transferFile,
  setTransferFile,
  paymentMethod,
  setPaymentMethod,
  placeOrder,
  cartTotal,
  menuItems,
  settings,
  currency = 'MXN',
  deliveryFee = 0,
  deliveryDistanceKm = 0,
  primaryColor = '#C53030',
  secondaryColor = '#1A1A2E',
  visitorId,
}: any) => {
  const { t } = useTranslations();
  const [submitting, setSubmitting] = useState(false);

  const hasItems = cart && cart.length > 0;
  const grandTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!hasItems || !customerInfo.name) return;
    setSubmitting(true);
    try {
      await placeOrder(paymentMethod);
    } catch (err) {
      console.error('Order error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasItems) {
    return (
      <div className="animate-in fadein slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between relative mb-6">
          <button
            onClick={() => setActiveScreen('menu')}
            className="absolute left-0 p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center text-2xl font-bold italic uppercase">
            {t('checkoutTitle', 'Tu Orden')}
          </h2>
        </div>
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {t('emptyCart', 'Tu carrito está vacío')}
          </p>
          <button
            onClick={() => setActiveScreen('menu')}
            className="mt-4 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {t('viewMenu', 'Ver Menú')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fadein slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between relative mb-6">
        <button
          onClick={() => setActiveScreen('menu')}
          className="absolute left-0 p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-2xl font-bold italic uppercase">
          {t('checkoutTitle', 'Tu Orden')}
        </h2>
      </div>

      {/* Cart Items */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">
            {t('yourOrder', 'Tu Orden')} ({cart.length}{' '}
            {cart.length === 1 ? 'item' : 'items'})
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {cart.map((item: any) => (
            <div key={item.id} className="p-4 flex items-center gap-3">
              {item.image && (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <img
                    src={item.image}
                    className="w-full h-full object-cover"
                    alt={item.name}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  ${item.price} c/u
                  {item.selectedOption && ` · ${item.selectedOption.label}`}
                  {item.weightInGrams && ` · ${item.weightInGrams}g`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="font-black text-sm w-16 text-right" style={{ color: secondaryColor }}>
                ${(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Type */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
          {t('deliveryTitle', 'Entrega')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDeliveryType('domicilio')}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
              deliveryType === 'domicilio'
                ? 'border-black bg-gray-50'
                : 'border-gray-100 bg-white'
            }`}
          >
            <Bike
              className={`w-5 h-5 mb-1 ${
                deliveryType === 'domicilio' ? 'text-black' : 'text-gray-400'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-center">
              {t('deliveryOptionLabel', 'A Domicilio')}
            </span>
          </button>
          <button
            onClick={() => setDeliveryType('sucursal')}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
              deliveryType === 'sucursal'
                ? 'border-black bg-gray-50'
                : 'border-gray-100 bg-white'
            }`}
          >
            <Store
              className={`w-5 h-5 mb-1 ${
                deliveryType === 'sucursal' ? 'text-black' : 'text-gray-400'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-center">
              {t('pickupOptionLabel', 'Recoger')}
            </span>
          </button>
        </div>
      </section>

      {/* Customer Info */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 mb-3">
          {t('customerInfo', 'Tus Datos')}
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder={t('namePlaceholder', 'Nombre completo *')}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
            value={customerInfo.name}
            onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
          />
          <input
            type="tel"
            placeholder={t('phonePlaceholder', 'Teléfono *')}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
            value={customerInfo.customerPhone || ''}
            onChange={e =>
              setCustomerInfo({ ...customerInfo, customerPhone: e.target.value })
            }
          />
          {deliveryType === 'domicilio' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder={t('streetPlaceholder', 'Calle y número *')}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
                value={customerInfo.street || ''}
                onChange={e =>
                  setCustomerInfo({ ...customerInfo, street: e.target.value })
                }
              />
              <input
                type="text"
                placeholder={t('coloniaPlaceholder', 'Colonia *')}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
                value={customerInfo.colonia || ''}
                onChange={e =>
                  setCustomerInfo({ ...customerInfo, colonia: e.target.value })
                }
              />
              <input
                type="text"
                placeholder={t('addressDetailsPlaceholder', 'Detalles (casa, depa, punto de referencia)')}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
                value={customerInfo.addressDetails || ''}
                onChange={e =>
                  setCustomerInfo({ ...customerInfo, addressDetails: e.target.value })
                }
              />
            </div>
          )}
        </div>
      </section>

      {/* Payment Method */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" style={{ color: primaryColor }} />
          {t('paymentTitle', 'Pago')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPaymentMethod('efectivo')}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
              paymentMethod === 'efectivo'
                ? 'border-black bg-gray-50'
                : 'border-gray-100 bg-white'
            }`}
          >
            <Banknote
              className={`w-5 h-5 mb-1 ${
                paymentMethod === 'efectivo' ? 'text-black' : 'text-gray-400'
              }`}
            />
            <span className="text-[8px] font-bold uppercase">Efectivo</span>
          </button>
          <button
            onClick={() => setPaymentMethod('tarjeta')}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
              paymentMethod === 'tarjeta'
                ? 'border-black bg-gray-50'
                : 'border-gray-100 bg-white'
            }`}
          >
            <CreditCard
              className={`w-5 h-5 mb-1 ${
                paymentMethod === 'tarjeta' ? 'text-black' : 'text-gray-400'
              }`}
            />
            <span className="text-[8px] font-bold uppercase">Tarjeta</span>
          </button>
          <button
            onClick={() => setPaymentMethod('transferencia')}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
              paymentMethod === 'transferencia'
                ? 'border-black bg-gray-50'
                : 'border-gray-100 bg-white'
            }`}
          >
            <Smartphone
              className={`w-5 h-5 mb-1 ${
                paymentMethod === 'transferencia' ? 'text-black' : 'text-gray-400'
              }`}
            />
            <span className="text-[8px] font-bold uppercase">Transferencia</span>
          </button>
        </div>

        {/* Cash amount input */}
        {paymentMethod === 'efectivo' && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 font-medium mb-1 block">
              {t('payWithAmount', 'Paga con:')}
            </label>
            <input
              type="number"
              placeholder="$0"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm"
              value={payWithAmount}
              onChange={e => setPayWithAmount(e.target.value)}
            />
            {payWithAmount && parseFloat(payWithAmount) > grandTotal && (
              <p className="text-xs text-green-600 mt-1">
                Cambio: ${(parseFloat(payWithAmount) - grandTotal).toFixed(0)}
              </p>
            )}
          </div>
        )}

        {/* Transfer screenshot upload */}
        {paymentMethod === 'transferencia' && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 font-medium mb-1 block">
              {t('uploadProof', 'Sube comprobante de pago (opcional)')}
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              onChange={e => setTransferFile(e.target.files?.[0] || null)}
            />
          </div>
        )}
      </section>

      {/* Total + Delivery Fee */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('subtotal', 'Subtotal')}</span>
            <span>{formatMoney(cartTotal, currency)}</span>
          </div>
          {deliveryType === 'domicilio' && deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('deliveryFee', 'Envío')}</span>
              <span>{formatMoney(deliveryFee, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg border-t-2 border-black pt-2 uppercase">
            <span>{t('total', 'Total')}</span>
            <span style={{ color: secondaryColor }}>{formatMoney(grandTotal, currency)}</span>
          </div>
        </div>
      </section>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={!customerInfo.name || submitting || (deliveryType === 'domicilio' && (!customerInfo.street || !customerInfo.colonia))}
        className="w-full py-5 rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 transition-all active:scale-95 text-white uppercase italic mb-8"
        style={{
          backgroundColor: !customerInfo.name ? '#ccc' : primaryColor,
        }}
      >
        {submitting
          ? t('submitting', 'Enviando...')
          : t('placeOrder', 'Hacer Pedido')}
      </button>
    </div>
  );
};

// ─── TRACKING VIEW ─────────────────────────────────────────────────
export const TrackingView = ({
  currentOrder,
  setActiveScreen,
  primaryColor = '#f59e0b',
  currency = 'MXN',
  uiText,
}: any) => {
  const { t } = useTranslations();
  if (!currentOrder) return null;
  const statusSteps: OrderStatus[] = ['recibido', 'preparando', 'listo', 'en_camino', 'entregado'];
  const currentIdx = statusSteps.indexOf(currentOrder.status);

  const getStatusText = () => {
    switch (currentOrder.status) {
      case 'recibido':
        return t('statusReceived', 'Pedido Recibido');
      case 'preparando':
        return t('statusPreparing', 'Preparando tu Orden');
      case 'listo':
        return t('statusReady', '¡Listo!');
      case 'en_camino':
        return t('statusOnWay', 'En Camino');
      case 'entregado':
        return t('statusDelivered', '¡Entregado!');
      default:
        return '';
    }
  };

  return (
    <div className="animate-in fadein zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4"
          style={{ backgroundColor: `${primaryColor}20`, borderColor: primaryColor }}
        >
          {currentOrder.status === 'recibido' && <Clock className="w-10 h-10" style={{ color: primaryColor }} />}
          {currentOrder.status === 'preparando' && <ChefHat className="w-10 h-10 animate-bounce" style={{ color: primaryColor }} />}
          {currentOrder.status === 'listo' && <CheckCircle2 className="w-10 h-10 text-green-600" />}
          {(currentOrder.status === 'en_camino' || currentOrder.status === 'entregado') && (
            <Bike className="w-10 h-10" style={{ color: primaryColor }} />
          )}
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase italic">{getStatusText()}</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
          Ticket: #{currentOrder.id}
        </p>
      </div>

      <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm mb-6">
        <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest mb-3 border-b-2 border-gray-50 pb-2">
          {t('yourOrder', 'Tu Orden')}
        </h3>
        <div className="space-y-2">
          {currentOrder.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm font-bold">
              <span className="text-gray-600 italic">
                {item.quantity}x {item.name}
              </span>
              <span className="font-black">${item.price * item.quantity}</span>
            </div>
          ))}
          {currentOrder.deliveryFee !== undefined && (
            <div className="flex justify-between font-black text-sm text-gray-600 italic">
              <span>{t('deliveryFee', 'Envío')}</span>
              <span>{formatMoney(currentOrder.deliveryFee, currency)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-black font-black text-xl text-black uppercase italic text-right">
            <span>{t('total', 'Total')}</span>
            <span>{formatMoney(currentOrder.total + (currentOrder.deliveryFee ?? 0), currency)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setActiveScreen('landing')}
        className="w-full mt-6 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors"
      >
        {t('newOrderButton', uiText?.newOrderButton || 'Nuevo Pedido')}
      </button>
    </div>
  );
};
