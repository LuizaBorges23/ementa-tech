import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

export interface InstituicaoEnsinoSuperior {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
}

export interface InstituicaoRequest {
  nome: string;
  endereco: string;
  telefone: string;
}

@Injectable({ providedIn: 'root' })
export class InstituicaoService {
  private readonly apiUrl = 'http://localhost:8081/admin/ies';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listarInstituicoes(): Observable<InstituicaoEnsinoSuperior[]> {
    return this.http.get<InstituicaoEnsinoSuperior[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  salvarInstituicao(payload: InstituicaoRequest): Observable<InstituicaoEnsinoSuperior> {
    return this.http.post<InstituicaoEnsinoSuperior>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  atualizarInstituicao(id: number, payload: InstituicaoRequest): Observable<InstituicaoEnsinoSuperior> {
    return this.http.put<InstituicaoEnsinoSuperior>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
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
