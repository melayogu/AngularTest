import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
}

interface Player extends GameObject {
  speed: number;
}

interface Bullet extends GameObject {
  speed: number;
  direction: number; // 1 for up, -1 for down
}

interface Alien extends GameObject {
  speed: number;
  points: number;
  type: string;
}

interface Explosion {
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
}

@Component({
  selector: 'app-space-invaders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './space-invaders.component.html',
  styleUrls: ['./space-invaders.component.css']
})
export class SpaceInvadersComponent implements OnInit, OnDestroy {
  // 遊戲設定
  canvasWidth = 800;
  canvasHeight = 600;
  
  // 遊戲狀態
  gameRunning = false;
  gameOver = false;
  gamePaused = false;
  score = 0;
  level = 1;
  lives = 3;
  
  // 遊戲物件
  player: Player = {
    x: 375,
    y: 550,
    width: 50,
    height: 30,
    color: '#00ff00',
    active: true,
    speed: 5
  };
  
  bullets: Bullet[] = [];
  aliens: Alien[] = [];
  alienBullets: Bullet[] = [];
  explosions: Explosion[] = [];
  
  // 遊戲控制
  keys: { [key: string]: boolean } = {};
  gameLoop: any;
  lastAlienShot = 0;
  alienDirection = 1;
  alienSpeed = 1;
  alienDropDistance = 20;
  
