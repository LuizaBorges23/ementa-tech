import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CursoRequest,
  CursoResponse,
  CursoService
} from '../services/curso.service';
import { DisciplinaService } from '../services/disciplina.service';
import { ProgramaDisciplinaService } from '../services/programa-disciplina.service';
import { EscolaResponse, EscolaService } from '../services/escola.service';
import { ProfessorResponse, ProfessorService } from '../services/professor.service';

interface DisciplinaMatriz {
  id: string;
  semestre: string;
  nome: string;
  status: string;
  sigla: string;
}

interface CursoTabela {
  id: number;
  ativo: boolean;
  nome: string;
  sigla: string;
  escola: string;
  escolaId: number | null;
  coordenador: string;
  coordenadorId: number | null;
  dataCadastro: string;
  dataCadastroOriginal: string;
  status: string;
  matriz: DisciplinaMatriz[];
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {
  mostrarMatriz = false;
  carregando = false;
  salvando = false;
  mensagemErro = '';
  mensagemSucesso = '';
  editandoId: number | null = null;
  cursoSelecionado: CursoTabela | null = null;
  disciplinasDaMatriz: DisciplinaMatriz[] = [];
  escolas: EscolaResponse[] = [];
  professores: ProfessorResponse[] = [];
  listaCursos: CursoTabela[] = [];
  formulario = {
    sigla: '',
    descricao: '',
    escolaId: null as number | null,
    coordenadorCursoId: null as number | null,
    dataCadastro: '',
    ativo: true
  };

  constructor(
    private cursoService: CursoService,
    private disciplinaService: DisciplinaService,
    private programaDisciplinaService: ProgramaDisciplinaService,
    private escolaService: EscolaService,
    private professorService: ProfessorService
  ) {}

  ngOnInit(): void {
    this.carregarCursos();
  }

  get totalCursosAtivos(): number {
    return this.listaCursos.filter((curso) => curso.ativo).length;
  }

  get tituloFormulario(): string {
    return this.editandoId == null ? 'Cadastrar curso' : 'Editar curso';
  }

  get professoresDisponiveis(): ProfessorResponse[] {
    const escolaId = this.formulario.escolaId;

    return [...this.professores]
      .filter((professor) => {
        if (escolaId == null) {
          return professor.ativo;
        }

        return professor.escola?.id === escolaId || professor.id === this.formulario.coordenadorCursoId;
      })
      .sort((atual, proximo) => atual.nomeCompleto.localeCompare(proximo.nomeCompleto));
  }

  carregarCursos(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      cursos: this.cursoService.listarCursos(),
      disciplinas: this.disciplinaService.listarDisciplinas(),
      programas: this.programaDisciplinaService.listarProgramas(),
      escolas: this.escolaService.listarEscolas(),
      professores: this.professorService.listarProfessores()
    }).subscribe({
      next: ({ cursos, disciplinas, programas, escolas, professores }) => {
        const listaCursos = Array.isArray(cursos) ? cursos : [];
        const listaDisciplinas = Array.isArray(disciplinas) ? disciplinas : [];
        const listaProgramas = Array.isArray(programas) ? programas : [];
        const listaEscolas = Array.isArray(escolas) ? escolas : [];
        const listaProfessores = Array.isArray(professores) ? professores : [];
        const disciplinasPorId = new Map<number, any>(
          listaDisciplinas
            .filter((disciplina: any) => disciplina?.id != null)
            .map((disciplina: any) => [disciplina.id, disciplina])
        );

        this.escolas = listaEscolas;
        this.professores = listaProfessores;
        this.listaCursos = listaCursos.map((curso) =>
          this.mapearCurso(curso, listaProgramas, disciplinasPorId)
        );
        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar cursos, disciplinas e programas:', erro);
        this.carregando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel carregar a listagem de cursos.');
      }
    });
  }

  salvarCurso(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const payload = this.montarPayload();
    if (!payload) {
      this.mensagemErro = 'Preencha sigla, nome do curso e escola vinculada antes de salvar.';
      return;
    }

    this.salvando = true;
    const requisicao = this.editandoId == null
      ? this.cursoService.salvarCurso(payload)
      : this.cursoService.atualizarCurso(this.editandoId, payload);

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.mensagemSucesso = this.editandoId == null
          ? 'Curso cadastrado com sucesso.'
          : 'Curso atualizado com sucesso.';
        this.limparFormulario();
        this.carregarCursos();
      },
      error: (erro: any) => {
        console.error('Erro ao salvar curso:', erro);
        this.salvando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel salvar o curso agora.');
      }
    });
  }

  editarCurso(curso: CursoTabela): void {
    this.editandoId = curso.id;
    this.formulario = {
      sigla: curso.sigla,
      descricao: curso.nome,
      escolaId: curso.escolaId,
      coordenadorCursoId: curso.coordenadorId,
      dataCadastro: curso.dataCadastroOriginal,
      ativo: curso.ativo
    };
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  inativarCurso(curso: CursoTabela): void {
    if (!curso.ativo) {
      return;
    }

    const confirmacao = confirm(`Deseja realmente inativar o curso ${curso.nome}?`);
    if (!confirmacao) {
      return;
    }

    this.cursoService.inativarCurso(curso.id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Curso inativado com sucesso.';
        this.carregarCursos();
      },
      error: (erro: any) => {
        console.error('Erro ao inativar curso:', erro);
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel inativar o curso .');
      }
    });
  }

  ativarCurso(curso: CursoTabela): void {
    if (curso.ativo) {
      return;
    }

    const confirmacao = confirm(`Deseja realmente ativar o curso ${curso.nome}?`);
    if (!confirmacao) {
      return;
    }

    this.cursoService.ativarCurso(curso.id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Curso ativado com sucesso.';
        this.carregarCursos();
      },
      error: (erro: any) => {
        console.error('Erro ao ativar curso:', erro);
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel ativar o curso.');
      }
    });
  }

  abrirMatriz(curso: CursoTabela): void {
    this.cursoSelecionado = curso;
    this.disciplinasDaMatriz = curso.matriz;
    this.mostrarMatriz = true;
  }

  fecharMatriz(): void {
    this.mostrarMatriz = false;
    this.cursoSelecionado = null;
    this.disciplinasDaMatriz = [];
  }

  totalProgramas(curso: CursoTabela): number {
    return curso.matriz.length;
  }

  aoAlterarEscola(): void {
    if (!this.professoresDisponiveis.some((professor) => professor.id === this.formulario.coordenadorCursoId)) {
      this.formulario.coordenadorCursoId = null;
    }
  }

  private mapearCurso(
    curso: CursoResponse,
    programas: any[],
    disciplinasPorId: Map<number, any>
  ): CursoTabela {
    return {
      id: curso.id,
      ativo: !!curso.ativo,
      nome: curso.descricao ?? 'Curso sem nome',
      sigla: curso.sigla ?? '-',
      escola: curso.escola?.nome ?? 'Sem escola',
      escolaId: curso.escola?.id ?? null,
      coordenador: curso.coordenadorCurso?.nomeCompleto ?? 'Sem coordenador',
      coordenadorId: curso.coordenadorCurso?.id ?? null,
      dataCadastro: this.formatarData(curso.dataCadastro),
      dataCadastroOriginal: this.normalizarDataCadastro(curso.dataCadastro),
      status: curso.ativo ? 'Ativo' : 'Inativo',
      matriz: this.montarMatriz(curso.id, programas, disciplinasPorId)
    };
  }

  private montarMatriz(cursoId: number, programas: any[], disciplinasPorId: Map<number, any>): DisciplinaMatriz[] {
    return programas
      .map((programa: any) => {
        const disciplina = disciplinasPorId.get(programa?.disciplina?.id);
        return { programa, disciplina };
      })
      .filter(({ disciplina }) =>
        Array.isArray(disciplina?.cursos) &&
        disciplina.cursos.some((curso: any) => curso.id === cursoId)
      )
      .sort((atual, proximo) => (atual.programa?.semestre ?? 99) - (proximo.programa?.semestre ?? 99))
      .map(({ programa, disciplina }) => ({
        id: String(programa.id),
        semestre: this.formatarSemestre(programa.semestre),
        nome: disciplina?.descricao ?? programa?.disciplina?.descricao ?? 'Disciplina sem nome',
        status: programa.ativo ? 'Ativo' : 'Inativo',
        sigla: disciplina?.sigla ?? programa?.disciplina?.sigla ?? '-'
      }));
  }

  private montarPayload(): CursoRequest | null {
    const sigla = this.formulario.sigla.trim();
    const descricao = this.formulario.descricao.trim();
    const escolaId = this.formulario.escolaId;

    if (!sigla || !descricao || escolaId == null) {
      return null;
    }

    return {
      sigla,
      descricao,
      escolaId,
      coordenadorCursoId: this.formulario.coordenadorCursoId,
      dataCadastro: this.formulario.dataCadastro || null,
      ativo: this.formulario.ativo
    };
  }

  private limparFormulario(): void {
    this.editandoId = null;
    this.formulario = {
      sigla: '',
      descricao: '',
      escolaId: null,
      coordenadorCursoId: null,
      dataCadastro: '',
      ativo: true
    };
  }

  private formatarSemestre(semestre?: number): string {
    if (!semestre) {
      return 'Sem semestre';
    }

    return `${semestre}o semestre`;
  }

  private formatarData(dataCadastro?: string): string {
    if (!dataCadastro) {
      return 'Sem data';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dataCadastro)) {
      const [ano, mes, dia] = dataCadastro.split('-');
      return `${dia}/${mes}/${ano}`;
    }

    return dataCadastro;
  }

  private normalizarDataCadastro(dataCadastro?: string): string {
    if (!dataCadastro) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dataCadastro)) {
      return dataCadastro;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataCadastro)) {
      const [dia, mes, ano] = dataCadastro.split('/');
      return `${ano}-${mes}-${dia}`;
    }

    return '';
  }

  private formatarErro(erro: any, fallback: string): string {
    if (erro?.status === 401 || erro?.status === 403) {
      return 'Erro de seguranca ao carregar ou salvar cursos. Faca login novamente.';
    }

    return erro?.error?.message ?? fallback;
  }
}
