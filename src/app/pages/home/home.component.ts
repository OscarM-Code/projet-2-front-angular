import { Component, OnDestroy, OnInit } from '@angular/core'; // Importation des modules nécessaires
import { combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';
import DatalabelsPlugin from 'chartjs-plugin-datalabels'; // Importation du plugin pour Chart.js
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public olympics$: Observable<Olympic[]> = of([]); // Initialisation des variables
  public olympicsLength!: number;
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };

  private subscriptions: Subscription[] = []; // Initialisation des abonnements

  constructor(private olympicService: OlympicService, private router: Router) {} // Injection des dépendances

  // Options pour le graphique de type pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true, // Le graphique doit être responsive
    maintainAspectRatio: false, // Ne pas maintenir le ratio par défaut
    plugins: {
      legend: {
        display: true, // Afficher la légende
        position: 'right', // Position de la légende à droite du graphique
        labels: {
          color: '#333', // Couleur du texte de la légende
          usePointStyle: true, // Utiliser des formes pour les labels
        },
      },
      datalabels: {
        display: false, // Ne pas afficher les labels des données sur le graphique
        color: '#04838f', // Couleur des labels des données
      },
    },
    layout: {
      padding: {
        left: 50, // Ajouter un padding à gauche du graphique
        right: 50, // Ajouter un padding à droite du graphique
        top: 0, // Pas de padding en haut du graphique
        bottom: 0, // Pas de padding en bas du graphique
      },
    },
  };
  public pieChartType: ChartType = 'pie'; // Type de graphique
  public pieChartPlugins = [DatalabelsPlugin]; // Plugin de graphique

  // Fonction pour gérer le clic sur le graphique
  chartClicked(e: any) {
    let id = 1 + e.active[0].index;
    this.router.navigateByUrl(`country/${id}`);
  }

  ngOnInit(): void {
    // Récupération des données des olympiades
    this.olympics$ = this.olympicService.getOlympics();

    // Création d'un Observable qui retourne les noms des pays
    const olympicNames$ = this.olympics$.pipe(
      map((olympics: Olympic[]) => olympics.map((o: Olympic) => o.country))
    );

    // Création d'un Observable qui retourne le nombre de médailles pour chaque pays
    const olympicMedalCount$ = this.olympics$.pipe(
      map((olympics: Olympic[]) =>
        olympics.map((o: Olympic) =>
          o.participations.reduce((acc, curr) => acc + curr.medalsCount, 0)
        )
      )
    );

    // Combine les Observables pour mettre à jour les données du graphique
    const subscription = combineLatest([
      olympicNames$,
      olympicMedalCount$,
    ]).subscribe(([names, medalCounts]) => {
      // Lorsque les données sont reçues, on récupère le nombre de pays
      this.olympicsLength = names.length;
      // On met à jour les données du graphique en créant un nouvel objet pour le jeu de données de la pie chart
      this.pieChartData = {
        labels: names, // Les noms des pays sont utilisés comme labels pour chaque part
        datasets: [
          {
            data: medalCounts, // Le nombre total de médailles pour chaque pays est utilisé pour déterminer la taille de chaque part
            backgroundColor: [
              '#956065',
              '#b8cbe7',
              '#89a1db',
              '#793d52',
              '#9780a1',
            ],
          },
        ],
      };
    });
    // On ajoute l'abonnement à la liste de souscriptions pour pouvoir se désinscrire plus tard
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    // Parcourt le tableau des abonnements et se désabonne de chaque abonnement
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
