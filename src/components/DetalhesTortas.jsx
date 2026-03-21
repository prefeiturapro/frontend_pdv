import React from 'react';

export const DetalhesTortas = ({ encomenda, onClose }) => {
  if (!encomenda) return null;

  const getImagemSrc = (enc) => {
    if (typeof enc.ds_fototorta === 'string') {
        return `data:image/jpeg;base64,${enc.ds_fototorta}`;
    }
    if (enc.ds_fototorta && enc.ds_fototorta.data) {
        const base64String = btoa(
            new Uint8Array(enc.ds_fototorta.data)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return `data:image/jpeg;base64,${base64String}`;
    }
    return null;
  };

  const imagemSrc = getImagemSrc(encomenda);

  // Exibe campo só se tiver valor e não for "N"
  const valorValido = (val) => val && val.toString().trim() !== "" && val.toString().trim().toUpperCase() !== "N";

  const detalhesMenores = [
    { label: "Topo", valor: encomenda.ds_topo },
    { label: "Papel Arroz", valor: encomenda.ds_papel },
    { label: "Formato", valor: encomenda.ds_formato },
    { label: "Glitter", valor: encomenda.ds_glitter },
    { label: "Shape", valor: encomenda.ds_shape },
  ].filter(d => valorValido(d.valor));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm"
         onClick={onClose}>

      {/* Container principal */}
      <div
        className="bg-white w-full sm:max-w-2xl lg:max-w-4xl sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}
      >

        {/* Cabeçalho */}
        <div className="bg-blue-800 text-white shrink-0">
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-0.5">
                Ordem #{encomenda.id_ordemservicos || encomenda.id_encomendas}
              </p>
              <h2 className="text-xl sm:text-2xl font-black leading-tight uppercase truncate">
                {encomenda.nm_nomefantasia}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="ml-3 shrink-0 w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Faixa de destaques */}
          <div className="grid grid-cols-3 border-t border-white/20">
            {/* Tamanho — destaque maior */}
            {encomenda.vl_tamanho ? (
              <div className="flex flex-col items-center justify-center py-3 bg-yellow-400 text-yellow-900">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Tamanho</span>
                <span className="text-2xl sm:text-3xl font-black leading-none mt-0.5">
                  {parseFloat(encomenda.vl_tamanho).toFixed(1).replace(".", ",")}
                </span>
                <span className="text-xs font-bold opacity-80">kg</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-3 bg-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tamanho</span>
                <span className="text-lg font-black opacity-60">—</span>
              </div>
            )}

            {/* Data */}
            <div className="flex flex-col items-center justify-center py-3 bg-white/10 border-l border-r border-white/20">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Entrega</span>
              <span className="text-base sm:text-lg font-black leading-tight mt-0.5 text-center">
                {encomenda.dt_formatada}
              </span>
            </div>

            {/* Hora */}
            <div className="flex flex-col items-center justify-center py-3 bg-white/10">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Hora</span>
              <span className="text-base sm:text-lg font-black leading-tight mt-0.5">
                {encomenda.hr_horaenc}
              </span>
            </div>
          </div>
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 overflow-y-auto">

          {/* Foto (se houver) */}
          {imagemSrc ? (
            <div className="w-full bg-gray-100" style={{ height: 220 }}>
              <img
                src={imagemSrc}
                alt="Foto da Torta"
                className="w-full h-full object-contain bg-gray-50"
              />
            </div>
          ) : (
            <div className="w-full bg-gray-50 flex flex-col items-center justify-center text-gray-300 py-8 border-b border-gray-100">
              <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="text-sm">Sem foto anexada</span>
            </div>
          )}

          {/* Informações */}
          <div className="p-4 space-y-3">

            {/* Recheio */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
              <h3 className="text-xs font-extrabold text-yellow-700 uppercase tracking-wider mb-1">
                🍰 Recheio / Sabor
              </h3>
              <p className="text-2xl sm:text-3xl font-black text-gray-800 leading-snug">
                {encomenda.ds_recheio || "Padrão / Não informado"}
              </p>
            </div>

            {/* Decoração */}
            {valorValido(encomenda.ds_decoracao) && (
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-xl">
                <h3 className="text-xs font-extrabold text-purple-700 uppercase tracking-wider mb-1">
                  🎨 Decoração / Tema
                </h3>
                <p className="text-2xl sm:text-3xl font-black text-gray-800 leading-snug">
                  {encomenda.ds_decoracao}
                </p>
              </div>
            )}

            {/* Detalhes menores em grid */}
            {detalhesMenores.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {detalhesMenores.map(d => (
                  <div key={d.label} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">{d.label}</span>
                    <span className="font-semibold text-gray-700 text-sm">{d.valor}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Observações */}
            {valorValido(encomenda.ds_obstortas) && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Observações
                </h3>
                <p className="text-red-800 font-black text-2xl sm:text-3xl leading-snug">
                  {encomenda.ds_obstortas}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Rodapé fixo */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow hover:bg-blue-800 active:scale-95 transition-all uppercase text-sm tracking-wider"
          >
            Fechar Visualização
          </button>
        </div>

      </div>
    </div>
  );
};
