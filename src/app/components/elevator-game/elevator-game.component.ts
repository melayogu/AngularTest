import { Component } from '@angular/core';

@Component({
  selector: 'app-elevator-game',
  templateUrl: './elevator-game.component.html',
  styleUrls: ['./elevator-game.component.css']
})
export class ElevatorGameComponent {
  // 遊戲邏輯將在此實作
  currentFloor = 1;
  maxFloor = 10;
  minFloor = 1;

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
