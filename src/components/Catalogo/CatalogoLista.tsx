import { useState } from "react";
import type { PlanilhaMercosType } from "../../types/planilhaMercosType";
import Header from "./Header";
import CatalogoCard from "./CatalogoCard";

type CatalogoListaProps = {
    data: PlanilhaMercosType[];
    setDefaultFilter?: React.Dispatch<React.SetStateAction<{
        saldo_maior: number;
        ativo?: "True" | "False";
    }>>
}

export function CatalogoLista({ data, setDefaultFilter }: CatalogoListaProps) {
    const [itensSelecionados, setItensSelecionados] = useState<PlanilhaMercosType[]>([]);

    const toggleSelecao = (item: PlanilhaMercosType) => {
        setItensSelecionados(prev => {
            const jaEstaSelcionado = prev.some(selected => selected.codigo === item.codigo);
            if (jaEstaSelcionado) {
                return prev.filter(selected => selected.codigo !== item.codigo);
            } else {
                return [...prev, item];
            }
        });
    };

    const isItemSelecionado = (item: PlanilhaMercosType) => {
        return itensSelecionados.some(selected => selected.codigo === item.codigo);
    };

    const toggleSelecionarTodos = () => {
        if (itensSelecionados.length === data.length) {
            setItensSelecionados([]);
        } else {
            setItensSelecionados([...data]);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Header setDefaultFilter={setDefaultFilter} data={data} itensSelecionados={itensSelecionados} toggleSelecionarTodos={toggleSelecionarTodos} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {data.map((item, index) => {
                    const selecionado = isItemSelecionado(item);
                    return (
                        <CatalogoCard index={index} item={item} selecionado={selecionado} toggleSelecao={toggleSelecao} />
                    );
                })}
            </div>
        </div>
    );
}