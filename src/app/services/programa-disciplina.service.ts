import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

export interface ProgramaDisciplinaEscola {
  id: number;
  nome: string;
}

export interface ProgramaDisciplinaProfessor {
  id: number;
  nomeCompleto: string;
}

export interface ProgramaDisciplinaCurso {
  id: number;
  sigla: string;
  descricao: string;
}

export interface ProgramaDisciplinaReferencia {
  id: number;
  sigla: string;
  descricao: string;
}

export interface ProgramaDisciplinaDetalhe {
  id: number;
  sigla: string;
  descricao: string;
  cargaHoraria: number;
  ativo: boolean;
  escola: ProgramaDisciplinaEscola | null;
  professor: ProgramaDisciplinaProfessor | null;
  cursos: ProgramaDisciplinaCurso[];
}

export interface ProgramaBibliografia {
  id: number;
  titulo: string;
  autores: string;
  editora: string;
  isbn: string;
  anoPublicacao: number;
  localizacao: string | null;
  linkLivro: string | null;
  posicaoEstante: string | null;
}

export interface ProgramaDisciplinaResponse {
  id: number;
  semestre: number;
  ementa: string;
  competenciasHabilidades: string;
  conteudoProgramatico: string;
  metodologia: string;
  processoAvaliacao: string;
  dataCadastro: string;
  ativo: boolean;
  disciplina: ProgramaDisciplinaDetalhe | null;
  prerequisitos: ProgramaDisciplinaReferencia[];
  bibliografiasBasicas: ProgramaBibliografia[];
  bibliografiasComplementares: ProgramaBibliografia[];
}

@Injectable({ providedIn: 'root' })
export class ProgramaDisciplinaService {
  private readonly apiUrl = 'http://localhost:8081/admin/programas-disciplinas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listarProgramas(): Observable<ProgramaDisciplinaResponse[]> {
    return this.http.get<ProgramaDisciplinaResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getProgramaPorId(id: string): Observable<ProgramaDisciplinaResponse> {
    return this.http.get<ProgramaDisciplinaResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  private getHeaders(): HttpHeaders {
    const authorization = this.authService.getAuthorizationHeader();

    if (!authorization) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: authorization
    });
  }
}
