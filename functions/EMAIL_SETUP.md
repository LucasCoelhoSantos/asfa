# Configuração de Email - Sistema ASFA

## 📧 Configuração Necessária

Para que o sistema de notificações por email funcione, você precisa configurar as variáveis de ambiente nas Firebase Functions.

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no Firebase Console ou no arquivo `.env`:

```bash
# Configurações de Email
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-aplicativo
```

### 2. Configuração para Gmail

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de aplicativo**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Mail" e "Outro (nome personalizado)"
   - Digite "ASFA Sistema"
   - Use a senha gerada como `EMAIL_PASS`

### 3. Configuração para Outros Provedores

Para outros provedores de email, ajuste as configurações no arquivo `email.service.ts`:

```typescript
const config: EmailConfig = {
  host: 'smtp.exemplo.com',    // Seu servidor SMTP
  port: 587,                   // Porta (587 para TLS, 465 para SSL)
  secure: false,               // true para SSL, false para TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};
```

### 4. Provedores Recomendados

- **Gmail**: Gratuito, fácil configuração
- **SendGrid**: Profissional, 100 emails/dia grátis
- **Mailgun**: Robusto, 5.000 emails/mês grátis
- **Amazon SES**: Escalável, pay-per-use

## 🚀 Deploy das Functions

Após configurar as variáveis de ambiente:

```bash
cd functions
npm run build
firebase deploy --only functions
```

## 📋 Tipos de Notificações Implementadas

### Notificações Administrativas
- ✅ Novo cadastro de pessoa idosa
- ✅ Atualização de dados importantes
- ✅ Backup realizado com sucesso

### Notificações de Usuário
- ✅ Confirmação de cadastro
- ✅ Reset de senha
- ✅ Lembretes de atualização de dados

### Notificações de Sistema
- ✅ Erros críticos
- ✅ Quota de armazenamento atingida
- ✅ Falhas de backup

### Notificações de Aniversário
- ✅ Parabéns pelo aniversário (executa diariamente às 8h)

## 🔧 Monitoramento

Para monitorar o envio de emails:

1. **Logs das Functions**:
   ```bash
   firebase functions:log
   ```

2. **Coleção de Notificações**:
   - Acesse o Firestore
   - Coleção: `email_notifications`
   - Status: `pending`, `sent`, `failed`, `retry`

## 🛠️ Troubleshooting

### Erro: "Transporter não inicializado"
- Verifique se as variáveis `EMAIL_USER` e `EMAIL_PASS` estão configuradas
- Para Gmail, use senha de aplicativo, não a senha da conta

### Erro: "Authentication failed"
- Verifique as credenciais
- Para Gmail, certifique-se de que a verificação em duas etapas está ativa

### Emails não são enviados
- Verifique os logs das Functions
- Confirme se os triggers estão ativos
- Verifique se os usuários têm emails válidos cadastrados

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Nodemailer: https://nodemailer.com/
- Firebase Functions: https://firebase.google.com/docs/functions
