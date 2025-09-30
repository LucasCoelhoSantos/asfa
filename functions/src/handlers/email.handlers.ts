import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { ServicoEmail } from '../services/email.service';
import { 
  EmailNotificationType, 
  Collection,
  PessoaIdosaData,
  UsuarioData 
} from '../types';

const db = getFirestore();
const servicoEmail = new ServicoEmail();

// ========== Triggers para Pessoas Idosas ==========

/**
 * Trigger disparado quando uma nova pessoa idosa é cadastrada
 */
export const onPessoaIdosaCreatedEmail = onDocumentCreated(
  `${Collection.PESSOAS_IDOSAS}/{pessoaId}`,
  async (event) => {
    try {
      const dadosPessoa = event.data?.data() as PessoaIdosaData;
      
      if (!dadosPessoa) {
        console.error('Dados da pessoa idosa não encontrados');
        return;
      }

      // Buscar email do usuário responsável pelo cadastro
      const usuarioResponsavel = await buscarUsuarioPorUid(dadosPessoa.createdBy);
      
      if (!usuarioResponsavel?.email) {
        console.log('Usuário responsável não encontrado ou sem email');
        return;
      }

      // Preparar dados para o template
      const dadosTemplate = {
        nomePessoa: dadosPessoa.nome || 'Não informado',
        dataNascimento: dadosPessoa.dataNascimento ? 
          new Date(dadosPessoa.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado',
        usuarioResponsavel: usuarioResponsavel.nome || usuarioResponsavel.email,
        dataCadastro: new Date().toLocaleDateString('pt-BR')
      };

      // Enviar email de notificação
      await servicoEmail.enviarEmail(
        EmailNotificationType.NOVO_CADASTRO_PESSOA_IDOSA,
        usuarioResponsavel.email,
        dadosTemplate
      );

      console.log(`Email de novo cadastro enviado para ${usuarioResponsavel.email}`);
      
    } catch (error) {
      console.error('Erro ao enviar email de novo cadastro:', error);
    }
  }
);

/**
 * Trigger disparado quando dados importantes de uma pessoa idosa são atualizados
 */
export const onPessoaIdosaUpdatedEmail = onDocumentUpdated(
  `${Collection.PESSOAS_IDOSAS}/{pessoaId}`,
  async (event) => {
    try {
      const dadosAntes = event.data?.before.data() as PessoaIdosaData;
      const dadosDepois = event.data?.after.data() as PessoaIdosaData;
      
      if (!dadosAntes || !dadosDepois) {
        console.error('Dados da pessoa idosa não encontrados');
        return;
      }

      // Verificar se campos importantes foram alterados
      const camposImportantes = ['nome', 'dataNascimento', 'cpf', 'telefone', 'email', 'endereco'];
      const camposAlterados = verificarCamposAlterados(dadosAntes, dadosDepois, camposImportantes);
      
      if (camposAlterados.length === 0) {
        console.log('Nenhum campo importante foi alterado');
        return;
      }

      // Buscar email do usuário responsável pela atualização
      const usuarioResponsavel = await buscarUsuarioPorUid(dadosDepois.updatedBy);
      
      if (!usuarioResponsavel?.email) {
        console.log('Usuário responsável não encontrado ou sem email');
        return;
      }

      // Preparar dados para o template
      const dadosTemplate = {
        nomePessoa: dadosDepois.nome || 'Não informado',
        camposAlterados: camposAlterados.join(', '),
        usuarioResponsavel: usuarioResponsavel.nome || usuarioResponsavel.email,
        dataAtualizacao: new Date().toLocaleDateString('pt-BR')
      };

      // Enviar email de notificação
      await servicoEmail.enviarEmail(
        EmailNotificationType.ATUALIZACAO_DADOS_IMPORTANTES,
        usuarioResponsavel.email,
        dadosTemplate
      );

      console.log(`Email de atualização enviado para ${usuarioResponsavel.email}`);
      
    } catch (error) {
      console.error('Erro ao enviar email de atualização:', error);
    }
  }
);

// ========== Triggers para Backup ==========

/**
 * Trigger disparado quando um backup é criado com sucesso
 */
export const onBackupCreatedEmail = onDocumentCreated(
  `${Collection.BACKUPS}/{backupId}`,
  async (event) => {
    try {
      const dadosBackup = event.data?.data();
      
      if (!dadosBackup) {
        console.error('Dados do backup não encontrados');
        return;
      }

      // Verificar se o backup foi bem-sucedido
      if (dadosBackup.status !== 'success') {
        console.log('Backup não foi bem-sucedido, não enviando email');
        return;
      }

      // Buscar emails dos administradores
      const administradores = await buscarAdministradores();
      
      if (administradores.length === 0) {
        console.log('Nenhum administrador encontrado');
        return;
      }

      // Preparar dados para o template
      const dadosTemplate = {
        dataBackup: new Date(dadosBackup.createdAt).toLocaleDateString('pt-BR'),
        tamanhoBackup: dadosBackup.size || 'Não informado',
        colecoesIncluidas: dadosBackup.collections?.join(', ') || 'Todas'
      };

      // Enviar email para todos os administradores
      const emails = administradores.map(admin => admin.email).filter((email): email is string => Boolean(email));
      
      if (emails.length > 0) {
        await servicoEmail.enviarEmailsEmLote(
          EmailNotificationType.BACKUP_REALIZADO_SUCESSO,
          emails,
          dadosTemplate
        );

        console.log(`Email de backup enviado para ${emails.length} administradores`);
      }
      
    } catch (error) {
      console.error('Erro ao enviar email de backup:', error);
    }
  }
);

// ========== Triggers para Usuários ==========

/**
 * Trigger disparado quando um novo usuário é criado
 */
export const onUsuarioCreatedEmail = onDocumentCreated(
  `${Collection.USUARIOS}/{usuarioId}`,
  async (event) => {
    try {
      const dadosUsuario = event.data?.data() as UsuarioData;
      
      if (!dadosUsuario || !dadosUsuario.email) {
        console.error('Dados do usuário não encontrados ou sem email');
        return;
      }

      // Preparar dados para o template
      const dadosTemplate = {
        nomeUsuario: dadosUsuario.nome || dadosUsuario.email,
        emailUsuario: dadosUsuario.email,
        dataConfirmacao: new Date().toLocaleDateString('pt-BR')
      };

      // Enviar email de confirmação
      await servicoEmail.enviarEmail(
        EmailNotificationType.CONFIRMACAO_CADASTRO,
        dadosUsuario.email,
        dadosTemplate
      );

      console.log(`Email de confirmação enviado para ${dadosUsuario.email}`);
      
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error);
    }
  }
);

