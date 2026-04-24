import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  ProfessorRequest,
  ProfessorResponse,
  ProfessorService
} from '../services/professor.service';
import { CursoResponse, CursoService } from '../services/curso.service';
import { EscolaResponse, EscolaService } from '../services/escola.service';

interface ProfessorTabela {
  id: number;
  ativo: boolean;
  matricula: string;
  nome: string;
  email: string;
  telefone: string;
  escolaId: number | null;
  escolaVinculada: string;
  cursosVinculados: string;
  status: string;
}

@Component({
  selector: 'app-professores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professores.component.html',
  styleUrls: ['./professores.component.css']
})
export class ProfessoresComponent implements OnInit {
  totalCursosOfertados = 0;
  carregando = false;
  salvando = false;
  mensagemErro = '';
  mensagemSucesso = '';
  editandoId: number | null = null;
  escolas: EscolaResponse[] = [];
  listaProfessores: ProfessorTabela[] = [];
  formulario = {
    matricula: '',
    nomeCompleto: '',
    email: '',
    telefone: '',
    escolaId: null as number | null,
    ativo: true,
    username: '',
    password: ''
  };

  constructor(
    private professorService: ProfessorService,
    private cursoService: CursoService,
    private escolaService: EscolaService
  ) {}

  ngOnInit(): void {
    this.carregarProfessores();
  }

  get totalProfessoresAtivos(): number {
    return this.listaProfessores.filter((professor) => professor.ativo).length;
  }

  get tituloFormulario(): string {
    return this.editandoId == null ? 'Cadastrar professor' : 'Editar professor';
  }

