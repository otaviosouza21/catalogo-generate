import jsPDF from "jspdf";
import type { PlanilhaMercosType } from "../types/planilhaMercosType";

import Logo from "../assets/logo_amaisciclo.png";

// Tipos para controle de progresso
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  currentItem: string;
  status: "processing" | "complete" | "error";
  message: string;
}

type ProgressCallback = (progress: ProgressInfo) => void;

export const gerarPDFComProgressoGeral = async (
  itensSelecionados: PlanilhaMercosType[],
  onProgress?: ProgressCallback
) => {
  if (itensSelecionados.length === 0) {
    alert("Selecione pelo menos um produto para gerar o PDF");
    return;
  }

  // Ordenar itens por nome em ordem alfabética
  const produtosOrdenados = [...itensSelecionados].sort((a, b) => 
    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
  );

  // Callback helper para atualizar progresso
  const updateProgress = (
    current: number,
    message: string,
    status: "processing" | "complete" | "error" = "processing"
  ) => {
    if (onProgress) {
      const currentItem = current < produtosOrdenados.length && current >= 0
        ? (produtosOrdenados[current]?.nome || "")
        : "";
      onProgress({
        current,
        total: produtosOrdenados.length,
        percentage: Math.round((current / produtosOrdenados.length) * 100),
        currentItem,
        status,
        message,
      });
    }
  };

  try {
    // Inicialização
    updateProgress(0, "Inicializando geração do PDF...");

    // Layout otimizado - 3 colunas x 4 linhas = 12 itens por página
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // CONFIGURAÇÃO: 3x4 para produtos
    const itemsPerRow = 3;
    const rowsPerPage = 4;
    const itemsPerPage = itemsPerRow * rowsPerPage; // 12 itens por página

    const gapBetweenItems = 4;
    const headerHeight = 25;
    const itemWidth = (usableWidth - gapBetweenItems * (itemsPerRow - 1)) / itemsPerRow;
    const itemHeight = (usableHeight - headerHeight - gapBetweenItems * (rowsPerPage - 1)) / rowsPerPage;
    
    const textAreaHeight = 18;
    const imageHeight = itemHeight - textAreaHeight;

    let currentPageNumber = 1;

    const createCoverPage = () => {
      // Fundo gradiente simulado com múltiplas camadas
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.setFillColor(30, 41, 59);
      pdf.rect(0, 0, pageWidth, pageHeight * 0.7, "F");

      pdf.setFillColor(51, 65, 85);
      pdf.rect(0, 0, pageWidth, pageHeight * 0.4, "F");

      pdf.addImage(Logo, "PNG", 30, 30, 160, 60);

      // Título principal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.setFont("helvetica", "bold");
      pdf.text("CATÁLOGO", pageWidth / 2, pageHeight * 0.5, {
        align: "center",
      });

      pdf.setFontSize(28);
      pdf.setFont("helvetica", "normal");
      pdf.text("DE PRODUTOS", pageWidth / 2, pageHeight * 0.54, {
        align: "center",
      });

      // Subtítulo
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Peças e Acessórios para Ciclismo",
        pageWidth / 2,
        pageHeight * 0.58,
        { align: "center" }
      );

      // Informações do catálogo
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(
        pageWidth * 0.15,
        pageHeight * 0.72,
        pageWidth * 0.7,
        25,
        5,
        5,
        "F"
      );

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Ordenados Alfabeticamente - Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
        pageWidth / 2,
        pageHeight * 0.775,
        { align: "center" }
      );

      // Rodapé
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(
        "Catálogo Digital - Versão 2.0",
        pageWidth / 2,
        pageHeight * 0.95,
        { align: "center" }
      );

      pdf.setTextColor(0, 0, 0);
      currentPageNumber++;
    };

    const createProductPage = (pageNumber: number) => {
      pdf.addPage();

      // Cabeçalho das páginas de produtos
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, headerHeight, "F");

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(0, headerHeight, pageWidth, headerHeight);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(51, 65, 85);
      pdf.text("CATÁLOGO DE PRODUTOS A+CICLO", 15, 10);
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(59, 130, 246);
      pdf.text("Produtos em Ordem Alfabética", 15, 19);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Página ${pageNumber}`, pageWidth - 15, 10, {
        align: "right",
      });

      pdf.setFontSize(8);
      pdf.text(new Date().toLocaleDateString("pt-BR"), pageWidth - 15, 18, {
        align: "right",
      });

      pdf.setTextColor(0, 0, 0);
      currentPageNumber++;
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        const timeout = setTimeout(() => {
          reject(new Error("Timeout ao carregar imagem"));
        }, 8000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve(img);
        };

        img.onerror = (e) => {
          clearTimeout(timeout);
          reject(e);
        };

        img.src = url;
      });
    };

    // Criar capa
    updateProgress(0, "Criando capa...");
    createCoverPage();

    // Processar todos os produtos em ordem alfabética
    let itemsProcessed = 0;
    let productsPageNumber = 2; // Começar na página 2 (após a capa)
    
    for (const [productIndex, item] of produtosOrdenados.entries()) {
      updateProgress(productIndex, `Processando: ${item.nome}`);

      // Criar nova página de produtos quando necessário
      if (itemsProcessed % itemsPerPage === 0) {
        updateProgress(
          productIndex,
          `Criando página de produtos ${productsPageNumber}...`
        );
        createProductPage(productsPageNumber);
        productsPageNumber++;
      }

      const itemIndexInPage = itemsProcessed % itemsPerPage;
      const row = Math.floor(itemIndexInPage / itemsPerRow);
      const col = itemIndexInPage % itemsPerRow;

      const x = margin + col * (itemWidth + gapBetweenItems);
      const y = margin + headerHeight + row * (itemHeight + gapBetweenItems);

      // Card com bordas
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(x, y, itemWidth, itemHeight, 2, 2, "FD");

      try {
        updateProgress(productIndex, `Carregando imagem: ${item.nome}`);

        const imageUrl = `http://amaisciclo.com.br:3001/proxy-img?url=https://arquivos.mercos.com/media/${item.imagem_principal}`;
        const img = await loadImage(imageUrl);

        updateProgress(productIndex, `Processando imagem: ${item.nome}`);

        // Cálculo para imagem
        const imgRatio = img.width / img.height;
        const availableWidth = itemWidth - 4;
        const availableHeight = imageHeight - 2;
        const cellRatio = availableWidth / availableHeight;

        let drawWidth = availableWidth;
        let drawHeight = availableHeight;

        if (imgRatio > cellRatio) {
          drawWidth = availableWidth;
          drawHeight = drawWidth / imgRatio;
        } else {
          drawHeight = availableHeight;
          drawWidth = drawHeight * imgRatio;
        }

        const imgX = x + (itemWidth - drawWidth) / 2;
        const imgY = y + 2 + (availableHeight - drawHeight) / 2;

        // Fundo branco para a imagem
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(
          x + 2,
          y + 2,
          itemWidth - 4,
          imageHeight - 2,
          1,
          1,
          "F"
        );

        pdf.addImage(
          img,
          "JPEG",
          imgX,
          imgY,
          drawWidth,
          drawHeight,
          undefined,
          "FAST"
        );
      } catch (error) {
        updateProgress(
          productIndex,
          `Erro ao carregar imagem: ${item.nome} - usando placeholder`
        );

        // Placeholder
        pdf.setFillColor(250, 250, 250);
        pdf.roundedRect(
          x + 2,
          y + 2,
          itemWidth - 4,
          imageHeight - 2,
          1,
          1,
          "F"
        );

        pdf.setTextColor(180, 180, 180);
        pdf.setFontSize(18);
        pdf.text("IMG", x + itemWidth / 2, y + imageHeight / 2, {
          align: "center",
        });
        pdf.setFontSize(8);
        pdf.text("Sem imagem", x + itemWidth / 2, y + imageHeight / 2 + 8, {
          align: "center",
        });
        pdf.setTextColor(0, 0, 0);
      }

      // Área de texto
      const textStartY = y + imageHeight + 1;

      // Código do produto
      pdf.setFillColor(59, 130, 246);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "bold");
      const codigo = item.codigo.length > 15
        ? item.codigo.substring(0, 15) + "..."
        : item.codigo;
      const codigoWidth = pdf.getTextWidth(codigo) + 4;
      pdf.roundedRect(
        x + (itemWidth - codigoWidth) / 2,
        textStartY,
        codigoWidth,
        6,
        2,
        2,
        "F"
      );
      pdf.text(codigo, x + itemWidth / 2, textStartY + 3.5, {
        align: "center",
      });

      // Nome do produto
      pdf.setTextColor(40, 40, 40);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      const nomeFormatado = item.nome.length > 50 
        ? item.nome.substring(0, 50) + "..." 
        : item.nome;
      const nomeLines = pdf.splitTextToSize(nomeFormatado, itemWidth - 4);
      const maxLines = 2;
      const linesToShow = nomeLines.slice(0, maxLines);

      linesToShow.forEach((line: any, lineIndex: number) => {
        pdf.text(line, x + itemWidth / 2, textStartY + 10 + lineIndex * 3, {
          align: "center",
        });
      });

      itemsProcessed++;

      // Delay para UI
      if (productIndex % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    updateProgress(produtosOrdenados.length, "Finalizando PDF...");

    const fileName = `catalogo-produtos-alfabetico-${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);

    updateProgress(
      produtosOrdenados.length,
      "PDF gerado com sucesso!",
      "complete"
    );
  } catch (error) {
    updateProgress(
      0,
      `Erro ao gerar PDF: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      "error"
    );
    throw error;
  }
};

// Função de conveniência
export const gerarPDF = async (itensSelecionados: PlanilhaMercosType[]) => {
  return gerarPDFComProgressoGeral(itensSelecionados);
};