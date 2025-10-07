import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ROTULOS_PDF, TEMA_PDF } from '../constants/pdf-theme.constants';
import { loadAndResizeImageAsBase64 } from '../utils/image.utils';
import { formatDate } from '@angular/common';

export interface PdfConfig {
  nomeArquivo: string;
  titulo: string;
  head: string[][];
  body: any[][];
}

@Injectable({ providedIn: 'root' })
export class PdfService {
  async gerarPdfTabela(titulo: string, nomeArquivo: string, head: string[][], body: any[][]): Promise<void> {
    const doc = new jsPDF();
    const tema = TEMA_PDF;
    const rotulos = ROTULOS_PDF;
    const logoBase64 = await loadAndResizeImageAsBase64({ src: 'assets/images/asfa-logo.png' });

    doc.addImage(logoBase64, 'PNG', tema.margemPadrao, 10, tema.tamanhoLogo, tema.tamanhoLogo);
    doc.setFont(tema.fontes.familia, tema.fontes.pesoNegrito);
    doc.setFontSize(tema.fontes.tamanhoTitulo);
    doc.text(rotulos.instituicao, tema.margemPadrao + tema.tamanhoLogo + 5, 22);
    doc.setFontSize(tema.fontes.tamanhoSubtitulo);
    doc.text(titulo, tema.margemPadrao, tema.alturaCabecalho + 15);

    autoTable(doc, {
      startY: tema.alturaCabecalho + 25,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [70, 130, 180] }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(tema.fontes.tamanhoRodape);
        const dataGeracao = `${rotulos.geradoEm} ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
        doc.text(dataGeracao, tema.margemPadrao, doc.internal.pageSize.height - tema.rodapeOffsetY);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - tema.margemPadrao, doc.internal.pageSize.height - tema.rodapeOffsetY, { align: 'right' });
    }

    doc.save(`${nomeArquivo}-${formatDate(new Date(), 'yyyy-MM-dd', 'pt-BR')}.pdf`);
  }

  gerarPdf(config: PdfConfig): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(config.titulo, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: config.head,
      body: config.body,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(config.nomeArquivo);
  }
}