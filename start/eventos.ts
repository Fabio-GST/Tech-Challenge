/*
|--------------------------------------------------------------------------
| Registro de Manipuladores de Eventos de Domínio (Políticas)
|--------------------------------------------------------------------------
|
| Composition root das Políticas (POL): cada manipulador reage a um Evento de
| Domínio de um contexto e dispara um comando em outro — sem acoplamento
| síncrono entre os módulos. Os agregados registram eventos durante os casos de
| uso; a publicação acontece após o commit (ver `coletor-de-eventos.ts`).
|
| Mapa evento → política:
|   ordem-servico.aprovada       → utilizar peças reservadas + avisar cliente
|   ordem-servico.recusada       → liberar reservas de peças
|   ordem-servico.finalizada     → gerar cobrança + avisar cliente
|   ordem-servico.veiculo-entregue → avisar cliente
|   pagamento.confirmado         → emitir Nota Fiscal (assíncrono)
|   estoque.abaixo-do-minimo     → alertar almoxarife + solicitar compra
|
*/

import { barramentoDeEventos } from '#shared/infraestrutura/eventos/barramento-de-eventos'
import { servicoDeNotificacao } from '#shared/infraestrutura/notificacao/servico-de-notificacao-log'
import { fabricaOrdensServico } from '#modulos/ordens-servico/infraestrutura/fabrica'
import { fabricaEstoque } from '#modulos/estoque/infraestrutura/fabrica'
import { fabricaPagamento } from '#modulos/pagamento/infraestrutura/fabrica'
import { UtilizarPecasAoAprovar } from '#politicas/utilizar-pecas-ao-aprovar'
import { LiberarReservaAoRecusar } from '#politicas/liberar-reserva-ao-recusar'
import { GerarCobrancaAoFinalizar } from '#politicas/gerar-cobranca-ao-finalizar'
import { EmitirNotaAoConfirmarPagamento } from '#politicas/emitir-nota-ao-confirmar-pagamento'
import { SolicitarCompraAoAtingirMinimo } from '#politicas/solicitar-compra-ao-atingir-minimo'
import { NotificarClienteSobreOS } from '#politicas/notificar-cliente-sobre-os'

const detalharOrdem = (id: string) => fabricaOrdensServico.detalhar().executar(id)

// OS aprovada → consome as peças reservadas
barramentoDeEventos.registrar(
  new UtilizarPecasAoAprovar(detalharOrdem, (e) => fabricaEstoque.utilizar().executar(e))
)

// OS recusada → libera as reservas
barramentoDeEventos.registrar(
  new LiberarReservaAoRecusar(detalharOrdem, (e) => fabricaEstoque.liberarReserva().executar(e))
)

// OS finalizada → gera cobrança + avisa o cliente
barramentoDeEventos.registrar(
  new GerarCobrancaAoFinalizar(
    detalharOrdem,
    (e) => fabricaPagamento.gerarCobranca().executar(e),
    servicoDeNotificacao
  )
)

// Pagamento integral confirmado → emite Nota Fiscal (assíncrono)
barramentoDeEventos.registrar(
  new EmitirNotaAoConfirmarPagamento((id) => fabricaPagamento.emitirNotaFiscal().executar(id))
)

// Estoque abaixo do mínimo → alerta almoxarife + solicita compra
barramentoDeEventos.registrar(
  new SolicitarCompraAoAtingirMinimo(
    (e) => fabricaEstoque.solicitarCompra().executar(e),
    servicoDeNotificacao
  )
)

// Avisos ao cliente em marcos da OS
barramentoDeEventos.registrar(
  new NotificarClienteSobreOS(
    'ordem-servico.aprovada',
    'Seu orçamento foi aprovado e o serviço será iniciado.',
    servicoDeNotificacao
  )
)
barramentoDeEventos.registrar(
  new NotificarClienteSobreOS(
    'ordem-servico.veiculo-entregue',
    'Seu veículo foi entregue. Obrigado pela preferência!',
    servicoDeNotificacao
  )
)
