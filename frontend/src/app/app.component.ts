import { Component } from '@angular/core';
import { AppStateService } from './core/app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private readonly appState: AppStateService) {}
}
