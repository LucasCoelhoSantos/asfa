# Componentes Compartilhados - ASFA

Este diretório contém todos os componentes reutilizáveis do sistema ASFA, organizados por categoria e funcionalidade.

## 📦 Componentes Disponíveis

### 🎯 Componentes Base
- **FormCardComponent** - Card de formulário com header personalizável
- **FormFieldComponent** - Campo de formulário com validação integrada
- **DataTableComponent** - Tabela de dados responsiva com ações

### 🎨 Componentes Bootstrap
- **BootstrapButtonComponent** - Botão Bootstrap com estados de loading
- **BootstrapFormFieldComponent** - Campo de formulário Bootstrap avançado
- **BootstrapModalComponent** - Modal Bootstrap nativo

### 🔍 Componentes de UI
- **FilterSectionComponent** - Seção de filtros padronizada
- **PaginationComponent** - Paginação inteligente
- **StatusBadgeComponent** - Badge de status configurável
- **LoadingComponent** - Indicador de carregamento
- **PageHeaderComponent** - Header de página padronizado

## 🚀 Como Usar

### 1. Importar os Componentes

```typescript
import { 
  FormCardComponent, 
  BootstrapFormFieldComponent,
  FilterSectionComponent,
  PaginationComponent 
} from '../../shared';
```

### 2. Exemplo de Formulário

```html
<app-form-card title="Dados Pessoais" icon="bi bi-person">
  <div class="row g-3">
    <div class="col-md-6">
      <app-bootstrap-form-field
        fieldId="nome"
        label="Nome Completo"
        type="text"
        [control]="form.controls['nome']"
        [required]="true">
      </app-bootstrap-form-field>
    </div>
  </div>
</app-form-card>
```

### 3. Exemplo de Lista com Filtros

```html
<!-- Header da página -->
<app-page-header
  title="Pessoas Idosas"
  description="Gerencie as pessoas idosas cadastradas"
  [showAddButton]="true"
  addButtonText="Adicionar Pessoa"
  (addClick)="navigate('/pessoa-idosa/novo')">
</app-page-header>

<!-- Seção de filtros -->
<app-filter-section
  title="Filtros de Pesquisa"
  sectionTitle="Informações Básicas"
  [fields]="filterFields"
  [pageSizeOptions]="[10, 25, 50, 100]"
  (filterChange)="onFilterChange($event)"
  (search)="buscar()"
  (clearFilters)="limparFiltros()"
  (export)="exportarPdf()">
</app-filter-section>

<!-- Tabela de dados -->
<app-data-table
  [columns]="tableColumns"
  [data]="pessoas"
  [actions]="tableActions"
  (actionClick)="onTableAction($event)">
</app-data-table>

<!-- Paginação -->
<app-pagination
  [currentPage]="pageIndex + 1"
  [pageSize]="pageSize"
  [total]="total"
  (pageChange)="setPageIndex($event - 1)">
</app-pagination>
```

### 4. Configuração dos Filtros

```typescript
filterFields: FilterField[] = [
  { id: 'nome', label: 'Nome', type: 'text', placeholder: 'Digite o nome' },
  { id: 'cpf', label: 'CPF', type: 'text', placeholder: '000.000.000-00' },
  { id: 'estadoCivil', label: 'Estado Civil', type: 'select', options: estadosCivis },
  { id: 'alfabetizado', label: 'Alfabetizado', type: 'checkbox' }
];
```

### 5. Configuração da Tabela

```typescript
tableColumns: TableColumn[] = [
  { key: 'nome', label: 'Nome', type: 'text' },
  { key: 'cpf', label: 'CPF', type: 'text' },
  { key: 'dataNascimento', label: 'Data Nasc.', type: 'date' },
  { key: 'ativo', label: 'Status', type: 'badge', badgeClass: 'bg-success' },
  { key: 'actions', label: 'Ações', type: 'actions', width: '150px' }
];

tableActions: TableAction[] = [
  { icon: 'bi bi-pencil', label: 'Editar', class: 'btn-outline-primary', action: 'edit' },
  { icon: 'bi bi-trash', label: 'Remover', class: 'btn-outline-danger', action: 'delete' }
];
```

### 6. Exemplo de Modal

```html
<app-bootstrap-modal
  modalId="confirmModal"
  title="Confirmar Exclusão"
  icon="bi bi-exclamation-triangle"
  confirmText="Excluir"
  cancelText="Cancelar"
  confirmButtonClass="btn-danger"
  [show]="showRemoveModal"
  (confirm)="remover()"
  (cancel)="cancelarRemover()">
  
  <p>Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.</p>
  
</app-bootstrap-modal>
```

### 7. Exemplo de Loading

```html
<!-- Loading inline -->
<app-loading 
  loadingText="Carregando dados..."
  subText="Aguarde um momento"
  variant="inline">
</app-loading>

<!-- Loading fullscreen -->
<app-loading 
  *ngIf="loading"
  loadingText="Processando..."
  variant="fullscreen">
</app-loading>
```

### 8. Exemplo de Status Badge

```html
<app-status-badge
  [value]="usuario.ativo"
  [statusConfigs]="statusConfigs"
  defaultClass="bg-primary">
</app-status-badge>
```

```typescript
statusConfigs: StatusConfig[] = [
  { value: true, label: 'Ativo', class: 'bg-success', icon: 'bi bi-check-circle' },
  { value: false, label: 'Inativo', class: 'bg-secondary', icon: 'bi bi-pause-circle' }
];
```

## 🎨 Personalização

Todos os componentes são altamente personalizáveis através de:

- **Inputs** - Propriedades configuráveis
- **Outputs** - Eventos para comunicação
- **Slots** - Conteúdo customizável (ng-content)
- **Classes CSS** - Estilos personalizáveis

## 🔧 Boas Práticas

1. **Reutilização** - Use os componentes existentes antes de criar novos
2. **Consistência** - Mantenha o padrão visual em toda a aplicação
3. **Responsividade** - Todos os componentes são responsivos por padrão
4. **Acessibilidade** - Componentes seguem padrões de acessibilidade
5. **Performance** - Componentes são otimizados para performance

## 📱 Responsividade

Os componentes são totalmente responsivos:
- **Desktop** - Layout completo
- **Tablet** - Ajuste automático das colunas
- **Mobile** - Layout empilhado otimizado

## 🎯 Benefícios

- ✅ **Desenvolvimento Rápido** - Componentes prontos para uso
- ✅ **Consistência Visual** - Padrão único em toda aplicação
- ✅ **Manutenibilidade** - Código centralizado e reutilizável
- ✅ **Performance** - Otimizações integradas
- ✅ **Acessibilidade** - Padrões web seguidos
- ✅ **Responsividade** - Funciona em todos os dispositivos
