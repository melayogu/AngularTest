import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Boat {
  x: number;
  y: number;
  rotation: number;
  speed: number;
}

interface GameItem {
  x: number;
  y: number;
  size: number;
}

interface WaterBubble {
  x: number;
  y: number;
  size: number;
  angle: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'my-angular-app';
  
  // 遊戲狀態
  gameRunning = false;
  score = 0;
  gameTime = 0;
  
  // 遊戲物件
  boat: Boat = {
    x: 400,
    y: 200,
    rotation: 0,
    speed: 2
  };
  
  waterBubbles: WaterBubble[] = [];
  obstacles: GameItem[] = [];
  collectibles: GameItem[] = [];
  
  // 遊戲控制
  keys: { [key: string]: boolean } = {};
  gameLoop: any;
  timeInterval: any;
  
  // 河道參數
  riverCenterX = 400;
  riverCenterY = 300;
  riverRadius = 225;
  
  ngOnInit() {
    this.initializeGame();
    this.generateWaterBubbles();
  }
  
  ngOnDestroy() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
  
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.gameRunning) {
      // 阻止方向鍵的默認行為（避免頁面滾動）
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }
    }
    this.keys[event.key] = true;
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.keys[event.key] = false;
  }
  
  initializeGame() {
    this.score = 0;
    this.gameTime = 0;
    this.boat = {
      x: 400,
      y: 150,  // 修正初始位置，確保在河道內
      rotation: 0,
      speed: 2
    };
    this.generateObstacles();
    this.generateCollectibles();
  }
  
  generateWaterBubbles() {
    this.waterBubbles = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      this.waterBubbles.push({
        x: this.riverCenterX + Math.cos(angle) * radius,
        y: this.riverCenterY + Math.sin(angle) * radius,
        size: 3 + Math.random() * 5,
        angle: angle
      });
    }
  }
  
  generateObstacles() {
    this.obstacles = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 180 + Math.random() * 60;
      this.obstacles.push({
        x: this.riverCenterX + Math.cos(angle) * radius,
        y: this.riverCenterY + Math.sin(angle) * radius,
        size: 15 + Math.random() * 10
      });
    }
  }
  
  generateCollectibles() {
    this.collectibles = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 160 + Math.random() * 80;
      this.collectibles.push({
        x: this.riverCenterX + Math.cos(angle) * radius,
        y: this.riverCenterY + Math.sin(angle) * radius,
        size: 8
      });
    }
  }
  
  startGame() {
    if (this.gameRunning) return;
    
    this.gameRunning = true;
    this.initializeGame();
    
    // 啟動遊戲循環
    this.gameLoop = requestAnimationFrame(() => this.update());
    
    // 啟動計時器
    this.timeInterval = setInterval(() => {
      this.gameTime++;
    }, 1000);
    
    // 設定焦點到遊戲容器以接收鍵盤事件
    setTimeout(() => {
      const gameContainer = document.querySelector('.game-container') as HTMLElement;
      if (gameContainer) {
        gameContainer.focus();
      }
    }, 100);
  }
  
  resetGame() {
    this.gameRunning = false;
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    this.initializeGame();
  }
  
  update() {
    if (!this.gameRunning) return;
    
    // 更新小船位置
    this.updateBoat();
    
    // 更新水流氣泡
    this.updateWaterBubbles();
    
    // 碰撞檢測
    this.checkCollisions();
    
    // 繼續遊戲循環
    this.gameLoop = requestAnimationFrame(() => this.update());
  }
  
  updateBoat() {
    let dx = 0;
    let dy = 0;
    
    // 鍵盤控制
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      dx = -this.boat.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      dx = this.boat.speed;
    }
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      dy = -this.boat.speed;
    }
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
      dy = this.boat.speed;
    }
    
    // 更新位置
    const newX = this.boat.x + dx;
    const newY = this.boat.y + dy;
    
    // 檢查是否在河道內
    const distanceFromCenter = Math.sqrt(
      Math.pow(newX - this.riverCenterX, 2) + 
      Math.pow(newY - this.riverCenterY, 2)
    );
    
    // 允許在河道的外圈和內圈之間移動
    if (distanceFromCenter <= this.riverRadius && distanceFromCenter >= 80) {
      this.boat.x = newX;
      this.boat.y = newY;
      
      // 更新船的旋轉角度
      if (dx !== 0 || dy !== 0) {
        this.boat.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
      }
    }
  }
  
  updateWaterBubbles() {
    this.waterBubbles.forEach(bubble => {
      bubble.angle += 0.01;
      const radius = 150 + Math.sin(bubble.angle * 3) * 30;
      bubble.x = this.riverCenterX + Math.cos(bubble.angle) * radius;
      bubble.y = this.riverCenterY + Math.sin(bubble.angle) * radius;
    });
  }
  
  checkCollisions() {
    // 檢查收集物品
    this.collectibles = this.collectibles.filter(item => {
      const distance = Math.sqrt(
        Math.pow(this.boat.x - item.x, 2) + 
        Math.pow(this.boat.y - item.y, 2)
      );
      
      if (distance < 20) {
        this.score += 10;
        return false; // 移除收集到的物品
      }
      return true;
    });
    
    // 檢查障礙物碰撞
    this.obstacles.forEach(obstacle => {
      const distance = Math.sqrt(
        Math.pow(this.boat.x - obstacle.x, 2) + 
        Math.pow(this.boat.y - obstacle.y, 2)
      );
      
      if (distance < obstacle.size + 10) {
        this.score = Math.max(0, this.score - 5);
        // 將船推開
        const pushX = (this.boat.x - obstacle.x) / distance * 20;
        const pushY = (this.boat.y - obstacle.y) / distance * 20;
        this.boat.x += pushX;
        this.boat.y += pushY;
      }
    });
    
    // 如果收集完所有物品，生成新的
    if (this.collectibles.length === 0) {
      this.generateCollectibles();
    }
  }
}
