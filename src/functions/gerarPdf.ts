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

// Interface para rastrear categorias e suas páginas
interface CategoryPageInfo {
  name: string;
  startPage: number;
  productCount: number;
  items: PlanilhaMercosType[];
}

export const gerarPDFComProgresso = async (
  itensSelecionados: PlanilhaMercosType[],
  onProgress?: ProgressCallback
) => {
  if (itensSelecionados.length === 0) {
    alert("Selecione pelo menos um produto para gerar o PDF");
    return;
  }

  // Agrupar itens por categoria
  const categoriesMap = new Map<string, PlanilhaMercosType[]>();
  
  itensSelecionados.forEach(item => {
    const categoria = item.categoria || "Sem Categoria";
    if (!categoriesMap.has(categoria)) {
      categoriesMap.set(categoria, []);
    }
    categoriesMap.get(categoria)!.push(item);
  });

  // Ordenar categorias alfabeticamente
  const sortedCategories = Array.from(categoriesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b));

  // Callback helper para atualizar progresso
  const updateProgress = (
    current: number,
    message: string,
    status: "processing" | "complete" | "error" = "processing"
  ) => {
    if (onProgress) {
      const currentItem = current < itensSelecionados.length
        ? (current >= 0 && itensSelecionados[current] ? itensSelecionados[current].nome : "")
        : "";
      onProgress({
        current,
        total: itensSelecionados.length,
        percentage: Math.round((current / itensSelecionados.length) * 100),
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
    const margin = 8; // Reduzido para aproveitar mais espaço
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // CONFIGURAÇÃO OTIMIZADA: 3x4 para produtos maiores
    const itemsPerRow = 3;
    const rowsPerPage = 4;
    const itemsPerPage = itemsPerRow * rowsPerPage; // 12 itens por página

    const gapBetweenItems = 4; // Reduzido o gap entre itens
    const headerHeight = 25; // Altura do cabeçalho
    const itemWidth = (usableWidth - gapBetweenItems * (itemsPerRow - 1)) / itemsPerRow;
    const itemHeight = (usableHeight - headerHeight - gapBetweenItems * (rowsPerPage - 1)) / rowsPerPage;
    
    // Otimizado: mais espaço para imagem, menos para texto
    const textAreaHeight = 18; // Reduzido área de texto
    const imageHeight = itemHeight - textAreaHeight; // Mais espaço para imagem

    let currentPageNumber = 1; // Começar contagem das páginas

    // Array para rastrear informações das categorias e suas páginas
    const categoryPageInfo: CategoryPageInfo[] = [];

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
      pdf.text(
        `${itensSelecionados.length} PRODUTOS`,
        pageWidth / 2,
        pageHeight * 0.755,
        { align: "center" }
      );

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
        pageWidth / 2,
        pageHeight * 0.775,
        { align: "center" }
      );

      // Rodapé
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(
        "Catalogo Digital - Versao 2.0",
        pageWidth / 2,
        pageHeight * 0.95,
        { align: "center" }
      );

      pdf.setTextColor(0, 0, 0);
      currentPageNumber++; // Página 1 = Capa
    };

    const createIndexPage = () => {
      pdf.addPage();

      // Cabeçalho do índice
      pdf.setFillColor(51, 65, 85);
      pdf.rect(0, 0, pageWidth, 40, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("ÍNDICE DE CATEGORIAS", pageWidth / 2, 18, { align: "center" });

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Navegue pelas principais categorias de produtos",
        pageWidth / 2,
        32,
        { align: "center" }
      );

      let startY = 55;
      const itemHeight = 16;
      const itemsPerColumn = Math.floor((pageHeight - 100) / itemHeight);
      const columnWidth = (pageWidth - 40) / 2;

      categoryPageInfo.forEach((category, index) => {
        const isSecondColumn = index >= itemsPerColumn;
        const columnIndex = index % itemsPerColumn;
        const x = isSecondColumn ? pageWidth / 2 + 10 : 20;
        const y = startY + columnIndex * itemHeight;

        // Card da categoria
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(x, y - 2, columnWidth - 10, itemHeight - 2, 3, 3, "FD");

        // Nome da categoria
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        
        // Truncar nome se muito longo
        const maxLength = 35;
        const categoryName = category.name.length > maxLength 
          ? category.name.substring(0, maxLength) + "..." 
          : category.name;
        
        pdf.text(`${index + 1}. ${categoryName}`, x + 6, y + 6);

        // Informações adicionais
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${category.productCount} produtos`, x + 6, y + 9);
        
        // Número da página
        pdf.setTextColor(59, 130, 246);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Pág. ${category.startPage}`, x + columnWidth - 25, y + 9);
      });

      // Nota informativa
      pdf.setFillColor(239, 246, 255);
      pdf.setDrawColor(147, 197, 253);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(20, pageHeight - 50, pageWidth - 40, 30, 5, 5, "FD");

      pdf.setTextColor(30, 64, 175);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Dica de Navegação", 30, pageHeight - 40);

      pdf.setTextColor(30, 58, 138);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Os produtos estão organizados por categorias para facilitar sua busca.",
        30,
        pageHeight - 32
      );
      pdf.text(
        "Use este índice como referência rápida para encontrar o que procura.",
        30,
        pageHeight - 25
      );

      pdf.setTextColor(0, 0, 0);
      currentPageNumber++; // Página 2 = Índice
    };

    const createCategoryIntroPage = (categoryName: string, products: PlanilhaMercosType[]) => {
      pdf.addPage();
      
      // Título da categoria centralizado no meio da página
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(48);
      pdf.setFont("helvetica", "bold");
      
      // Quebrar título se muito longo
      const titleLines = pdf.splitTextToSize(categoryName.toUpperCase(), pageWidth - 40);
      const maxTitleLines = 3;
      const linesToShow = titleLines.slice(0, maxTitleLines);
      
      const startY = pageHeight / 2 - (linesToShow.length * 25) / 2;
      
      linesToShow.forEach((line: string, index: number) => {
        pdf.text(line, pageWidth / 2, startY + (index * 25), { align: "center" });
      });
      
      pdf.setTextColor(0, 0, 0);
      currentPageNumber++;
    };

    const createProductPage = (pageNumber: number, categoryName?: string) => {
      pdf.addPage();

      // Cabeçalho das páginas de produtos - mais compacto
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, headerHeight, "F");

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(0, headerHeight, pageWidth, headerHeight);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(51, 65, 85);
      pdf.text("CATÁLOGO DE PRODUTOS A+CICLO", 15, 10);
      
      // Mostrar categoria atual se disponível
      if (categoryName) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(59, 130, 246);
        const categoryText = categoryName.length > 30 
          ? categoryName.substring(0, 30) + "..." 
          : categoryName;
        pdf.text(`Categoria: ${categoryText}`, 15, 19);
      }

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

    // ETAPA 1: Calcular páginas para cada categoria
    updateProgress(0, "Calculando estrutura do catálogo...");
    
    let tempPageNumber = 3; // Começar após capa e índice
    
    for (const [categoryName, products] of sortedCategories) {
      const categoryInfo: CategoryPageInfo = {
        name: categoryName,
        startPage: tempPageNumber, // Página de introdução da categoria
        productCount: products.length,
        items: products
      };
      
      categoryPageInfo.push(categoryInfo);
      
      // +1 para página de introdução da categoria
      tempPageNumber++;
      
      // Calcular quantas páginas serão necessárias para os produtos
      const pagesNeeded = Math.ceil(products.length / itemsPerPage);
      tempPageNumber += pagesNeeded;
    }

    // ETAPA 2: Criar as páginas
    
    // Criar capa
    updateProgress(0, "Criando capa...");
    createCoverPage();

    // Criar índice (agora com as páginas corretas)
    updateProgress(0, "Criando índice de categorias...");
    createIndexPage();

    // ETAPA 3: Processar cada categoria
    let globalItemIndex = 0;
    
    for (const [categoryIndex, [categoryName, products]] of sortedCategories.entries()) {
      updateProgress(globalItemIndex, `Criando introdução da categoria: ${categoryName}`);
      
      // Criar página de introdução da categoria
      createCategoryIntroPage(categoryName, products);
      
      let itemsInCategoryProcessed = 0;
      let productsPageNumber = 1;
      
      // Processar produtos da categoria
      for (const [productIndex, item] of products.entries()) {
        updateProgress(globalItemIndex, `Processando: ${item.nome}`);

        // Criar nova página de produtos quando necessário
        if (itemsInCategoryProcessed % itemsPerPage === 0) {
          updateProgress(
            globalItemIndex,
            `Criando página de produtos ${productsPageNumber} para ${categoryName}...`
          );
          createProductPage(currentPageNumber, categoryName);
          productsPageNumber++;
        }

        const itemIndexInPage = itemsInCategoryProcessed % itemsPerPage;
        const row = Math.floor(itemIndexInPage / itemsPerRow);
        const col = itemIndexInPage % itemsPerRow;

        const x = margin + col * (itemWidth + gapBetweenItems);
        const y = margin + headerHeight + row * (itemHeight + gapBetweenItems);

        // Card com bordas - mais fino para dar mais espaço à imagem
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(x, y, itemWidth, itemHeight, 2, 2, "FD");

        try {
          updateProgress(globalItemIndex, `Carregando imagem: ${item.nome}`);

          const imageUrl = `http://amaisciclo.com.br:3001/proxy-img?url=https://arquivos.mercos.com/media/${item.imagem_principal}`;
          const img = await loadImage(imageUrl);

          updateProgress(globalItemIndex, `Processando imagem: ${item.nome}`);

          // Cálculo para imagem - usando mais espaço disponível
          const imgRatio = img.width / img.height;
          const availableWidth = itemWidth - 4; // Padding mínimo
          const availableHeight = imageHeight - 2; // Padding mínimo
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

          // Fundo branco para a imagem - mais fino
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
            globalItemIndex,
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
          pdf.setFontSize(18); // Aumentado o placeholder
          pdf.text("IMG", x + itemWidth / 2, y + imageHeight / 2, {
            align: "center",
          });
          pdf.setFontSize(8);
          pdf.text("Sem imagem", x + itemWidth / 2, y + imageHeight / 2 + 8, {
            align: "center",
          });
          pdf.setTextColor(0, 0, 0);
        }

        // Área de texto - mais compacta
        const textStartY = y + imageHeight + 1;

        // Código do produto - menor
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

        // Nome do produto - otimizado
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

        itemsInCategoryProcessed++;
        globalItemIndex++;

        // Delay para UI
        if (globalItemIndex % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    }

    updateProgress(itensSelecionados.length, "Finalizando PDF...");

    const fileName = `catalogo-produtos-${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);

    updateProgress(
      itensSelecionados.length,
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
  return gerarPDFComProgresso(itensSelecionados);
};