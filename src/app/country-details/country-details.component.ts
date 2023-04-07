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
  olympic!: Olympic;
  totalMedals!: number;
  totalAthletes!: number;

  private subscriptions: Subscription[] = [];

  constructor(
    private olymmpicService: OlympicService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: [],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      y: {
        position: 'left',
        suggestedMin: 0,
        suggestedMax: 140,
      },
    },

    plugins: {
      legend: { display: true },
    },
  };

  public lineChartType: ChartType = 'line';

  goHome() {
    this.router.navigateByUrl('');
  }

  ngOnInit(): void {
    const olympicCountry = +this.route.snapshot.params['id'];
    const subscription = this.olymmpicService
      .getOlympicsByCountry(olympicCountry)
      .subscribe((olympics: Olympic[]) => {
        if (olympics && olympics.length) {
          this.olympic = olympics[0];
        } else {
          this.goHome();
        }
      });
    this.subscriptions.push(subscription);
    this.lineChartData = {
      datasets: [
        {
          data: this.olympic.participations.map((p) => {
            return p.medalsCount;
          }),
          label: 'Medals by years',
          backgroundColor: 'rgba(4, 131, 143, 0.2)',
          borderColor: 'rgba(4, 131, 143, 1)',
          pointBackgroundColor: 'rgba(4, 131, 143, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(4, 131, 143, 0.8)',
          fill: 'origin',
        },
      ],
      labels: this.olympic.participations.map((p: Participation) => {
        return p.year;
      }),
    };
    this.totalMedals = this.olympic.participations.reduce(
      (acc, curr) => acc + curr.medalsCount,
      0
    );
    this.totalAthletes = this.olympic.participations.reduce(
      (acc, curr) => acc + curr.athleteCount,
      0
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