  carregarProfessores(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      professores: this.professorService.listarProfessores(),
      cursos: this.cursoService.listarCursos(),
      escolas: this.escolaService.listarEscolas()
    }).subscribe({
      next: ({ professores, cursos, escolas }) => {
        const listaProfessores = Array.isArray(professores) ? professores : [];
        const listaCursos = Array.isArray(cursos) ? cursos : [];
        const listaEscolas = Array.isArray(escolas) ? escolas : [];
        const cursosPorEscola = this.agruparCursosPorEscola(listaCursos);

        this.totalCursosOfertados = listaCursos.length;
        this.escolas = listaEscolas;
        this.listaProfessores = listaProfessores.map((professor) =>
          this.mapearProfessor(professor, cursosPorEscola)
        );
        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar professores:', erro);
        this.carregando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel carregar a listagem de professores no backend agora.');
      }
    });
  }

  salvarProfessor(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const payload = this.montarPayload();
    if (!payload) {
      this.mensagemErro = 'Preencha matricula, nome, email, telefone e escola antes de salvar.';
      return;
    }

    if (this.editandoId == null && (!payload.username || !payload.password)) {
      this.mensagemErro = 'Informe usuario de acesso e senha no cadastro inicial do professor.';
      return;
    }

    this.salvando = true;
    const requisicao = this.editandoId == null
      ? this.professorService.salvarProfessor(payload)
      : this.professorService.atualizarProfessor(this.editandoId, payload);

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.mensagemSucesso = this.editandoId == null
          ? 'Professor cadastrado com sucesso.'
          : 'Professor atualizado com sucesso.';
        this.limparFormulario();
        this.carregarProfessores();
      },
      error: (erro: any) => {
        console.error('Erro ao salvar professor:', erro);
        this.salvando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel salvar o professor agora.');
      }
    });
  }

  editarProfessor(professor: ProfessorTabela): void {
    this.editandoId = professor.id;
    this.formulario = {
      matricula: professor.matricula,
      nomeCompleto: professor.nome,
      email: professor.email,
      telefone: professor.telefone,
      escolaId: professor.escolaId,
      ativo: professor.ativo,
      username: '',
      password: ''
    };
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  inativarProfessor(professor: ProfessorTabela): void {
    if (!professor.ativo) {
      return;
    }

    const confirmacao = confirm(`Deseja realmente inativar o professor ${professor.nome}?`);
    if (!confirmacao) {
      return;
    }

    this.professorService.inativarProfessor(professor.id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Professor inativado com sucesso.';
        this.carregarProfessores();
      },
      error: (erro: any) => {
        console.error('Erro ao inativar professor:', erro);
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel inativar o professor no backend agora.');
      }
    });
  }

  ativarProfessor(professor: ProfessorTabela): void {
    if (professor.ativo) {
      return;
    }

    const confirmacao = confirm(`Deseja realmente ativar o professor ${professor.nome}?`);
    if (!confirmacao) {
      return;
    }

    this.professorService.ativarProfessor(professor.id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Professor ativado com sucesso.';
        this.carregarProfessores();
      },
      error: (erro: any) => {
        console.error('Erro ao ativar professor:', erro);
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel ativar o professor no backend agora.');
      }
    });
  }

  private mapearProfessor(
    professor: ProfessorResponse,
    cursosPorEscola: Map<number, string[]>
  ): ProfessorTabela {
    const escolaId = professor.escola?.id ?? null;

    return {
      id: professor.id,
      ativo: !!professor.ativo,
      matricula: professor.matricula ?? '-',
      nome: professor.nomeCompleto ?? 'Professor sem nome',
      email: professor.email ?? '-',
      telefone: professor.telefone ?? '-',
      escolaId,
      escolaVinculada: professor.escola?.nome ?? 'Sem escola',
      cursosVinculados: this.formatarCursosVinculados(escolaId, cursosPorEscola),
      status: professor.ativo ? 'Ativo' : 'Inativo'
    };
  }

  private agruparCursosPorEscola(cursos: CursoResponse[]): Map<number, string[]> {
    const cursosPorEscola = new Map<number, string[]>();

    cursos.forEach((curso) => {
      const escolaId = curso?.escola?.id;
      if (escolaId == null) {
        return;
      }

      const listaAtual = cursosPorEscola.get(escolaId) ?? [];
      listaAtual.push(curso.descricao ?? 'Curso sem nome');
      cursosPorEscola.set(escolaId, listaAtual);
    });

    return cursosPorEscola;
  }

  private formatarCursosVinculados(
    escolaId: number | null,
    cursosPorEscola: Map<number, string[]>
  ): string {
    if (escolaId == null) {
      return 'Curso nao vinculado';
    }

    const cursos = cursosPorEscola.get(escolaId) ?? [];
    if (!cursos.length) {
      return 'Curso nao vinculado';
    }

    return [...cursos].sort((atual, proximo) => atual.localeCompare(proximo)).join(', ');
  }

  private montarPayload(): ProfessorRequest | null {
    const matricula = this.formulario.matricula.trim();
    const nomeCompleto = this.formulario.nomeCompleto.trim();
    const email = this.formulario.email.trim();
    const telefone = this.formulario.telefone.trim();
    const escolaId = this.formulario.escolaId;
    const username = this.formulario.username.trim();
    const password = this.formulario.password.trim();

    if (!matricula || !nomeCompleto || !email || !telefone || escolaId == null) {
      return null;
    }

    const payload: ProfessorRequest = {
      matricula,
      nomeCompleto,
      email,
      telefone,
      escolaId,
      ativo: this.formulario.ativo
    };

    if (username) {
      payload.username = username;
    }

    if (password) {
      payload.password = password;
    }

    return payload;
  }

  private limparFormulario(): void {
    this.editandoId = null;
    this.formulario = {
      matricula: '',
      nomeCompleto: '',
      email: '',
      telefone: '',
      escolaId: null,
      ativo: true,
      username: '',
      password: ''
    };
  }

  private formatarErro(erro: any, fallback: string): string {
    if (erro?.status === 401 || erro?.status === 403) {
      return 'Erro de seguranca ao carregar ou salvar professores. Faca login novamente.';
    }

    return erro?.error?.message ?? fallback;
  }
}
