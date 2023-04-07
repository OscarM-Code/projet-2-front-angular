import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public olympics$: Observable<Olympic[]> = of([]);
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

  private subscriptions: Subscription[] = [];

  constructor(private olympicService: OlympicService, private router: Router) {}
  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#333',
          usePointStyle: true,
        },
      },
      datalabels: {
        display: false,
      },
    },
    layout: {
      padding: {
        left: 50,
        right: 50,
        top: 0,
        bottom: 0,
      },
    },
  };

  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];

  chartClicked(e: any) {
    let id = 1 + e.active[0].index;
    this.router.navigateByUrl(`country/${id}`);
  }

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    const olympicNames$ = this.olympics$.pipe(
      map((olympics: Olympic[]) => olympics.map((o: Olympic) => o.country))
    );

    const olympicMedalCount$ = this.olympics$.pipe(
      map((olympics: Olympic[]) =>
        olympics.map((o: Olympic) =>
          o.participations.reduce((acc, curr) => acc + curr.medalsCount, 0)
        )
      )
    );

    const subscription = combineLatest([
      olympicNames$,
      olympicMedalCount$,
    ]).subscribe(([names, medalCounts]) => {
      this.olympicsLength = names.length;
      this.pieChartData = {
        labels: names,
        datasets: [
          {
            data: medalCounts,
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
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
