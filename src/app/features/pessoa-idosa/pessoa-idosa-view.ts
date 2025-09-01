import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PessoaIdosaService } from './pessoa-idosa.service';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { NotificationService } from '../../core/services/notification.service';
import { CpfPipe } from '../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../shared/pipes/telefone.pipe';
import { CepPipe } from '../../shared/pipes/cep.pipe';
import { RgPipe } from '../../shared/pipes/rg.pipe';

@Component({
  selector: 'app-pessoa-idosa-view',
  standalone: true,
  imports: [
    CommonModule, 
    MainMenuComponent, 
    CpfPipe, 
    TelefonePipe, 
    CepPipe, 
    RgPipe
  ],
  templateUrl: './pessoa-idosa-view.html'
})
export class PessoaIdosaViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pessoaIdosaService = inject(PessoaIdosaService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  pessoaIdosa$!: Observable<PessoaIdosa | undefined>;
  pessoaIdosa: PessoaIdosa | null = null;
  loading = true;
  error = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarPessoaIdosa(id);
    } else {
      this.notificationService.showError('ID da pessoa idosa não fornecido.');
      this.router.navigate(['/pessoa-idosa']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarPessoaIdosa(id: string) {
    this.loading = true;
    this.error = false;

    this.pessoaIdosa$ = this.pessoaIdosaService.getById(id);
    
    this.pessoaIdosa$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (pessoa) => {
        if (pessoa) {
          this.pessoaIdosa = pessoa;
        } else {
          this.error = true;
          this.notificationService.showError('Pessoa idosa não encontrada.');
        }
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.notificationService.showError('Erro ao carregar dados da pessoa idosa.');
      }
    });
  }

  editar() {
    if (this.pessoaIdosa) {
      this.router.navigate(['/pessoa-idosa', this.pessoaIdosa.id, 'editar']);
    }
  }

  voltar() {
    this.router.navigate(['/pessoa-idosa']);
  }

  exportarPdf() {
    if (!this.pessoaIdosa) return;

    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([{ default: jsPDF }, autoTable]) => {
      const doc = new jsPDF();
      this.gerarPdf(doc, autoTable, this.pessoaIdosa!);
      doc.save(`pessoa-idosa-${this.pessoaIdosa!.nome.replace(/\s+/g, '-')}.pdf`);
      this.notificationService.showSuccess('PDF gerado com sucesso!');
    }).catch(() => {
      this.notificationService.showError('Erro ao gerar PDF. Verifique se as dependências estão instaladas.');
    });
  }

  private gerarPdf(doc: any, autoTable: any, pessoa: PessoaIdosa): void {
    const margin = 20;
    let yPosition = margin;

    this.gerarCabecalho(doc, pessoa, margin, yPosition);
    yPosition += 40;

    yPosition = this.gerarSecaoInformacoesPessoais(doc, pessoa, margin, yPosition);
    yPosition += 10;

    yPosition = this.gerarSecaoEndereco(doc, pessoa.endereco, margin, yPosition);
    yPosition += 10;

    yPosition = this.gerarSecaoComposicaoFamiliar(doc, pessoa.composicaoFamiliar, margin, yPosition);
    yPosition += 10;

    if (pessoa.dependentes && pessoa.dependentes.length > 0) {
      yPosition = this.gerarSecaoDependentes(doc, pessoa.dependentes, margin, yPosition);
      yPosition += 10;
    }

    yPosition = this.gerarSecaoObservacoes(doc, pessoa, margin, yPosition);

    // TODO: Implementar seção de anexos
    // yPosition = this.gerarSecaoAnexos(doc, pessoa.anexos, margin, yPosition);
    
    this.gerarRodape(doc);
  }

  private gerarCabecalho(doc: any, pessoa: PessoaIdosa, margin: number, yPosition: number): void {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Ficha de Pessoa Idosa', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(14);
    doc.text(`Nome: ${pessoa.nome}`, margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Data de Cadastro: ${new Date(pessoa.dataCadastro).toLocaleDateString('pt-BR')}`, margin, yPosition);
    
    yPosition += 8;
    doc.text(`Status: ${pessoa.ativo ? 'Ativo' : 'Inativo'}`, margin, yPosition);
  }

  private gerarSecaoInformacoesPessoais(doc: any, pessoa: PessoaIdosa, margin: number, yPosition: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações Pessoais', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const infoPessoal = [
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

    infoPessoal.forEach(info => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });

    return yPosition;
  }

  private gerarSecaoEndereco(doc: any, endereco: any, margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Endereço', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const enderecoInfo = [
      `CEP: ${endereco?.cep || '-'}`,
      `Logradouro: ${endereco?.logradouro || '-'}`,
      `Número: ${endereco?.numero || '-'}`,
      `Bairro: ${endereco?.bairro || '-'}`,
      `Cidade: ${endereco?.cidade || '-'}`,
      `Estado: ${endereco?.estado || '-'}`,
      `Tipo de Moradia: ${endereco?.moradia || '-'}`
    ];

    enderecoInfo.forEach(info => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });

    return yPosition;
  }

  private gerarSecaoComposicaoFamiliar(doc: any, composicao: any, margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 60) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Composição Familiar', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const composicaoInfo = [
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

    composicaoInfo.forEach(info => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });

    return yPosition;
  }

  private gerarSecaoDependentes(doc: any, dependentes: any[], margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dependentes', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    dependentes.forEach((dependente, index) => {
      if (yPosition > doc.internal.pageSize.height - 50) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Dependente ${index + 1}: ${dependente.nome}`, margin, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const dependenteInfo = [
        `Data de Nascimento: ${new Date(dependente.dataNascimento).toLocaleDateString('pt-BR')}`,
        `Parentesco: ${dependente.parentesco || '-'}`,
        `CEINF: ${dependente.ceinf || '-'}`,
        `Bairro CEINF: ${dependente.ceinfBairro || '-'}`,
        `Programa Saúde Pastoral Criança: ${dependente.programaSaudePastoralCrianca || '-'}`,
        `Local do Programa: ${dependente.programaSaudePastoralCriancaLocal || '-'}`,
        `Status: ${dependente.ativo ? 'Ativo' : 'Inativo'}`
      ];

      dependenteInfo.forEach(info => {
        if (yPosition > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(info, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    });

    return yPosition;
  }

  private gerarSecaoObservacoes(doc: any, pessoa: PessoaIdosa, margin: number, yPosition: number): number {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações e Histórico', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (pessoa.observacao) {
      doc.text('Observações:', margin, yPosition);
      yPosition += 6;
      doc.text(pessoa.observacao, margin + 5, yPosition);
      yPosition += 8;
    }

    if (pessoa.historicoFamiliarSocial) {
      doc.text('Histórico Familiar e Social:', margin, yPosition);
      yPosition += 6;
      doc.text(pessoa.historicoFamiliarSocial, margin + 5, yPosition);
    }

    return yPosition;
  }

  private gerarRodape(doc: any): void {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`, 
      doc.internal.pageSize.width / 2, 
      pageHeight - 15, 
      { align: 'center' }
    );
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
