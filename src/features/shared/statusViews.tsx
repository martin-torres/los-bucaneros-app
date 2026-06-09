interface LoadingViewProps {
  restaurantName?: string;
  primaryColor?: string;
  backgroundColor?: string;
  loadingTitle?: string;
}

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
  errorTitle?: string;
  retryLabel?: string;
}

export const LoadingView = ({
  restaurantName = 'Restaurant',
  primaryColor = '#f59e0b',
  backgroundColor = '#f8fafc',
  loadingTitle = 'Cargando Menú',
}: LoadingViewProps) => (
  <div
    className="h-screen w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500"
    style={{ backgroundColor }}
  >
    <div className="relative w-24 h-24 mb-8">
      <div className="absolute inset-0 border-4 border-black/10 rounded-full"></div>
      <div
        className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin"
        style={{ borderColor: `${primaryColor}`, borderTopColor: 'transparent' }}
      ></div>
    </div>
    <h2 className="text-2xl font-black uppercase italic text-gray-900 mb-2">{loadingTitle}</h2>
    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{restaurantName}</p>
    <div className="mt-8 flex gap-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          // Keep loading dots in sync with configured brand color.
          style={{ backgroundColor: primaryColor, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  </div>
);


export const ErrorView = ({
  error,
  onRetry,
  errorTitle = 'Error al Cargar',
  retryLabel = 'Intentar de Nuevo',
}: ErrorViewProps) => (
  <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-background animate-in fade-in zoom-in-95 duration-500">
    <div className="w-full max-w-md bg-white border-2 border-red-200 p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(239,68,68,0.3)] text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-black uppercase italic text-gray-900 mb-3">{errorTitle}</h2>
      <p className="text-sm text-gray-600 mb-8">{error}</p>
      <button
        onClick={onRetry}
        className="w-full bg-red-500 text-white py-4 rounded-xl font-black uppercase text-sm italic hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30"
      >
        {retryLabel}
      </button>
    </div>
  </div>
);
