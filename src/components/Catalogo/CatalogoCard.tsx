import type { PlanilhaMercosType } from "../../types/planilhaMercosType";

type CatalogoCardProps = {
    item: PlanilhaMercosType;
    selecionado: boolean;
    toggleSelecao: (item: PlanilhaMercosType) => void;
    index: number;
}

export default function CatalogoCard({ item, selecionado, toggleSelecao, index }: CatalogoCardProps) {
    return (<div
        key={index}
        className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border overflow-hidden cursor-pointer ${selecionado ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-100'
            }`}
        onClick={() => toggleSelecao(item)}
    >
        <div className="absolute top-2 left-2 z-10">
            <input
                type="checkbox"
                checked={selecionado}
                onChange={() => toggleSelecao(item)}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 text-blue-600 z-100 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
        </div>

        <div className="relative w-full h-48 overflow-hidden flex items-center justify-center">
            <img
                className="max-w-full max-h-full z-50 object-contain group-hover:scale-105 transition-transform duration-300"
                src={"https://arquivos.mercos.com/media/" + item.imagem_principal}
                alt={item.imagem_principal}
            />
            {selecionado && (
                <div className="absolute inset-0  bg-opacity-10 flex items-center justify-center">
                    <div className="bg-blue-500 text-white rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 space-y-2 text-center">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selecionado ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700'
                }`}>
                {item.codigo}

            </span>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                {item.nome}
            </h3>
    
        </div>
    </div>)
}