import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CursoService } from '../services/curso.service';
import { EscolaRequest, EscolaResponse, EscolaService } from '../services/escola.service';
import { InstituicaoEnsinoSuperior, InstituicaoService } from '../services/instituicao.service';
import { ProfessorService } from '../services/professor.service';

interface EscolaTabela {
  id: number;
  nome: string;
  coordenador: string;
  iesId: number | null;
  iesNome: string;
  ativo: boolean;
  status: string;
  totalCursos: number;
  totalProfessores: number;
}

@Component({
  selector: 'app-escolas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './escolas.component.html',
  styleUrls: ['./escolas.component.css']
})
export class EscolasComponent implements OnInit {
  carregando = false;
  salvando = false;
  mensagemErro = '';
  mensagemSucesso = '';
  editandoId: number | null = null;
  instituicoes: InstituicaoEnsinoSuperior[] = [];
  listaEscolas: EscolaTabela[] = [];
  formulario = {
    nome: '',
    coordenador: '',
    iesId: null as number | null,
    ativo: true
  };

  constructor(
    private escolaService: EscolaService,
    private instituicaoService: InstituicaoService,
    private cursoService: CursoService,
    private professorService: ProfessorService
  ) {}

  ngOnInit(): void {
    this.carregarEscolas();
  }

  get totalEscolasAtivas(): number {
    return this.listaEscolas.filter((escola) => escola.ativo).length;
  }

  carregarEscolas(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      escolas: this.escolaService.listarEscolas(),
      instituicoes: this.instituicaoService.listarInstituicoes(),
      cursos: this.cursoService.listarCursos(),
      professores: this.professorService.listarProfessores()
    }).subscribe({
      next: ({ escolas, instituicoes, cursos, professores }) => {
        const listaEscolas = Array.isArray(escolas) ? escolas : [];
        const listaInstituicoes = Array.isArray(instituicoes) ? instituicoes : [];
        const listaCursos = Array.isArray(cursos) ? cursos : [];
        const listaProfessores = Array.isArray(professores) ? professores : [];
        const cursosPorEscola = new Map<number, number>();
        const professoresPorEscola = new Map<number, number>();

        listaCursos.forEach((curso: any) => {
          const escolaId = curso?.escola?.id;
          if (escolaId == null) {
            return;
          }

          cursosPorEscola.set(escolaId, (cursosPorEscola.get(escolaId) ?? 0) + 1);
        });

        listaProfessores.forEach((professor: any) => {
          const escolaId = professor?.escola?.id;
          if (escolaId == null) {
            return;
          }

          professoresPorEscola.set(escolaId, (professoresPorEscola.get(escolaId) ?? 0) + 1);
        });

        this.instituicoes = listaInstituicoes;
        this.listaEscolas = listaEscolas.map((escola) => this.mapearEscola(escola, cursosPorEscola, professoresPorEscola));
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar escolas:', erro);
        this.carregando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel carregar as escolas no backend agora.');
      }
    });
  }

  salvarEscola(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const payload = this.montarPayload();
    if (!payload) {
      this.mensagemErro = 'Preencha nome, coordenador e IES vinculada antes de salvar a escola.';
      return;
    }

    this.salvando = true;
    const requisicao = this.editandoId == null
      ? this.escolaService.salvarEscola(payload)
      : this.escolaService.atualizarEscola(this.editandoId, payload);

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.mensagemSucesso = this.editandoId == null
          ? 'Escola cadastrada com sucesso.'
          : 'Escola atualizada com sucesso.';
        this.limparFormulario();
        this.carregarEscolas();
      },
      error: (erro) => {
        console.error('Erro ao salvar escola:', erro);
        this.salvando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel salvar a escola agora.');
      }
    });
  }

  editarEscola(escola: EscolaTabela): void {
    this.editandoId = escola.id;
    this.formulario = {
      nome: escola.nome,
      coordenador: escola.coordenador,
      iesId: escola.iesId,
      ativo: escola.ativo
    };
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  inativarEscola(escola: EscolaTabela): void {
    if (!escola.ativo) {
      return;
    }

    const confirmacao = confirm(`Deseja realmente inativar a escola ${escola.nome}?`);
    if (!confirmacao) {
      return;
    }

    this.escolaService.inativarEscola(escola.id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Escola inativada com sucesso.';
        this.carregarEscolas();
      },
      error: (erro) => {
        console.error('Erro ao inativar escola:', erro);
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel inativar a escola agora.');
      }
    });
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  private mapearEscola(
    escola: EscolaResponse,
    cursosPorEscola: Map<number, number>,
    professoresPorEscola: Map<number, number>
  ): EscolaTabela {
    return {
      id: escola.id,
      nome: escola.nome ?? 'Escola sem nome',
      coordenador: escola.coordenador ?? '-',
      iesId: escola.ies?.id ?? null,
      iesNome: escola.ies?.nome ?? 'Sem IES',
      ativo: !!escola.ativo,
      status: escola.ativo ? 'Ativo' : 'Inativo',
      totalCursos: cursosPorEscola.get(escola.id) ?? 0,
      totalProfessores: professoresPorEscola.get(escola.id) ?? 0
    };
  }

  private montarPayload(): EscolaRequest | null {
    const nome = this.formulario.nome.trim();
    const coordenador = this.formulario.coordenador.trim();
    const iesId = this.formulario.iesId;

    if (!nome || !coordenador || iesId == null) {
      return null;
    }

    return {
      nome,
      coordenador,
      iesId,
      ativo: this.formulario.ativo
    };
  }

  private limparFormulario(): void {
    this.editandoId = null;
    this.formulario = {
      nome: '',
      coordenador: '',
      iesId: null,
      ativo: true
    };
  }

  private formatarErro(erro: any, fallback: string): string {
    if (erro?.status === 401 || erro?.status === 403) {
      return 'Erro de seguranca ao carregar ou salvar escolas. Faca login novamente.';
    }

    return fallback;
  }
}
