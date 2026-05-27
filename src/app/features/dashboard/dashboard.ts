import { Component, signal, computed, inject, OnInit, OnDestroy, viewChild, ElementRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { AppLayout } from '../../layout/app-layout/app-layout';
import { UserService } from '../../core/services/user.service';
import { CompanyService } from '../../core/services/company.service';
import { RoleService } from '../../core/services/role.service';
import { ProfileService } from '../../core/services/profile.service';
import { PolicyService } from '../../core/services/policy.service';
import { FormazioneService } from '../../core/services/formazione.service';
import { SedeOperativaService } from '../../core/services/sede-operativa.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';
import { Company } from '../../models/company.model';
import { Role } from '../../models/role.model';
import { Profile } from '../../models/profile.model';
import { Policy } from '../../models/policy.model';
import { Formazione } from '../../models/formazione.model';
import { SedeOperativa } from '../../models/sede-operativa.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AppLayout],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private companyService = inject(CompanyService);
  private roleService = inject(RoleService);
  private profileService = inject(ProfileService);
  private policyService = inject(PolicyService);
  private formazioneService = inject(FormazioneService);
  private sedeService = inject(SedeOperativaService);
  auth = inject(AuthService);

  users = signal<User[]>([]);
  companies = signal<Company[]>([]);
  roles = signal<Role[]>([]);
  profiles = signal<Profile[]>([]);
  policies = signal<Policy[]>([]);
  formazione = signal<Formazione[]>([]);
  sedi = signal<SedeOperativa[]>([]);

  userCount = computed(() => this.users().length);
  companyCount = computed(() => this.companies().length);
  roleCount = computed(() => this.roles().length);
  profileCount = computed(() => this.profiles().length);
  policyCount = computed(() => this.policies().length);
  formazioneCount = computed(() => this.formazione().length);
  sediCount = computed(() => this.sedi().length);

  usersPerCompanyLabels = computed(() => this.companies().map(c => c.factoryName));
  usersPerCompanyData = computed(() =>
    this.companies().map(c => this.users().filter(u => u.companyId === c.id).length),
  );
  noCompanyUsers = computed(() => this.users().filter(u => !u.companyId).length);

  activeUsers = computed(() => this.users().filter(u => u.status === 'ACTIVE').length);
  inactiveUsers = computed(() => this.users().filter(u => u.status !== 'ACTIVE').length);

  globalRoles = computed(() => this.roles().filter(r => r.scope === 'GLOBAL').length);
  tenantRoles = computed(() => this.roles().filter(r => r.scope === 'TENANT').length);

  latestUsers = computed(() => this.users().slice().reverse().slice(0, 5));

  uccCanvas = viewChild<ElementRef<HTMLCanvasElement>>('uccCanvas');
  rolesCanvas = viewChild<ElementRef<HTMLCanvasElement>>('rolesCanvas');
  statusCanvas = viewChild<ElementRef<HTMLCanvasElement>>('statusCanvas');

  private chartInstances: Chart[] = [];

  ngOnInit(): void {
    forkJoin({
      u: this.userService.getAll(),
      c: this.companyService.getAll(),
      r: this.roleService.getAll(),
      p: this.profileService.getAll(),
      pc: this.policyService.getAll(),
      f: this.formazioneService.getAll(),
      s: this.sedeService.getAll(),
    }).subscribe({
      next: (data) => {
        this.users.set(data.u);
        this.companies.set(data.c);
        this.roles.set(data.r);
        this.profiles.set(data.p);
        this.policies.set(data.pc);
        this.formazione.set(data.f);
        this.sedi.set(data.s);
        setTimeout(() => this.initCharts());
      },
    });
  }

  private initCharts(): void {
    const uccEl = this.uccCanvas()?.nativeElement;
    if (uccEl) {
      const labels = this.usersPerCompanyLabels();
      const data = this.usersPerCompanyData();
      if (labels.length) {
        const chart = new Chart(uccEl, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Utenti',
                data,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Utenti per azienda', font: { size: 14 } },
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
          },
        });
        this.chartInstances.push(chart);
      }
    }

    const rEl = this.rolesCanvas()?.nativeElement;
    if (rEl) {
      const global = this.globalRoles();
      const tenant = this.tenantRoles();
      if (global || tenant) {
        const chart = new Chart(rEl, {
          type: 'doughnut',
          data: {
            labels: ['GLOBAL', 'TENANT'],
            datasets: [
              {
                data: [global, tenant],
                backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(234, 179, 8, 0.7)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)'],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
              title: { display: true, text: 'Ruoli GLOBAL / TENANT', font: { size: 14 } },
            },
          },
        });
        this.chartInstances.push(chart);
      }
    }

    const sEl = this.statusCanvas()?.nativeElement;
    if (sEl) {
      const active = this.activeUsers();
      const inactive = this.inactiveUsers();
      if (active || inactive) {
        const chart = new Chart(sEl, {
          type: 'doughnut',
          data: {
            labels: ['Attivi', 'Inattivi'],
            datasets: [
              {
                data: [active, inactive],
                backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
              title: { display: true, text: 'Stato utenti', font: { size: 14 } },
            },
          },
        });
        this.chartInstances.push(chart);
      }
    }
  }

  ngOnDestroy(): void {
    this.chartInstances.forEach(c => c.destroy());
    this.chartInstances = [];
  }
}
