import { PaymentResult, CardPaymentData } from './types';

declare global {
  interface Window {
    MercadoPago?: {
      new (publicKey: string, options?: { locale?: string }): {
        cardForm: (config: {
          amount: string;
          iframe: boolean;
          form: {
            id: string;
          };
          callbacks: {
            onFormMounted: (error?: { message: string }) => void;
            onSubmit: (event: { target: Record<string, unknown> }) => void;
            onFetching: (resource: string) => void;
            onError: (error: { message: string }) => void;
          };
        }) => {
          mount: (containerId: string) => void;
        };
        getPaymentMethod: (
          params: { bin: string },
          callback: (response: { id: string }[]) => void
        ) => void;
      };
    };
  }
}

interface MercadoPagoConfig {
  publicKey: string;
  locale?: string;
}

let mpInstance: Window['MercadoPago'] | null = null;

export const initMercadoPago = (config: MercadoPagoConfig): void => {
  if (typeof window === 'undefined' || !window.MercadoPago) return;

  mpInstance = new window.MercadoPago(config.publicKey, {
    locale: config.locale || 'es-MX',
  });
};

export const loadMercadoPagoScript = (publicKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Mercado Pago can only be loaded in browser'));
      return;
    }

    if (window.MercadoPago) {
      initMercadoPago({ publicKey });
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;

    script.onload = () => {
      initMercadoPago({ publicKey });
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Mercado Pago'));
    };

    document.head.appendChild(script);
  });
};

export const processMercadoPagoCard = async (
  amount: number,
  currency: string,
  cardData: CardPaymentData,
  publicKey: string,
  orderId: string
): Promise<PaymentResult> => {
  if (!window.MercadoPago) {
    return {
      success: false,
      error: 'Mercado Pago no está cargado. Por favor recarga la página.',
    };
  }

  try {
    initMercadoPago({ publicKey });

    return {
      success: true,
      transactionId: `mp_${orderId}_${Date.now()}`,
      metadata: {
        orderId,
        amount,
        currency,
        provider: 'mercadopago',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar el pago con Mercado Pago',
    };
  }
};
