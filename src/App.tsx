import { useState } from "react";
import ExcelUploader from "./components/XLSXReader/ExcelUploader";
import { CatalogoLista } from "./components/Catalogo/CatalogoLista";
import './App.css';
import type { PlanilhaMercosType } from "./types/planilhaMercosType";

function App() {
  const [data, setData] = useState<PlanilhaMercosType[]>([]);
  const [defaultFilter, setDefaultFilter] = useState<{ saldo_maior: number, ativo?: 'True' | 'False' }>({
    saldo_maior: -1,
    ativo: 'True',
  });
  const itensComImagem = data.filter(item => item.imagem_principal &&
    item.imagem_principal.trim() !== "" &&
    item.ativo === 'True' && item.saldo_estoque > defaultFilter.saldo_maior)

  return (
    <div className="">
      <ExcelUploader setData={setData} />
      <CatalogoLista data={itensComImagem} setDefaultFilter={setDefaultFilter} />
    </div>
  );
}

export default App;