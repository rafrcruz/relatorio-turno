import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface ApiResponse {
  message: string;
  timestamp: string;
  backend: string;
}

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit {
  backendMessage: string = '';
  backendTimestamp: string = '';
  backendInfo: string = '';
  isLoading: boolean = false;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBackendMessage();
  }

  fetchBackendMessage(): void {
    this.isLoading = true;
    this.error = '';
    
    this.http.get<ApiResponse>(`${environment.apiUrl}/api/hello`)
      .subscribe({
        next: (response) => {
          this.backendMessage = response.message;
          this.backendTimestamp = response.timestamp;
          this.backendInfo = response.backend;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Erro ao conectar com o backend: ' + (err.message || 'Erro desconhecido');
          this.isLoading = false;
        }
      });
  }

  refreshMessage(): void {
    this.fetchBackendMessage();
  }
}
