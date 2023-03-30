import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable, of, reduce, tap } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<Olympic[]> = of([]);
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };
  public olympicNames!: string[];
  public olympicMedalCount!: number[];

  constructor(private olympicService: OlympicService) {}

  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    },
  };

  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];

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

    combineLatest([olympicNames$, olympicMedalCount$]).subscribe(
      ([names, medalCounts]) => {
        this.olympicNames = names;
        this.olympicMedalCount = medalCounts;
        this.pieChartData = {
          labels: this.olympicNames,
          datasets: [
            {
              data: this.olympicMedalCount,
            },
          ],
        };
      }
    );
  }
}
