import type { ApplicationService } from '@adonisjs/core/types'
import { UnidadeDeTrabalhoLucid } from '#shared/frameworks-drivers/unidade-de-trabalho'
import { RepositorioDeClientesLucid } from '#modulos/clientes/interface-adapters/gateways/repositorio-de-clientes-lucid'
import { RepositorioDeVeiculosLucid } from '#modulos/veiculos/interface-adapters/gateways/repositorio-de-veiculos-lucid'
import { RepositorioDeServicosLucid } from '#modulos/servicos/interface-adapters/gateways/repositorio-de-servicos-lucid'
import { RepositorioDePecasLucid } from '#modulos/estoque/interface-adapters/gateways/repositorio-de-pecas-lucid'
import { RepositorioDeOrdensServicoLucid } from '../interface-adapters/gateways/repositorio-de-ordens-servico-lucid.js'
import { CriarOrdemServico } from '../use-cases/criar-ordem-servico.js'
import { ProcessarDecisaoOrcamento } from '../use-cases/processar-decisao-orcamento.js'
import { AdicionarServicoNaOrdem, AdicionarPecaNaOrdem } from '../use-cases/gerir-itens.js'
import {
  AlterarStatusDaOrdem,
  AprovarOrdemServico,
  IniciarDiagnostico,
  GerarOrcamento,
  RecusarOrdemServico,
  RenegociarOrdemServico,
  FinalizarOrdemServico,
  EntregarVeiculo,
} from '../use-cases/gerir-status.js'
import {
  DetalharOrdem,
  ListarOrdens,
  ConsultarAndamento,
  CalcularTempoMedioExecucao,
} from '../use-cases/consultas.js'

/** Composition root do módulo: registra adaptadores e casos de uso no container. */
export function registrarOrdensServico(app: ApplicationService) {
  const c = app.container
  c.singleton(RepositorioDeOrdensServicoLucid, () => new RepositorioDeOrdensServicoLucid())

  c.bind(
    CriarOrdemServico,
    async (r) =>
      new CriarOrdemServico(
        await r.make(RepositorioDeOrdensServicoLucid),
        await r.make(RepositorioDeClientesLucid),
        await r.make(RepositorioDeVeiculosLucid),
        await r.make(RepositorioDeServicosLucid),
        await r.make(RepositorioDePecasLucid),
        await r.make(UnidadeDeTrabalhoLucid)
      )
  )
  c.bind(
    AdicionarServicoNaOrdem,
    async (r) =>
      new AdicionarServicoNaOrdem(
        await r.make(RepositorioDeOrdensServicoLucid),
        await r.make(RepositorioDeServicosLucid)
      )
  )
  c.bind(
    AdicionarPecaNaOrdem,
    async (r) =>
      new AdicionarPecaNaOrdem(
        await r.make(RepositorioDeOrdensServicoLucid),
        await r.make(RepositorioDePecasLucid),
        await r.make(UnidadeDeTrabalhoLucid)
      )
  )

  const simples = [
    AlterarStatusDaOrdem,
    AprovarOrdemServico,
    ProcessarDecisaoOrcamento,
    IniciarDiagnostico,
    GerarOrcamento,
    RecusarOrdemServico,
    RenegociarOrdemServico,
    FinalizarOrdemServico,
    EntregarVeiculo,
    DetalharOrdem,
    ListarOrdens,
    ConsultarAndamento,
    CalcularTempoMedioExecucao,
  ] as const
  for (const CasoDeUso of simples) {
    c.bind(CasoDeUso, async (r) => new CasoDeUso(await r.make(RepositorioDeOrdensServicoLucid)))
  }
}
