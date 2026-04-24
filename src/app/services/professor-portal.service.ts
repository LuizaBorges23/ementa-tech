import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';
import { ProgramaDisciplinaResponse } from './programa-disciplina.service';

export interface ProfessorPortalEscola {
  id: number;
  nome: string;
}

export interface ProfessorPortalFormacao {
  id: number;
  categoriaTitulacao: string;
  instituicaoConclusao: string;
  nomeCurso: string;
  anoConclusao: number;
}

export interface ProfessorPortalResponse {
  id: number;
  matricula: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  ativo: boolean;
  escola: ProfessorPortalEscola | null;
  formacoes: ProfessorPortalFormacao[];
}

export interface FormacaoProfessorPayload {
  categoriaTitulacao: string;
  instituicaoConclusao: string;
  nomeCurso: string;
  anoConclusao: number | null;
}

export interface BibliografiaPayload {
  titulo: string;
  autores: string;
  editora: string;
  isbn: string;
  anoPublicacao: number | null;
  localizacao: 'DIGITAL' | 'FISICO';
  linkLivro: string | null;
  posicaoEstante: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfessorPortalService {
  private readonly apiUrl = 'http://localhost:8081/professor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMeuPerfil(): Observable<ProfessorPortalResponse> {
    return this.http.get<ProfessorPortalResponse>(`${this.apiUrl}/me`, {
      headers: this.getHeaders()
    });
  }

  adicionarFormacao(payload: FormacaoProfessorPayload): Observable<ProfessorPortalFormacao> {
    return this.http.post<ProfessorPortalFormacao>(`${this.apiUrl}/me/formacoes`, payload, {
      headers: this.getHeaders()
    });
  }

  listarMeusProgramas(): Observable<ProgramaDisciplinaResponse[]> {
    return this.http.get<ProgramaDisciplinaResponse[]>(`${this.apiUrl}/programas`, {
      headers: this.getHeaders()
    });
  }

  adicionarBibliografiaBasica(programaId: number, payload: BibliografiaPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/programas/${programaId}/bibliografias/basicas`, payload, {
      headers: this.getHeaders()
    });
  }

  adicionarBibliografiaComplementar(programaId: number, payload: BibliografiaPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/programas/${programaId}/bibliografias/complementares`, payload, {
      headers: this.getHeaders()
    });
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