// ========== Funções Auxiliares ==========

/**
 * Busca usuário por UID
 */
async function buscarUsuarioPorUid(uid: string | undefined): Promise<UsuarioData | null> {
  if (!uid) return null;
  
  try {
    const doc = await db.collection(Collection.USUARIOS).doc(uid).get();
    return doc.exists ? doc.data() as UsuarioData : null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

/**
 * Busca todos os administradores
 */
async function buscarAdministradores(): Promise<UsuarioData[]> {
  try {
    const snapshot = await db.collection(Collection.USUARIOS)
      .where('role', '==', 'admin')
      .where('ativo', '==', true)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as UsuarioData);
  } catch (error) {
    console.error('Erro ao buscar administradores:', error);
    return [];
  }
}

/**
 * Verifica quais campos foram alterados
 */
function verificarCamposAlterados(
  dadosAntes: any,
  dadosDepois: any,
  camposImportantes: string[]
): string[] {
  const camposAlterados: string[] = [];
  
  camposImportantes.forEach(campo => {
    if (JSON.stringify(dadosAntes[campo]) !== JSON.stringify(dadosDepois[campo])) {
      camposAlterados.push(campo);
    }
  });
  
  return camposAlterados;
}

/**
 * Trigger para verificar aniversários (executa diariamente às 8h)
 */
export const verificarAniversarios = onSchedule(
  { schedule: '0 8 * * *', timeZone: 'America/Sao_Paulo' }, // Todo dia às 8h
  async () => {
    try {
      console.log('Iniciando verificação de aniversários...');
      
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const diaAtual = hoje.getDate();
      
      // Buscar pessoas idosas com aniversário hoje
      const snapshot = await db.collection(Collection.PESSOAS_IDOSAS)
        .where('ativo', '==', true)
        .get();
      
      const pessoasComAniversario: any[] = [];
      
      snapshot.docs.forEach(doc => {
        const dados = doc.data();
        if (dados.dataNascimento && dados.email) {
          const dataNascimento = new Date(dados.dataNascimento);
          const mesNascimento = dataNascimento.getMonth() + 1;
          const diaNascimento = dataNascimento.getDate();
          
          if (mesNascimento === mesAtual && diaNascimento === diaAtual) {
            const idade = hoje.getFullYear() - dataNascimento.getFullYear();
            pessoasComAniversario.push({
              id: doc.id,
              nome: dados.nome,
              email: dados.email,
              idade
            });
          }
        }
      });
      
      console.log(`Encontradas ${pessoasComAniversario.length} pessoas com aniversário hoje`);
      
      // Enviar emails de parabéns
      for (const pessoa of pessoasComAniversario) {
        const dadosTemplate = {
          nomePessoa: pessoa.nome,
          idade: pessoa.idade
        };
        
        await servicoEmail.enviarEmail(
          EmailNotificationType.PARABENS_ANIVERSARIO,
          pessoa.email,
          dadosTemplate
        );
        
        console.log(`Email de parabéns enviado para ${pessoa.nome} (${pessoa.email})`);
      }
      
      console.log('Verificação de aniversários concluída');
      
    } catch (error) {
      console.error('Erro na verificação de aniversários:', error);
    }
  }
);
