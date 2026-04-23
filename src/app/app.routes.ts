import { Routes } from '@angular/router';
import { InicioComponent } from '../inicio.component'; 
import { LoginComponent } from '../login.component'; 
import { DashboardComponent } from '../dashboard.component';
import { adminGuard } from '../admin.guard';
import { ProfessoresComponent } from './professores/professores.component';
import { CursosComponent } from './cursos/cursos.component';
import { ProgramaDisciplinaComponent } from './programa-disciplina/programa-disciplina.component';
import { DisciplinaComponent } from './disciplina/disciplina.component';

export const routes: Routes = [
  { path: '', component: InicioComponent }, 
  { path: 'login', component: LoginComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'professores', component: ProfessoresComponent, canActivate: [adminGuard] },
  { path: 'cursos', component: CursosComponent, canActivate: [adminGuard] },
  { path: 'programa-disciplina/:id', component: ProgramaDisciplinaComponent, canActivate: [adminGuard] },
  { path: 'disciplinas', component: DisciplinaComponent, canActivate: [adminGuard] }
];

