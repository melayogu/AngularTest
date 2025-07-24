import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elevator-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elevator-game.component.html',
  styleUrls: ['./elevator-game.component.css']
})
export class ElevatorGameComponent {
  currentFloor = 1;
  maxFloor = 10;
  minFloor = 1;
  floors: number[] = [];

  constructor() {
    // 由高到低顯示樓層
    for (let i = this.maxFloor; i >= this.minFloor; i--) {
      this.floors.push(i);
    }
  }

  goUp() {
    if (this.currentFloor < this.maxFloor) {
      this.currentFloor++;
    }
  }

  goDown() {
    if (this.currentFloor > this.minFloor) {
      this.currentFloor--;
    }
  }
}
