import { useState } from "react";
import { Download, Filter, Package, CheckSquare, Square } from "lucide-react";
import type { PlanilhaMercosType } from "../../types/planilhaMercosType";

import { CatalogoProgressoModal } from "./CatalogoProgressoModal";
import { gerarPDFComProgresso, type ProgressInfo } from "../../functions/gerarPdf";
import { gerarPDFComProgressoGeral } from "../../functions/gerarPdfGeral";
import type { FilterType } from "../../App";


type HeaderProps = {
    data: PlanilhaMercosType[];
    itensSelecionados: PlanilhaMercosType[];
    toggleSelecionarTodos: () => void;
    setDefaultFilter?: React.Dispatch<React.SetStateAction<FilterType>>;
    defaultFilter?: FilterType;
}

export default function Header({
    data,
    itensSelecionados,
    toggleSelecionarTodos,
    setDefaultFilter,
    defaultFilter
}: HeaderProps) {
    const [saldoInput, setSaldoInput] = useState<number>(0);
    const [showFilters, setShowFilters] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [progress, setProgress] = useState<ProgressInfo | null>(null);

    const aplicarFiltro = () => {
        setDefaultFilter?.((prev) => ({
            ...prev,
            saldo_maior: saldoInput
        }));
    };

    const handleGerarPDF = async () => {
        setShowProgress(true);
        setProgress({
            current: 0,
            total: itensSelecionados.length,
            percentage: 0,
            currentItem: '',
            status: 'processing',
            message: 'Iniciando...'
        });

        try {
            if (defaultFilter?.por_categorias) {
                await gerarPDFComProgresso(itensSelecionados, (progressInfo) => {
                    setProgress(progressInfo);
                });
            }
            else {
                await gerarPDFComProgressoGeral(itensSelecionados, (progressInfo) => {
                    setProgress(progressInfo);
                });
            }
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
        }
    };

    const handleCloseProgress = () => {
        setShowProgress(false);
        setProgress(null);
    };

    const isAllSelected = itensSelecionados.length === data.length && data.length > 0;
    const selectionPercentage = data.length > 0 ? (itensSelecionados.length / data.length) * 100 : 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            {/* Header principal */}
            <div className="flex items-center justify-between mb-4">
                {/* Lado esquerdo - Info e filtros */}
                <div className="flex items-center gap-4">
                    {/* Badge de produtos */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                        <Package size={18} className="text-emerald-600" />
                        <span className="font-semibold text-emerald-800">
                            {data.length} Produtos
                        </span>
                    </div>

                    {/* Botão de filtros */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                        <Filter size={16} />
                        <span className="text-sm font-medium">Filtros</span>
                    </button>
                    <div className=" flex items-center gap-2 text-sm text-gray-500">
                        <input onChange={() => setDefaultFilter && setDefaultFilter((prev) => {
                            return { ...prev, por_categorias: !prev.por_categorias }
                        })} checked={defaultFilter?.por_categorias} type="checkbox" name="to-categorias" id="to-categorias" />
                        <label htmlFor="to-categorias">Extração por categorias</label>
                    </div>
                </div>

                {/* Lado direito - Seleção e ações */}
                <div className="flex items-center gap-4">
                    {/* Contador de seleção com progress */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {itensSelecionados.length} de {data.length}
                            </div>
                            <div className="text-xs text-gray-500">selecionados</div>
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                                style={{ width: `${selectionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Botão selecionar todos */}
                    <button
                        onClick={toggleSelecionarTodos}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 font-medium"
                    >
                        {isAllSelected ? (
                            <CheckSquare size={16} />
                        ) : (
                            <Square size={16} />
                        )}
                        <span className="text-sm">
                            {isAllSelected ? "Desselecionar" : "Selecionar"} Todos
                        </span>
                    </button>

                    {/* Botão de PDF */}
                    <button
                        onClick={handleGerarPDF}
                        disabled={itensSelecionados.length === 0}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${itensSelecionados.length === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                            }`}
                    >
                        <Download size={16} />
                        <span>Extrair PDF</span>
                        {itensSelecionados.length > 0 && (
                            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {itensSelecionados.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Painel de filtros expansível */}
            {showFilters && (
                <div className="pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                        <label htmlFor="saldo_maior" className="text-sm font-medium text-gray-700">
                            Saldo mínimo:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                name="saldo_maior"
                                id="saldo_maior"
                                placeholder="0"
                                value={saldoInput || ''}
                                onChange={(e) => setSaldoInput(e.target.value ? parseInt(e.target.value) : 0)}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <button
                                onClick={aplicarFiltro}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Progresso */}
            <CatalogoProgressoModal
                isOpen={showProgress}
                onClose={handleCloseProgress}
                progress={progress}
            />
        </div>
    );
}