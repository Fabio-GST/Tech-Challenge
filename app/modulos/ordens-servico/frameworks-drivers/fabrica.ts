import { UnidadeDeTrabalhoLucid } from '#shared/frameworks-drivers/unidade-de-trabalho'
import { fabricaClientes } from '#modulos/clientes/frameworks-drivers/fabrica'
import { fabricaVeiculos } from '#modulos/veiculos/frameworks-drivers/fabrica'
import { fabricaServicos } from '#modulos/servicos/frameworks-drivers/fabrica'
import { fabricaEstoque } from '#modulos/estoque/frameworks-drivers/fabrica'
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

const ordens = new RepositorioDeOrdensServicoLucid()
const unidadeDeTrabalho = new UnidadeDeTrabalhoLucid()

export const fabricaOrdensServico = {
  criar: () =>
    new CriarOrdemServico(
      ordens,
      fabricaClientes.repositorio(),
      fabricaVeiculos.repositorio(),
      fabricaServicos.repositorio(),
      fabricaEstoque.repositorio(),
      unidadeDeTrabalho
    ),
  adicionarServico: () => new AdicionarServicoNaOrdem(ordens, fabricaServicos.repositorio()),
  adicionarPeca: () =>
    new AdicionarPecaNaOrdem(ordens, fabricaEstoque.repositorio(), unidadeDeTrabalho),
  alterarStatus: () => new AlterarStatusDaOrdem(ordens),
  aprovar: () => new AprovarOrdemServico(ordens),
  processarDecisaoOrcamento: () => new ProcessarDecisaoOrcamento(ordens),
  iniciarDiagnostico: () => new IniciarDiagnostico(ordens),
  gerarOrcamento: () => new GerarOrcamento(ordens),
  recusar: () => new RecusarOrdemServico(ordens),
  renegociar: () => new RenegociarOrdemServico(ordens),
  finalizar: () => new FinalizarOrdemServico(ordens),
  entregar: () => new EntregarVeiculo(ordens),
  detalhar: () => new DetalharOrdem(ordens),
  listar: () => new ListarOrdens(ordens),
  consultarAndamento: () => new ConsultarAndamento(ordens),
  tempoMedioExecucao: () => new CalcularTempoMedioExecucao(ordens),
}
