import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

export interface ProfessorEscola {
  id: number;
  nome: string;
}

export interface ProfessorResponse {
  id: number;
  matricula: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  ativo: boolean;
  escola: ProfessorEscola | null;
}

export interface ProfessorRequest {
  matricula: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  escolaId: number;
  ativo: boolean;
  username?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfessorService {
  private readonly apiUrl = 'http://localhost:8081/admin/professores';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listarProfessores(): Observable<ProfessorResponse[]> {
    return this.http.get<ProfessorResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  salvarProfessor(payload: ProfessorRequest): Observable<ProfessorResponse> {
    return this.http.post<ProfessorResponse>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  atualizarProfessor(id: number, payload: ProfessorRequest): Observable<ProfessorResponse> {
    return this.http.put<ProfessorResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  inativarProfessor(id: number): Observable<ProfessorResponse> {
    return this.http.patch<ProfessorResponse>(`${this.apiUrl}/${id}/inativar`, {}, { headers: this.getHeaders() });
  }

  ativarProfessor(id: number): Observable<ProfessorResponse> {
    return this.http.patch<ProfessorResponse>(`${this.apiUrl}/${id}/ativar`, {}, { headers: this.getHeaders() });
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
