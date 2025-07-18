import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-snake-game',
  imports: [CommonModule],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.css']
})
export class SnakeGameComponent implements OnInit, OnDestroy {
  gameRunning = false;
  gameOver = false;
  score = 0;
  
  // 遊戲設定
  gridSize = 20;
  canvasWidth = 400;
  canvasHeight = 400;
  
  // 蛇身
  snake: Point[] = [{ x: 10, y: 10 }];
  direction: Point = { x: 1, y: 0 };
  nextDirection: Point = { x: 1, y: 0 };
  
  // 食物
  food: Point = { x: 15, y: 15 };
  
  // 遊戲循環
  gameLoop: any;
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.initializeGame();
  }
  
  ngOnDestroy() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }
  
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.gameRunning) return;
    
    switch (event.key) {
      case 'ArrowUp':
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
        if (this.direction.x === 0) {
          this.nextDirection = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
        if (this.direction.x === 0) {
          this.nextDirection = { x: 1, y: 0 };
        }
        break;
    }
    
    // 阻止方向鍵的默認行為
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onDirectionChange(direction: string) {
    if (!this.gameRunning) return;
    
    switch (direction) {
      case 'ArrowUp':
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
        if (this.direction.x === 0) {
          this.nextDirection = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
        if (this.direction.x === 0) {
          this.nextDirection = { x: 1, y: 0 };
        }
        break;
    }
  }
  
  initializeGame() {
    this.score = 0;
    this.gameOver = false;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.generateFood();
  }
  
  generateFood() {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * (this.canvasWidth / this.gridSize)),
        y: Math.floor(Math.random() * (this.canvasHeight / this.gridSize))
      };
    } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    this.food = newFood;
  }
  
  startGame() {
    if (this.gameRunning) return;
    
    this.gameRunning = true;
    this.initializeGame();
    
    this.gameLoop = setInterval(() => {
      this.update();
    }, 150);
  }
  
  resetGame() {
    this.gameRunning = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
    this.initializeGame();
  }
  
  backToMenu() {
    this.resetGame();
    this.router.navigate(['/']);
  }
  
  update() {
    if (!this.gameRunning || this.gameOver) return;
    
    // 更新方向
    this.direction = { ...this.nextDirection };
    
    // 計算蛇頭的新位置
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // 檢查撞牆
    if (head.x < 0 || head.x >= this.canvasWidth / this.gridSize || 
        head.y < 0 || head.y >= this.canvasHeight / this.gridSize) {
      this.endGame();
      return;
    }
    
    // 檢查撞到自己
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame();
      return;
    }
    
    // 移動蛇頭
    this.snake.unshift(head);
    
    // 檢查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.generateFood();
    } else {
      // 移除蛇尾
      this.snake.pop();
    }
  }
  
  endGame() {
    this.gameRunning = false;
    this.gameOver = true;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }
  
  getSnakeSegmentStyle(segment: Point, index: number) {
    const isHead = index === 0;
    return {
      left: segment.x * this.gridSize + 'px',
      top: segment.y * this.gridSize + 'px',
      width: this.gridSize + 'px',
      height: this.gridSize + 'px',
      backgroundColor: isHead ? '#2E7D32' : '#4CAF50',
      border: isHead ? '2px solid #1B5E20' : '1px solid #388E3C'
    };
  }
  
  getFoodStyle() {
    return {
      left: this.food.x * this.gridSize + 'px',
      top: this.food.y * this.gridSize + 'px',
      width: this.gridSize + 'px',
      height: this.gridSize + 'px'
    };
  }
}
