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

import { barramentoDeEventos } from '#shared/frameworks-drivers/eventos/barramento-de-eventos'
import { servicoDeNotificacao } from '#shared/frameworks-drivers/notificacao/fabrica'
import { fabricaOrdensServico } from '#modulos/ordens-servico/infraestrutura/fabrica'
import { fabricaClientes } from '#modulos/clientes/infraestrutura/fabrica'
import { fabricaEstoque } from '#modulos/estoque/infraestrutura/fabrica'
import { fabricaPagamento } from '#modulos/pagamento/infraestrutura/fabrica'
import { UtilizarPecasAoAprovar } from '#politicas/utilizar-pecas-ao-aprovar'
import { LiberarReservaAoRecusar } from '#politicas/liberar-reserva-ao-recusar'
import { GerarCobrancaAoFinalizar } from '#politicas/gerar-cobranca-ao-finalizar'
import { EmitirNotaAoConfirmarPagamento } from '#politicas/emitir-nota-ao-confirmar-pagamento'
import { SolicitarCompraAoAtingirMinimo } from '#politicas/solicitar-compra-ao-atingir-minimo'
import { NotificarClienteSobreOS } from '#politicas/notificar-cliente-sobre-os'

const detalharOrdem = (id: string) => fabricaOrdensServico.detalhar().executar(id)

/** Resolve o destinatário das notificações (cliente da OS), tolerante a falhas. */
const destinatarioDaOrdem = async (ordemId: string) => {
  try {
    const ordem = await detalharOrdem(ordemId)
    const cliente = await fabricaClientes.obter().executar(ordem.clienteId)
    return { nome: cliente.nome, email: cliente.email }
  } catch {
    return null
  }
}

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
    servicoDeNotificacao,
    destinatarioDaOrdem
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

// Avisos ao cliente a cada atualização de status da OS (requisito Fase 2:
// atualização de status via e-mail — canal definido por NOTIFICACAO_DRIVER).
const AVISOS_DE_STATUS: [string, string][] = [
  ['ordem-servico.aberta', 'Recebemos seu veículo e sua Ordem de Serviço foi aberta.'],
  ['ordem-servico.diagnostico-iniciado', 'O diagnóstico do seu veículo foi iniciado.'],
  ['ordem-servico.orcamento-gerado', 'Seu orçamento está pronto e aguarda sua aprovação.'],
  ['ordem-servico.aprovada', 'Seu orçamento foi aprovado e o serviço será iniciado.'],
  ['ordem-servico.recusada', 'Registramos a recusa do orçamento. A OS foi encerrada.'],
  ['ordem-servico.veiculo-entregue', 'Seu veículo foi entregue. Obrigado pela preferência!'],
]
for (const [evento, mensagem] of AVISOS_DE_STATUS) {
  barramentoDeEventos.registrar(
    new NotificarClienteSobreOS(evento, mensagem, servicoDeNotificacao, destinatarioDaOrdem)
  )
}
