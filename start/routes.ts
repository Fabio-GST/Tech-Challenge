/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Rotas REST da API da oficina. As URLs seguem a convenção em inglês; o código
| de domínio por trás é escrito na Linguagem Ubíqua em português.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import { middleware } from '#start/kernel'
import swagger from '#config/swagger'

const AutenticacaoController = () =>
  import('#modulos/autenticacao/infraestrutura/http/controllers/autenticacao_controller')
const ClientesController = () =>
  import('#modulos/clientes/infraestrutura/http/controllers/clientes_controller')
const VeiculosController = () =>
  import('#modulos/veiculos/infraestrutura/http/controllers/veiculos_controller')
const ServicosController = () =>
  import('#modulos/servicos/infraestrutura/http/controllers/servicos_controller')
const PecasController = () =>
  import('#modulos/estoque/infraestrutura/http/controllers/pecas_controller')
const OrdensServicoController = () =>
  import('#modulos/ordens-servico/infraestrutura/http/controllers/ordens_servico_controller')
const PagamentosController = () =>
  import('#modulos/pagamento/infraestrutura/http/controllers/pagamentos_controller')

router.get('/', async () => ({ servico: 'API Oficina Mecânica', documentacao: '/docs' }))
router.get('/health', async () => ({ status: 'ok' }))

/*
| Documentação OpenAPI / Swagger UI
*/
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

/*
| Rotas públicas
*/
router.post('/auth/login', [AutenticacaoController, 'login'])
router.get('/work-orders/:id/tracking', [OrdensServicoController, 'andamento'])

/*
| Rotas administrativas protegidas por JWT
*/
router
  .group(() => {
    router.get('/me', [AutenticacaoController, 'me'])
    router.post('/auth/register', [AutenticacaoController, 'register'])

    // Clientes
    router.get('/customers', [ClientesController, 'index'])
    router.post('/customers', [ClientesController, 'store'])
    router.get('/customers/by-document/:documento', [ClientesController, 'porDocumento'])
    router.get('/customers/:id', [ClientesController, 'show'])
    router.put('/customers/:id', [ClientesController, 'update'])
    router.delete('/customers/:id', [ClientesController, 'destroy'])

    // Veículos
    router.get('/vehicles', [VeiculosController, 'index'])
    router.post('/vehicles', [VeiculosController, 'store'])
    router.get('/vehicles/by-plate/:placa', [VeiculosController, 'porPlaca'])
    router.get('/vehicles/:id', [VeiculosController, 'show'])
    router.put('/vehicles/:id', [VeiculosController, 'update'])
    router.patch('/vehicles/:id/owner', [VeiculosController, 'vincularCliente'])
    router.delete('/vehicles/:id', [VeiculosController, 'destroy'])

    // Serviços
    router.get('/services', [ServicosController, 'index'])
    router.post('/services', [ServicosController, 'store'])
    router.get('/services/:id', [ServicosController, 'show'])
    router.put('/services/:id', [ServicosController, 'update'])
    router.patch('/services/:id/deactivate', [ServicosController, 'inativar'])
    router.patch('/services/:id/activate', [ServicosController, 'reativar'])
    router.patch('/services/:id/estimated-time', [ServicosController, 'definirTempoEstimado'])
    router.delete('/services/:id', [ServicosController, 'destroy'])

    // Peças / Estoque
    router.get('/parts', [PecasController, 'index'])
    router.post('/parts', [PecasController, 'store'])
    router.get('/parts/:id', [PecasController, 'show'])
    router.put('/parts/:id', [PecasController, 'update'])
    router.patch('/parts/:id/stock', [PecasController, 'ajustarEstoque'])
    router.patch('/parts/:id/minimum-stock', [PecasController, 'definirEstoqueMinimo'])
    router.post('/parts/:id/reservations', [PecasController, 'reservar'])
    router.post('/parts/:id/usage', [PecasController, 'utilizar'])
    router.post('/parts/:id/purchase-orders', [PecasController, 'solicitarCompra'])
    router.post('/purchase-orders/:id/receive', [PecasController, 'receberCompra'])
    router.delete('/parts/:id', [PecasController, 'destroy'])

    // Ordens de Serviço
    router.get('/work-orders', [OrdensServicoController, 'index'])
    router.post('/work-orders', [OrdensServicoController, 'store'])
    router.get('/work-orders/:id', [OrdensServicoController, 'show'])
    router.post('/work-orders/:id/services', [OrdensServicoController, 'adicionarServico'])
    router.post('/work-orders/:id/parts', [OrdensServicoController, 'adicionarPeca'])
    router.patch('/work-orders/:id/status', [OrdensServicoController, 'alterarStatus'])
    router.post('/work-orders/:id/diagnosis', [OrdensServicoController, 'iniciarDiagnostico'])
    router.post('/work-orders/:id/quote', [OrdensServicoController, 'gerarOrcamento'])
    router.post('/work-orders/:id/approval', [OrdensServicoController, 'aprovar'])
    router.post('/work-orders/:id/refusal', [OrdensServicoController, 'recusar'])
    router.post('/work-orders/:id/renegotiation', [OrdensServicoController, 'renegociar'])
    router.post('/work-orders/:id/completion', [OrdensServicoController, 'finalizar'])
    router.post('/work-orders/:id/delivery', [OrdensServicoController, 'entregar'])

    // Pagamentos
    router.post('/work-orders/:id/charge', [PagamentosController, 'gerarCobranca'])
    router.get('/payments/:id', [PagamentosController, 'show'])
    router.post('/payments/:id/discount', [PagamentosController, 'aplicarDesconto'])
    router.post('/payments/:id/payment', [PagamentosController, 'registrarPagamento'])
    router.post('/payments/:id/invoice', [PagamentosController, 'emitirNotaFiscal'])

    // Métricas
    router.get('/metrics/average-execution-time', [OrdensServicoController, 'tempoMedioExecucao'])
  })
  .use(middleware.auth())
