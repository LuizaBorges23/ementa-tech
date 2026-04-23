import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

@Injectable({ providedIn: 'root' })
export class ProfessorService {
  private readonly apiUrl = 'http://localhost:8081/admin/professores';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listarProfessores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  inativarProfessor(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/inativar`, {}, { headers: this.getHeaders() });
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
