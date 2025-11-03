// src/app/shared/data.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Merit } from '../../models/merits.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private messageSource = new Subject<Merit>(); // data channel
  message$ = this.messageSource.asObservable(); // observable for components

  sendMessage(message: Merit) {
    this.messageSource.next(message); // send data
  }
}
