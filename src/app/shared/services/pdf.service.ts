import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PessoaIdosa } from '../../domains/pessoa-idosa/domain/entities/pessoa-idosa.entity';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  gerarPdfPessoaIdosa(pessoa: PessoaIdosa): void {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Pessoa Idosa', 14, 22);

    // Corpo
    autoTable(doc, {
      startY: 30,
      head: [['Campo', 'Informação']],
      body: [
        ['Nome', pessoa.nome],
        ['Data de Nascimento', new Date(pessoa.dataNascimento).toLocaleDateString('pt-BR')],
        ['CPF', pessoa.cpf], // O getter já retorna a string
        ['RG', pessoa.rg],
        ['Telefone', pessoa.telefone],
        ['Email', pessoa.email || 'Não informado'],
        ['Estado Civil', pessoa.estadoCivil],
        ['Naturalidade', pessoa.naturalidade],
        ['Endereço', `${pessoa.endereco.logradouro}, ${pessoa.endereco.numero} - ${pessoa.endereco.bairro}, ${pessoa.endereco.cidade}/${pessoa.endereco.estado}`],
        // Adicione outros campos que desejar no relatório
      ],
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Nome do arquivo
    const nomeArquivo = `relatorio-${pessoa.nome.toLowerCase().replace(/\s/g, '-')}.pdf`;
    doc.save(nomeArquivo);
  }
}