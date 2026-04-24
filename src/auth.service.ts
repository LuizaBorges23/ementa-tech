import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

interface AuthResponse {
  username: string;
  role: string;
  nomeProfessor: string | null;
  mensagem: string;
}

export interface SessaoUsuario {
  username: string;
  role: string;
  nomeProfessor: string | null;
  basicAuth: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authApiUrl = 'http://localhost:8081/auth';
  private readonly sessionKey = 'sessaoUsuario';

  constructor(private http: HttpClient) {}

  login(username: string, senha: string): Observable<SessaoUsuario> {
    const usernameNormalizado = username.trim();
    const basicAuth = `Basic ${btoa(`${usernameNormalizado}:${senha}`)}`;

    return this.http.post<AuthResponse>(`${this.authApiUrl}/login`, {
      username: usernameNormalizado,
      password: senha
    }).pipe(
      map((response) => ({
        username: response.username,
        role: response.role,
        nomeProfessor: response.nomeProfessor,
        basicAuth
      })),
      tap((sessao) => {
        localStorage.setItem(this.sessionKey, JSON.stringify(sessao));
      })
    );
  }

  isAdmin(): boolean {
    const sessao = this.getSessao();
    if (!sessao) return false;

    return sessao.role === 'ROLE_ADMIN';
  }

  isProfessor(): boolean {
    const sessao = this.getSessao();
    if (!sessao) return false;

    return sessao.role === 'ROLE_PROFESSOR';
  }

  getNomeProfessor(): string | null {
    return this.getSessao()?.nomeProfessor ?? null;
  }

  getSessaoAtual(): SessaoUsuario | null {
    return this.getSessao();
  }

  getAuthorizationHeader(): string | null {
    return this.getSessao()?.basicAuth ?? null;
  }

  clearSession(): void {
    localStorage.removeItem(this.sessionKey);
  }

  private getSessao(): SessaoUsuario | null {
    const sessaoSerializada = localStorage.getItem(this.sessionKey);
    if (!sessaoSerializada) return null;

    try {
      return JSON.parse(sessaoSerializada) as SessaoUsuario;
    } catch {
      this.clearSession();
      return null;
    }
  }
}
