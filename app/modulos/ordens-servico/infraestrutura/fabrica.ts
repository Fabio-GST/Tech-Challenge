import { UnidadeDeTrabalho } from '#shared/infraestrutura/unidade-de-trabalho'
import { fabricaClientes } from '#modulos/clientes/infraestrutura/fabrica'
import { fabricaVeiculos } from '#modulos/veiculos/infraestrutura/fabrica'
import { fabricaServicos } from '#modulos/servicos/infraestrutura/fabrica'
import { fabricaEstoque } from '#modulos/estoque/infraestrutura/fabrica'
import { RepositorioDeOrdensServicoLucid } from './persistencia/repositorios/repositorio-de-ordens-servico-lucid.js'
import { CriarOrdemServico } from '../aplicacao/casos-de-uso/criar-ordem-servico.js'
import {
  AdicionarServicoNaOrdem,
  AdicionarPecaNaOrdem,
} from '../aplicacao/casos-de-uso/gerir-itens.js'
import {
  AlterarStatusDaOrdem,
  AprovarOrdemServico,
  IniciarDiagnostico,
  GerarOrcamento,
  RecusarOrdemServico,
  RenegociarOrdemServico,
  FinalizarOrdemServico,
  EntregarVeiculo,
} from '../aplicacao/casos-de-uso/gerir-status.js'
import {
  DetalharOrdem,
  ListarOrdens,
  ConsultarAndamento,
  CalcularTempoMedioExecucao,
} from '../aplicacao/casos-de-uso/consultas.js'

const ordens = new RepositorioDeOrdensServicoLucid()
const unidadeDeTrabalho = new UnidadeDeTrabalho()

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
