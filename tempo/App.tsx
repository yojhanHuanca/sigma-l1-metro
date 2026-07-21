// Tempo canvas devserver root fallback. The canvas itself is served from
// /tempo-host (see main.tsx). This placeholder only renders if the devserver
// root is opened directly.

export default function App() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#0f1a14] text-white/70 p-10">
      <div className="text-center max-w-md">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/40 mb-3">
          SIGMA L1 · Canvas Devserver
        </p>
        <h1 className="text-[22px] font-bold text-white tracking-tight">
          Seguridad Operativa — Metro de Lima
        </h1>
        <p className="text-[13px] text-white/50 mt-3 leading-relaxed">
          Este servidor potencia la canvas de Tempo. Abrir una canvas en el
          Design tab para visualizar las páginas del sistema.
        </p>
      </div>
    </div>
  );
}
