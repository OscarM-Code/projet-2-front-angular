import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { OlympicService } from './core/services/olympic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    const subscription = this.olympicService
      .loadInitialData()
      .pipe(take(1))
      .subscribe();
    this.subscriptions.push(subscription);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
