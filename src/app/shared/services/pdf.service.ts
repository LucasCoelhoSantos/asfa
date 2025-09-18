import { Injectable } from '@angular/core';
import { loadAndResizeImageAsBase64 } from '../utils/image.utils';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { Anexo } from '../../models/anexo.model';
import { Endereco } from '../../models/endereco.model';
import { ComposicaoFamiliar } from '../../models/composicao-familiar.model';
import { Dependente } from '../../models/dependente.model';
import { CATEGORIAS_ANEXO } from '../constants/app.constants';
import { ROTULOS_PDF, TEMA_PDF } from '../constants/pdf.constants';
import type { jsPDF } from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfService {
  private logoBase64Cache?: string;

  async carregarLogoEConverterParaBase64(): Promise<string> {
    if (this.logoBase64Cache) return Promise.resolve(this.logoBase64Cache);
    return await loadAndResizeImageAsBase64({ src: '/asfa-logo.png', crossOrigin: 'anonymous', maxWidth: 80, maxHeight: 80, outputType: 'image/png' })
      .then(base64 => {
        this.logoBase64Cache = base64;
        return base64;
      });
  }

  gerarRodape(documento: jsPDF): void {
    const alturaPagina = documento.internal.pageSize.height;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoRodape);
    documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoItalico);
    documento.text(
      `${ROTULOS_PDF.geradoEm}: ${new Date().toLocaleString('pt-BR')}`,
      documento.internal.pageSize.width / 2,
      alturaPagina - TEMA_PDF.rodapeOffsetY,
      { align: 'center' }
    );
  }

  async gerarPdfPessoa(pessoa: PessoaIdosa): Promise<void> {
    const [{ default: jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const documento = new jsPDF();
    const logoBase64 = await this.carregarLogoEConverterParaBase64();

    const tamanhoLogo = TEMA_PDF.tamanhoLogo;
    const alturaCabecalho = TEMA_PDF.alturaCabecalho;
    const margem = TEMA_PDF.margemPadrao;

    let posicaoY = this.gerarCabecalhoFicha(documento, logoBase64, pessoa, margem, tamanhoLogo, alturaCabecalho);
    posicaoY = this.gerarSecaoInformacoesPessoais(documento, pessoa, margem, posicaoY);
    posicaoY = this.gerarSecaoEndereco(documento, pessoa.endereco, margem, posicaoY);
    posicaoY = this.gerarSecaoComposicaoFamiliar(documento, pessoa.composicaoFamiliar, margem, posicaoY);
    if (pessoa.dependentes && pessoa.dependentes.length > 0) {
      posicaoY = this.gerarSecaoDependentes(documento, pessoa.dependentes, margem, posicaoY);
    }
    posicaoY = this.gerarSecaoObservacoes(documento, pessoa, margem, posicaoY);
    await this.gerarSecaoAnexos(documento, pessoa.anexos || [], margem);
    this.gerarRodape(documento);

    documento.save(`pessoa-idosa-${pessoa.nome.replace(/\s+/g, '-')}.pdf`);
  }

  async gerarPdfLista(pessoas: PessoaIdosa[], filtros: { nome?: string; cpf?: string; estadoCivil?: string; ativo?: boolean; }): Promise<void> {
    const [{ default: jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const documento = new jsPDF();
    const logoBase64 = await this.carregarLogoEConverterParaBase64();

    const tamanhoLogo = TEMA_PDF.tamanhoLogo;
    const alturaCabecalho = TEMA_PDF.alturaCabecalho;
    const margem = TEMA_PDF.margemPadrao;

    this.gerarCabecalhoRelatorio(documento, logoBase64, margem, tamanhoLogo, alturaCabecalho);
    this.gerarInformacoesFiltros(documento, filtros, margem, alturaCabecalho);
    this.gerarTabelaLista(documento, autoTable, pessoas, margem, alturaCabecalho);
    this.gerarRodape(documento);

    documento.save('pessoas-idosas.pdf');
  }

  private gerarCabecalhoFicha(documento: jsPDF, logoBase64: string, pessoa: PessoaIdosa, margem: number, tamanhoLogo: number, alturaCabecalho: number): number {
    documento.addImage(logoBase64, 'PNG', margem, margem, tamanhoLogo, tamanhoLogo);
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo);
    documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito);
    documento.text(ROTULOS_PDF.instituicao, margem + tamanhoLogo + 10, margem + 12);
    documento.setFontSize(TEMA_PDF.fontes.tamanhoTexto);
    documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    documento.text(`Data: ${new Date().toLocaleDateString('pt-BR')} - ${ROTULOS_PDF.localData}`, margem + tamanhoLogo + 10, margem + 22);
    const baseY = margem + alturaCabecalho;
    documento.line(margem, baseY, documento.internal.pageSize.width - margem, baseY);
    documento.setFontSize(TEMA_PDF.fontes.tamanhoTitulo);
    documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito);
    documento.text(ROTULOS_PDF.fichaPessoaIdosa, documento.internal.pageSize.width / 2, baseY + 10, { align: 'center' });
    let posicaoY = baseY + 20;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo);
    documento.text(`Nome: ${pessoa.nome}`, margem, posicaoY);
    posicaoY += 8;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoTexto);
    documento.text(`Data de Cadastro: ${new Date(pessoa.dataCadastro).toLocaleDateString('pt-BR')}`, margem, posicaoY);
    posicaoY += 6;
    documento.text(`Status: ${pessoa.ativo ? ROTULOS_PDF.statusAtivo : ROTULOS_PDF.statusInativo }`, margem, posicaoY);
    posicaoY += 6;
    return posicaoY;
  }

  private gerarSecaoInformacoesPessoais(documento: jsPDF, pessoa: PessoaIdosa, margem: number, posicaoY: number): number {
    posicaoY += 5;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo);
    documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito);
    documento.text(ROTULOS_PDF.informacoesPessoais, margem, posicaoY);
    posicaoY += 8;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoLegenda);
    documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    const info = [
      `Data de Nascimento: ${new Date(pessoa.dataNascimento).toLocaleDateString('pt-BR')}`,
      `Estado Civil: ${pessoa.estadoCivil || '-'}`,
      `CPF: ${pessoa.cpf || '-'}`,
      `RG: ${pessoa.rg || '-'}`,
      `Órgão Emissor: ${pessoa.orgaoEmissor || '-'}`,
      `Religião: ${pessoa.religiao || '-'}`,
      `Naturalidade: ${pessoa.naturalidade || '-'}`,
      `Telefone: ${pessoa.telefone || '-'}`,
      `Prontuário de Saúde: ${pessoa.prontuarioSaude || '-'}`,
      `Aposentado consegue se manter com sua renda: ${pessoa.aposentadoConsegueSeManterComSuaRenda ? 'Sim' : 'Não'}`,
      `Como complementa: ${pessoa.comoComplementa || '-'}`,
      `Benefício: ${pessoa.beneficio || '-'}`
    ];
    info.forEach(texto => { if (posicaoY > documento.internal.pageSize.height - 30) { documento.addPage(); posicaoY = margem; } documento.text(texto, margem, posicaoY); posicaoY += 6; });
    return posicaoY;
  }

  private gerarSecaoEndereco(documento: jsPDF, endereco: Endereco, margem: number, posicaoY: number): number {
    if (posicaoY > documento.internal.pageSize.height - 40) { documento.addPage(); posicaoY = margem; } else { posicaoY += 5; }
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito); documento.text(ROTULOS_PDF.endereco, margem, posicaoY); posicaoY += 8;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoLegenda); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    const linhas = [
      `CEP: ${endereco?.cep || '-'}`,
      `Logradouro: ${endereco?.logradouro || '-'}`,
      `Número: ${endereco?.numero || '-'}`,
      `Bairro: ${endereco?.bairro || '-'}`,
      `Cidade: ${endereco?.cidade || '-'}`,
      `Estado: ${endereco?.estado || '-'}`,
      `Tipo de Moradia: ${endereco?.moradia || '-'}`
    ];
    linhas.forEach(t => { if (posicaoY > documento.internal.pageSize.height - 30) { documento.addPage(); posicaoY = margem; } documento.text(t, margem, posicaoY); posicaoY += 6; });
    return posicaoY;
  }

  private gerarSecaoComposicaoFamiliar(documento: jsPDF, composicao: ComposicaoFamiliar, margem: number, y: number): number {
    if (y > documento.internal.pageSize.height - 60) { documento.addPage(); y = margem; } else { y += 5; }
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito); documento.text(ROTULOS_PDF.composicaoFamiliar, margem, y); y += 8;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoLegenda); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    const linhas = [
      `Alfabetizado: ${composicao?.alfabetizado ? 'Sim' : 'Não'}`,
      `Estuda atualmente: ${composicao?.estudaAtualmente ? 'Sim' : 'Não'}`,
      `Nível/Série atual concluído: ${composicao?.nivelSerieAtualConcluido || '-'}`,
      `Cursos técnicos/formação profissional: ${composicao?.cursosTecnicoFormacaoProfissional || '-'}`,
      `Situação ocupacional: ${composicao?.situacaoOcupacional || '-'}`,
      `Renda: ${composicao?.renda || '-'}`,
      `Aposentado: ${composicao?.aposentado || '-'}`,
      `Benefício: ${composicao?.beneficio || '-'}`,
      `Deficiência: ${composicao?.deficiencia || '-'}`,
      `Problema de saúde: ${composicao?.problemaDeSaude || '-'}`,
      `Faz algum tratamento: ${composicao?.fazAlgumTratamento ? 'Sim' : 'Não'}`,
      `Onde faz tratamento: ${composicao?.fazAlgumTratamentoOnde || '-'}`,
      `Usa medicamento controlado: ${composicao?.usaMedicamentoControlado ? 'Sim' : 'Não'}`,
      `Usa recursos UBS local: ${composicao?.usaRecursosUbsLocal ? 'Sim' : 'Não'}`,
      `Trabalho pastoral ou social: ${composicao?.trabalhoPastoralOuSocial || '-'}`,
      `Atividade na comunidade Sagrada Família: ${composicao?.atividadeNaComunidadeSagradaFamilia || '-'}`,
      `Trabalho voluntário: ${composicao?.trabalhoVoluntario || '-'}`,
      `Onde faz trabalho voluntário: ${composicao?.trabalhoVoluntarioOnde || '-'}`
    ];
    linhas.forEach(t => { if (y > documento.internal.pageSize.height - 30) { documento.addPage(); y = margem; } documento.text(t, margem, y); y += 6; });
    return y;
  }

  private gerarSecaoDependentes(documento: jsPDF, dependentes: Dependente[], margem: number, posicaoY: number): number {
    if (posicaoY > documento.internal.pageSize.height - 40) { documento.addPage(); posicaoY = margem; } else { posicaoY += 5; }
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito); documento.text(ROTULOS_PDF.dependentes, margem, posicaoY); posicaoY += 8;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoLegenda); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    dependentes.forEach((dependente: any, index: number) => {
      if (posicaoY > documento.internal.pageSize.height - 50) { documento.addPage(); posicaoY = margem; }
      documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito); documento.text(`Dependente ${index + 1}: ${dependente.nome}`, margem, posicaoY); posicaoY += 6;
      documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
      const info = [
        `Data de Nascimento: ${new Date(dependente.dataNascimento).toLocaleDateString('pt-BR')}`,
        `Parentesco: ${dependente.parentesco || '-'}`,
        `CEINF: ${dependente.ceinf || '-'}`,
        `Bairro CEINF: ${dependente.ceinfBairro || '-'}`,
        `Programa Saúde Pastoral Criança: ${dependente.programaSaudePastoralCrianca || '-'}`,
        `Local do Programa: ${dependente.programaSaudePastoralCriancaLocal || '-'}`,
        `Status: ${dependente.ativo ? 'Ativo' : 'Inativo'}`
      ];
      info.forEach(t => { if (posicaoY > documento.internal.pageSize.height - 30) { documento.addPage(); posicaoY = margem; } documento.text(t, margem + 5, posicaoY); posicaoY += 5; });
      posicaoY += 5;
    });
    return posicaoY;
  }

  private gerarSecaoObservacoes(documento: jsPDF, pessoa: PessoaIdosa, margem: number, posicaoY: number): number {
    if (posicaoY > documento.internal.pageSize.height - 40) { documento.addPage(); posicaoY = margem; } else { posicaoY += 5; }
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito); documento.text(ROTULOS_PDF.observacoesHistorico, margem, posicaoY); posicaoY += 8;
    documento.setFontSize(TEMA_PDF.fontes.tamanhoLegenda); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    if (pessoa.observacao) { documento.text(ROTULOS_PDF.observacoes, margem, posicaoY); posicaoY += 6; documento.text(pessoa.observacao, margem + 5, posicaoY); posicaoY += 8; }
    if (pessoa.historicoFamiliarSocial) { documento.text(ROTULOS_PDF.historicoFamiliarSocial, margem, posicaoY); posicaoY += 6; documento.text(pessoa.historicoFamiliarSocial, margem + 5, posicaoY); }
    return posicaoY;
  }

  private async gerarSecaoAnexos(documento: jsPDF, anexos: Anexo[], margem: number): Promise<void> {
    if (!anexos || anexos.length === 0) return;
    documento.addPage();
    for (let i = 0; i < anexos.length; i++) {
      const anexo = anexos[i];
      this.renderizarCabecalhoAnexo(documento, anexo, margem);
      await this.renderizarConteudoAnexo(documento, anexo, margem);
      if (i < anexos.length - 1) documento.addPage();
    }
  }

  private renderizarCabecalhoAnexo(documento: jsPDF, anexo: Anexo, margem: number): void {
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito); documento.text(ROTULOS_PDF.anexo, margem, margem);
    documento.setFontSize(11); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    const nome = anexo?.nomeArquivo || this.extrairNomeArquivo(anexo?.path) || 'arquivo';
    const label = this.obterRotuloCategoriaAnexo(anexo?.categoria);
    documento.text(`${label} - ${nome}`, margem, margem + 8);
  }

  private async renderizarConteudoAnexo(documento: jsPDF, anexo: Anexo, margem: number): Promise<void> {
    const pageWidth = documento.internal.pageSize.width;
    const pageHeight = documento.internal.pageSize.height;
    const maxWidth = pageWidth - margem * 2;
    const maxHeight = pageHeight - margem * 2 - 14;
    const tipo = this.inferirTipoArquivo(anexo?.nomeArquivo, anexo?.path);
    if (tipo === 'image' && anexo?.url) {
      try {
        const dataUrl = await this.carregarImagemComoBase64(anexo.url);
        const size = await this.obterDimensoesImagem(dataUrl);
        const fit = this.ajustarTamanhoDentroDoLimite(size.width, size.height, maxWidth, maxHeight);
        const x = margem + (maxWidth - fit.largura) / 2;
        const y = margem + 14 + (maxHeight - fit.altura) / 2;
        documento.addImage(dataUrl, 'PNG', x, y, fit.largura, fit.altura);
        return;
      } catch {}
    }
    this.renderizarFallbackAnexo(documento, anexo, margem, margem + 16, maxWidth);
  }

  private renderizarFallbackAnexo(documento: jsPDF, anexo: Anexo, x: number, y: number, width: number) {
    const altura = 22;
    documento.setDrawColor(TEMA_PDF.cores.bordaSuave); documento.setFillColor(...TEMA_PDF.cores.zebra);
    documento.rect(x, y, width, altura, 'FD');
    documento.setFontSize(TEMA_PDF.fontes.tamanhoLegenda); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    const nome = anexo?.nomeArquivo || this.extrairNomeArquivo(anexo?.path) || 'arquivo';
    const texto = anexo?.url ? `${nome} (clique para abrir)` : `${nome} (indisponível)`;
    documento.text(texto, x + 6, y + 13);
    if (anexo?.url) {
      try { const textWidth = Math.max(documento.getTextWidth(texto), 60); documento.link(x + 6, y + 5, textWidth, 14, { url: anexo.url }); } catch {}
    }
  }

  private inferirTipoArquivo(nomeArquivo?: string, caminho?: string): 'image' | 'pdf' | 'other' {
    const origem = (nomeArquivo || caminho || '').toLowerCase();
    if (!origem) return 'other';
    if (origem.endsWith('.jpg') || origem.endsWith('.jpeg') || origem.endsWith('.png') || origem.endsWith('.webp')) {
      return 'image';
    }
    if (origem.endsWith('.pdf')) return 'pdf';
    return 'other';
  }

  private obterRotuloCategoriaAnexo(categoria?: number): string {
    if (typeof categoria !== 'number') return ROTULOS_PDF.documento;
    const encontrada = CATEGORIAS_ANEXO.find(c => c.categoria === categoria);
    return encontrada?.label || ROTULOS_PDF.documento;
  }

  private extrairNomeArquivo(path?: string): string | undefined {
    if (!path) return undefined;
    const parts = path.split('/');
    return parts[parts.length - 1] || undefined;
  }

  private async carregarImagemComoBase64(url: string): Promise<string> {
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const blob = await resp.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (_e) {
      return await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const result = canvas.toDataURL('image/png');
            resolve(result);
          } catch (err) { reject(err); }
        };
        img.onerror = reject;
        const withAlt = url.includes('alt=media') ? url : (url.includes('?') ? `${url}&alt=media` : `${url}?alt=media`);
        img.src = withAlt;
      });
    }
  }

  private async obterDimensoesImagem(dataUrl: string): Promise<{ width: number; height: number; }> {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  private ajustarTamanhoDentroDoLimite(larguraOriginal: number, alturaOriginal: number, maxW: number, maxH: number): { largura: number; altura: number; } {
    const ratio = Math.min(maxW / larguraOriginal, maxH / alturaOriginal);
    const largura = Math.max(10, Math.floor(larguraOriginal * ratio));
    const altura = Math.max(10, Math.floor(alturaOriginal * ratio));
    return { largura, altura };
  }

  private gerarCabecalhoRelatorio(documento: jsPDF, logoBase64: string, margem: number, tamanhoLogo: number, alturaCabecalho: number): void {
    documento.addImage(logoBase64, 'PNG', margem, margem, tamanhoLogo, tamanhoLogo);
    documento.setFontSize(TEMA_PDF.fontes.tamanhoSubtitulo); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito);
    documento.text(ROTULOS_PDF.instituicao, margem + tamanhoLogo + 10, margem + 12);
    documento.setFontSize(TEMA_PDF.fontes.tamanhoTexto); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    documento.text(`Data: ${new Date().toLocaleDateString('pt-BR')} - ${ROTULOS_PDF.localData}`, margem + tamanhoLogo + 10, margem + 22);
    documento.line(margem, margem + alturaCabecalho, documento.internal.pageSize.width - margem, margem + alturaCabecalho);
    documento.setFontSize(TEMA_PDF.fontes.tamanhoTitulo); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNegrito);
    documento.text(ROTULOS_PDF.relatorioPessoas, documento.internal.pageSize.width / 2, margem + alturaCabecalho + 10, { align: 'center' });
  }

  private gerarInformacoesFiltros(documento: jsPDF, filtros: { nome?: string; cpf?: string; estadoCivil?: string; ativo?: boolean; }, margem: number, alturaCabecalho: number): void {
    documento.setFontSize(TEMA_PDF.fontes.tamanhoLegenda); documento.setFont(TEMA_PDF.fontes.familia, TEMA_PDF.fontes.pesoNormal);
    let y = margem + alturaCabecalho + 20;
    const partes: string[] = [];
    if (filtros.nome) partes.push(`Nome: ${filtros.nome}`);
    if (filtros.cpf) partes.push(`CPF: ${filtros.cpf}`);
    if (filtros.estadoCivil) partes.push(`Estado Civil: ${filtros.estadoCivil}`);
    if (typeof filtros.ativo === 'boolean') partes.push(`Status: ${filtros.ativo ? ROTULOS_PDF.statusAtivo : ROTULOS_PDF.statusInativo}`);
    if (partes.length > 0) { documento.text(`${ROTULOS_PDF.filtrosAplicados} ` + partes.join(', '), margem, y); y += 8; }
  }

  private gerarTabelaLista(documento: jsPDF, autoTable: any, pessoas: PessoaIdosa[], margem: number, alturaCabecalho: number): void {
    const posY = margem + alturaCabecalho + 30;
    const head = ['Nome', 'Data Nasc.', 'Estado Civil', 'CPF', 'RG', 'CEP', 'Status'];
    const body = pessoas.map(p => [
      p.nome,
      new Date(p.dataNascimento).toLocaleDateString('pt-BR'),
      p.estadoCivil || '-',
      p.cpf || '-',
      p.rg || '-',
      p.endereco?.cep || '-',
      p.ativo ? 'Ativo' : 'Inativo'
    ]);
    try {
      autoTable.default(documento, {
        head: [head],
        body,
        startY: posY,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: TEMA_PDF.cores.cabecalhoTabela as any, textColor: TEMA_PDF.cores.textoCabecalhoTabela, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: TEMA_PDF.cores.zebra as any },
        margin: { left: margem, right: margem }
      });
    } catch {
      this.desenharTabelaManual(documento, head, body as any, posY, margem);
    }
  }

  private desenharTabelaManual(documento: jsPDF, cabecalhos: string[], linhas: string[][], posicaoInicialY: number, margem: number): void {
    const larguraColuna = TEMA_PDF.tabela.larguraColunaManual; const alturaLinha = TEMA_PDF.tabela.alturaLinhaManual;
    documento.setFillColor(...TEMA_PDF.cores.cabecalhoTabela); documento.setTextColor(255, 255, 255); documento.setFontSize(9);
    cabecalhos.forEach((cabecalho, indice) => { const x = margem + (indice * larguraColuna); documento.rect(x, posicaoInicialY, larguraColuna, alturaLinha, 'F'); documento.text(cabecalho, x + TEMA_PDF.tabela.paddingCelulaManualX, posicaoInicialY + TEMA_PDF.tabela.paddingCelulaManualY); });
    documento.setTextColor(0, 0, 0);
    linhas.forEach((linha, i) => { const y = posicaoInicialY + alturaLinha + (i * alturaLinha); linha.forEach((celula, j) => { const x = margem + (j * larguraColuna); documento.rect(x, y, larguraColuna, alturaLinha, 'S'); documento.text(celula || '-', x + TEMA_PDF.tabela.paddingCelulaManualX, y + TEMA_PDF.tabela.paddingCelulaManualY); }); });
  }
}