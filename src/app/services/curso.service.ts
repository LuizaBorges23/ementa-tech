import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

export interface CursoEscola {
  id: number;
  nome: string;
}

export interface CursoCoordenador {
  id: number;
  nomeCompleto: string;
}

export interface CursoResponse {
  id: number;
  sigla: string;
  descricao: string;
  ativo: boolean;
  dataCadastro: string;
  escola: CursoEscola | null;
  coordenadorCurso: CursoCoordenador | null;
}

export interface CursoRequest {
  sigla: string;
  descricao: string;
  escolaId: number;
  coordenadorCursoId?: number | null;
  dataCadastro?: string | null;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CursoService {
  private readonly apiUrl = 'http://localhost:8081/admin/cursos';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listarCursos(): Observable<CursoResponse[]> {
    return this.http.get<CursoResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  salvarCurso(payload: CursoRequest): Observable<CursoResponse> {
    return this.http.post<CursoResponse>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  atualizarCurso(id: number, payload: CursoRequest): Observable<CursoResponse> {
    return this.http.put<CursoResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  inativarCurso(id: number): Observable<CursoResponse> {
    return this.http.patch<CursoResponse>(`${this.apiUrl}/${id}/inativar`, {}, { headers: this.getHeaders() });
  }

  ativarCurso(id: number): Observable<CursoResponse> {
    return this.http.patch<CursoResponse>(`${this.apiUrl}/${id}/ativar`, {}, { headers: this.getHeaders() });
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
