import { Component, OnDestroy, OnInit } from '@angular/core';
import { Olympic } from '../core/models/Olympic';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from '../core/services/olympic.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Participation } from '../core/models/Participation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss'],
})
export class CountryDetailsComponent implements OnInit, OnDestroy {
  // Propriétés pour stocker les détails sur le pays sélectionné
  olympic!: Olympic;
  totalMedals!: number;
  totalAthletes!: number;

  // Tableau pour stocker les abonnements
  private subscriptions: Subscription[] = [];

  constructor(
    private olymmpicService: OlympicService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Propriétés pour stocker les données et les options du graphique
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: [],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5, // Définit la tension de la courbe
      },
    },
    scales: {
      y: {
        position: 'left', // Définit la position de l'axe des ordonnées
        suggestedMin: 0,
        suggestedMax: 140,
      },
    },

    plugins: {
      legend: { display: true }, // Affiche la légende du graphique
    },
  };

  public lineChartType: ChartType = 'line'; // Définit le type de graphique

  // Redirige vers la page d'accueil
  goHome() {
    this.router.navigateByUrl('');
  }

  ngOnInit(): void {
    // Récupère l'identifiant du pays à partir de la route
    const olympicCountry = +this.route.snapshot.params['id'];
    // Récupère les détails sur le pays à partir du service OlympicService
    const subscription = this.olymmpicService
      .getOlympicsById(olympicCountry)
      .subscribe((olympics: Olympic[]) => {
        if (olympics && olympics.length) {
          this.olympic = olympics[0]; // Stocke les détails sur le pays sélectionné
        } else {
          this.goHome(); // Redirige vers la page d'accueil si les détails ne sont pas trouvés
        }
      });
    this.subscriptions.push(subscription);

    // Si les détails sur le pays sont trouvés, configure le graphique et calcule les totaux des médailles et des athlètes
    if (this.olympic) {
      // création de l'objet lineChartData avec les données des participations olympiques
      this.lineChartData = {
        datasets: [
          {
            data: this.olympic.participations.map((p) => {
              return p.medalsCount;
            }),
            label: 'Médailles par année',
            backgroundColor: '#fff',
            borderColor: 'rgba(4, 131, 143, 1)',
            pointBackgroundColor: 'rgba(4, 131, 143, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(4, 131, 143, 0.8)',
          },
        ],
        // les années sont récupérées pour les utiliser comme labels sur l'axe x du graphique
        labels: this.olympic.participations.map((p: Participation) => {
          return p.year;
        }),
      };
      // calcul du nombre total de médailles
      this.totalMedals = this.olympic.participations.reduce(
        (acc, curr) => acc + curr.medalsCount,
        0
      );
      // calcul du nombre total d'athlètes
      this.totalAthletes = this.olympic.participations.reduce(
        (acc, curr) => acc + curr.athleteCount,
        0
      );
    }
  }

  // désabonnement des observables pour éviter des fuites de mémoire
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
