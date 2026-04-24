import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

export interface EscolaIes {
  id: number;
  nome: string;
}

export interface EscolaResponse {
  id: number;
  nome: string;
  coordenador: string;
  ativo: boolean;
  ies: EscolaIes | null;
}

export interface EscolaRequest {
  nome: string;
  coordenador: string;
  iesId: number;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class EscolaService {
  private readonly apiUrl = 'http://localhost:8081/admin/escolas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listarEscolas(): Observable<EscolaResponse[]> {
    return this.http.get<EscolaResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  salvarEscola(payload: EscolaRequest): Observable<EscolaResponse> {
    return this.http.post<EscolaResponse>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  atualizarEscola(id: number, payload: EscolaRequest): Observable<EscolaResponse> {
    return this.http.put<EscolaResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  inativarEscola(id: number): Observable<EscolaResponse> {
    return this.http.patch<EscolaResponse>(`${this.apiUrl}/${id}/inativar`, {}, { headers: this.getHeaders() });
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