  // 外星人類型
  alienTypes = {
    small: { points: 30, color: '#ff0000', emoji: '👾' },
    medium: { points: 20, color: '#ffff00', emoji: '🛸' },
    large: { points: 10, color: '#00ffff', emoji: '🚀' }
  };
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.initializeGame();
  }
  
  ngOnDestroy() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }
  
  // 初始化遊戲
  initializeGame() {
    this.resetPlayer();
    this.createAliens();
  }
  
  // 重置玩家
  resetPlayer() {
    this.player = {
      x: 375,
      y: 550,
      width: 50,
      height: 30,
      color: '#00ff00',
      active: true,
      speed: 5
    };
  }
  
  // 創建外星人陣列
  createAliens() {
    this.aliens = [];
    const rows = 5;
    const cols = 10;
    const alienWidth = 40;
    const alienHeight = 30;
    const spacing = 60;
    const startX = 100;
    const startY = 50;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let type: keyof typeof this.alienTypes;
        if (row === 0) type = 'small';
        else if (row <= 2) type = 'medium';
        else type = 'large';
        
        const alien: Alien = {
          x: startX + col * spacing,
          y: startY + row * spacing,
          width: alienWidth,
          height: alienHeight,
          color: this.alienTypes[type].color,
          active: true,
          speed: this.alienSpeed,
          points: this.alienTypes[type].points,
          type: type
        };
        
        this.aliens.push(alien);
      }
    }
  }
  
  // 開始遊戲
  startGame() {
    this.gameRunning = true;
    this.gameOver = false;
    this.gamePaused = false;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    
    this.initializeGame();
    this.bullets = [];
    this.alienBullets = [];
    this.explosions = [];
    
    this.gameLoop = setInterval(() => {
      if (this.gameRunning && !this.gameOver && !this.gamePaused) {
        this.update();
      }
    }, 16); // 約60fps
  }
  
  // 暫停遊戲
  pauseGame() {
    this.gamePaused = !this.gamePaused;
    
    if (!this.gamePaused && this.gameRunning && !this.gameOver) {
      this.gameLoop = setInterval(() => {
        if (this.gameRunning && !this.gameOver && !this.gamePaused) {
          this.update();
        }
      }, 16);
    } else {
      if (this.gameLoop) {
        clearInterval(this.gameLoop);
      }
    }
  }
  
  // 重新開始遊戲
  restartGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
    this.startGame();
  }
  
  // 遊戲更新
  update() {
    this.updatePlayer();
    this.updateBullets();
    this.updateAliens();
    this.updateAlienBullets();
    this.updateExplosions();
    this.checkCollisions();
    this.checkGameStatus();
  }
  
  // 更新玩家
  updatePlayer() {
    if (this.keys['ArrowLeft'] && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] && this.player.x < this.canvasWidth - this.player.width) {
      this.player.x += this.player.speed;
    }
  }
  
  // 更新子彈
  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.y -= bullet.speed;
      return bullet.y > 0 && bullet.active;
    });
  }
  
  // 更新外星人
  updateAliens() {
    if (this.aliens.length === 0) return;
    
    let moveDown = false;
    const activeAliens = this.aliens.filter(alien => alien.active);
    
    // 檢查是否需要改變方向
    for (let alien of activeAliens) {
      if ((alien.x <= 0 && this.alienDirection === -1) || 
          (alien.x >= this.canvasWidth - alien.width && this.alienDirection === 1)) {
        moveDown = true;
        break;
      }
    }
    
    if (moveDown) {
      this.alienDirection *= -1;
      for (let alien of activeAliens) {
        alien.y += this.alienDropDistance;
      }
    } else {
      for (let alien of activeAliens) {
        alien.x += this.alienDirection * alien.speed;
      }
    }
    
    // 外星人射擊
    this.alienShoot();
  }
  
  // 外星人射擊
  alienShoot() {
    const now = Date.now();
    if (now - this.lastAlienShot > 1000) { // 每秒射擊一次
      const activeAliens = this.aliens.filter(alien => alien.active);
      if (activeAliens.length > 0) {
        const shooter = activeAliens[Math.floor(Math.random() * activeAliens.length)];
        const bullet: Bullet = {
          x: shooter.x + shooter.width / 2,
          y: shooter.y + shooter.height,
          width: 4,
          height: 8,
          color: '#ff0000',
          active: true,
          speed: 3,
          direction: -1
        };
        this.alienBullets.push(bullet);
        this.lastAlienShot = now;
      }
    }
  }
  
  // 更新外星人子彈
  updateAlienBullets() {
    this.alienBullets = this.alienBullets.filter(bullet => {
      bullet.y += bullet.speed;
      return bullet.y < this.canvasHeight && bullet.active;
    });
  }
  
  // 更新爆炸效果
  updateExplosions() {
    this.explosions = this.explosions.filter(explosion => {
      explosion.frame++;
      return explosion.frame < explosion.maxFrames;
    });
  }
  
  // 檢查碰撞
  checkCollisions() {
    // 玩家子彈與外星人碰撞
    for (let bullet of this.bullets) {
      for (let alien of this.aliens) {
        if (bullet.active && alien.active && this.isColliding(bullet, alien)) {
          bullet.active = false;
          alien.active = false;
          this.score += alien.points;
          this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);
        }
      }
    }
    
    // 外星人子彈與玩家碰撞
    for (let bullet of this.alienBullets) {
      if (bullet.active && this.player.active && this.isColliding(bullet, this.player)) {
        bullet.active = false;
        this.lives--;
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        
        if (this.lives <= 0) {
          this.gameOver = true;
          this.gameRunning = false;
        }
      }
    }
    
    // 外星人與玩家碰撞
    for (let alien of this.aliens) {
      if (alien.active && this.player.active && this.isColliding(alien, this.player)) {
        this.gameOver = true;
        this.gameRunning = false;
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
      }
    }
  }
  
  // 碰撞檢測
  isColliding(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }
  
  // 創建爆炸效果
  createExplosion(x: number, y: number) {
    this.explosions.push({
      x: x,
      y: y,
      frame: 0,
      maxFrames: 20
    });
  }
  
  // 檢查遊戲狀態
  checkGameStatus() {
    // 檢查是否所有外星人都被消滅
    const activeAliens = this.aliens.filter(alien => alien.active);
    if (activeAliens.length === 0) {
      this.level++;
      this.alienSpeed += 0.5;
      this.createAliens();
    }
    
    // 檢查外星人是否到達底部
    for (let alien of activeAliens) {
      if (alien.y + alien.height >= this.player.y) {
        this.gameOver = true;
        this.gameRunning = false;
        break;
      }
    }
  }
  
  // 射擊
  shoot() {
    if (this.bullets.length < 3) { // 限制子彈數量
      const bullet: Bullet = {
        x: this.player.x + this.player.width / 2,
        y: this.player.y,
        width: 4,
        height: 8,
        color: '#ffff00',
        active: true,
        speed: 7,
        direction: 1
      };
      this.bullets.push(bullet);
    }
  }
  
  // 回到遊戲選擇器
  goBack() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
    this.router.navigate(['/']);
  }
  
  // 鍵盤事件處理
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.keys[event.key] = true;
    
    // P鍵可以在任何時候觸發暫停
    if (event.key === 'p' || event.key === 'P') {
      event.preventDefault();
      if (this.gameRunning && !this.gameOver) {
        this.pauseGame();
      }
      return;
    }
    
    if (!this.gameRunning || this.gameOver || this.gamePaused) return;
    
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.shoot();
        break;
    }
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.keys[event.key] = false;
  }
  
  // 獲取外星人表情符號
  getAlienEmoji(alien: Alien): string {
    return this.alienTypes[alien.type as keyof typeof this.alienTypes].emoji;
  }
  
  // 獲取物件樣式
  getObjectStyle(obj: GameObject): any {
    return {
      'position': 'absolute',
      'left.px': obj.x,
      'top.px': obj.y,
      'width.px': obj.width,
      'height.px': obj.height,
      'background-color': obj.color,
      'border': '1px solid #000'
    };
  }
  
  // 獲取爆炸樣式
  getExplosionStyle(explosion: Explosion): any {
    const scale = 1 + (explosion.frame / explosion.maxFrames);
    const opacity = 1 - (explosion.frame / explosion.maxFrames);
    
    return {
      'position': 'absolute',
      'left.px': explosion.x - 15,
      'top.px': explosion.y - 15,
      'width.px': 30,
      'height.px': 30,
      'transform': `scale(${scale})`,
      'opacity': opacity,
      'pointer-events': 'none'
    };
  }
}
