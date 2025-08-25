import React from "react";
import * as XLSX from "xlsx";

export default function ExcelUploader({setData}: { setData: React.Dispatch<React.SetStateAction<any[]>> }) {


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;

      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0]; // pega a primeira aba
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" }); // defval evita undefined

      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 bg-gray-100 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Upload de Planilha
      </h1>

      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
        className="block w-full max-w-sm text-sm text-gray-700
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />


    </div>
  );
}
