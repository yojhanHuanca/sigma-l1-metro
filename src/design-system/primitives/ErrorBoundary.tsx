import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearData = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("sigma_l1"));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-[#f8fafb] p-6">
          <div className="max-w-[480px] w-full rounded-2xl bg-white border border-[#e6eaee] p-8 shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-200 grid place-items-center mb-5">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-[18px] font-bold text-[#0f172a] mb-2">Error en la aplicación</h1>
            <p className="text-[13px] text-[#64748b] mb-4">
              Se produjo un error inesperado. Intenta recargar la página o limpiar los datos locales.
            </p>
            {this.state.error && (
              <pre className="text-[11px] font-mono text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 mb-4 overflow-auto max-h-[160px]">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={this.handleReset}
                className="px-4 h-9 rounded-lg text-[13px] font-medium text-[#64748b] border border-[#e6eaee] hover:bg-[#f1f5f9] transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleClearData}
                className="px-4 h-9 rounded-lg text-[13px] font-medium text-white bg-[#14814a] hover:bg-[#0f6b3e] transition-colors"
              >
                Limpiar datos y recargar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
