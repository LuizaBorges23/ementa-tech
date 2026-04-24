import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-professor-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './professor-portal-layout.component.html',
  styleUrls: ['./professor-portal-layout.component.css']
})
export class ProfessorPortalLayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  sair(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
