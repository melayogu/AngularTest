import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Tile {
  id: number;
  value: number;
  x: number;
  y: number;
  merged: boolean;
  isNew: boolean;
}

interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  gameWon: boolean;
  canMove: boolean;
}

@Component({
  selector: 'app-puzzle-2048',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puzzle-2048.component.html',
  styleUrls: ['./puzzle-2048.component.css']
})
export class Puzzle2048Component implements OnInit, OnDestroy {
  // 遊戲設定
  gridSize = 4;
  tileSize = 80;
  tileSpacing = 10;
  
  // 遊戲狀態
  gameState: GameState = {
    tiles: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    gameWon: false,
    canMove: true
  };
  
  // 遊戲控制
  nextTileId = 1;
  animationDuration = 150;
  
  // 方向常數
  directions = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 }
  };
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.loadBestScore();
    this.startNewGame();
  }
  
  ngOnDestroy() {
    this.saveBestScore();
  }
  
  // 開始新遊戲
  startNewGame() {
    this.gameState = {
      tiles: [],
      score: 0,
      bestScore: this.gameState.bestScore,
      gameOver: false,
      gameWon: false,
      canMove: true
    };
    this.nextTileId = 1;
    
    // 添加兩個初始磚塊
    this.addRandomTile();
    this.addRandomTile();
  }
  
  // 添加隨機磚塊
  addRandomTile() {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) return;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    
    const newTile: Tile = {
      id: this.nextTileId++,
      value: value,
      x: randomCell.x,
      y: randomCell.y,
      merged: false,
      isNew: true
    };
    
    this.gameState.tiles.push(newTile);
    
    // 移除新磚塊標記
    setTimeout(() => {
      newTile.isNew = false;
    }, this.animationDuration);
  }
  
  // 獲取空白格子
  getEmptyCells(): {x: number, y: number}[] {
    const emptyCells: {x: number, y: number}[] = [];
    
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (!this.getTileAt(x, y)) {
          emptyCells.push({ x, y });
        }
      }
    }
    
    return emptyCells;
  }
  
  // 獲取指定位置的磚塊
  getTileAt(x: number, y: number): Tile | null {
    return this.gameState.tiles.find(tile => tile.x === x && tile.y === y) || null;
  }
  
  // 移動磚塊
  move(direction: 'left' | 'right' | 'up' | 'down') {
    if (!this.gameState.canMove || this.gameState.gameOver) return;
    
    const vector = this.directions[direction];
    const traversals = this.buildTraversals(vector);
    let moved = false;
    
    // 清除合併標記
    this.gameState.tiles.forEach(tile => tile.merged = false);
    
    traversals.x.forEach(x => {
      traversals.y.forEach(y => {
        const tile = this.getTileAt(x, y);
        if (tile) {
          const positions = this.findFarthestPosition(tile, vector);
          const next = this.getTileAt(positions.next.x, positions.next.y);
          
          if (next && next.value === tile.value && !next.merged) {
            // 合併磚塊
            const merged = {
              id: this.nextTileId++,
              value: tile.value * 2,
              x: positions.next.x,
              y: positions.next.y,
              merged: true,
              isNew: false
            };
            
            this.gameState.tiles = this.gameState.tiles.filter(t => t.id !== tile.id && t.id !== next.id);
            this.gameState.tiles.push(merged);
            this.gameState.score += merged.value;
            
            // 檢查是否達到2048
            if (merged.value === 2048 && !this.gameState.gameWon) {
              this.gameState.gameWon = true;
            }
            
            moved = true;
          } else {
            // 移動磚塊
            if (positions.farthest.x !== tile.x || positions.farthest.y !== tile.y) {
              tile.x = positions.farthest.x;
              tile.y = positions.farthest.y;
              moved = true;
            }
          }
        }
      });
    });
    
    if (moved) {
      this.gameState.canMove = false;
      setTimeout(() => {
        this.addRandomTile();
        this.gameState.canMove = true;
        this.checkGameEnd();
      }, this.animationDuration);
    }
  }
  
  // 建立遍歷順序
  buildTraversals(vector: {x: number, y: number}) {
    const traversals: { x: number[], y: number[] } = { x: [], y: [] };
    
    for (let pos = 0; pos < this.gridSize; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }
    
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
    
    return traversals;
  }
  
  // 找到最遠位置
  findFarthestPosition(tile: Tile, vector: {x: number, y: number}) {
    let previous;
    let cell = { x: tile.x, y: tile.y };
    
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.withinBounds(cell) && !this.getTileAt(cell.x, cell.y));
    
    return {
      farthest: previous,
      next: cell
    };
  }
  
  // 檢查是否在邊界內
  withinBounds(position: {x: number, y: number}): boolean {
    return position.x >= 0 && position.x < this.gridSize &&
           position.y >= 0 && position.y < this.gridSize;
  }
  
  // 檢查遊戲是否結束
  checkGameEnd() {
    if (this.getEmptyCells().length === 0) {
      if (!this.movesAvailable()) {
        this.gameState.gameOver = true;
        this.updateBestScore();
      }
    }
  }
  
  // 檢查是否還有可用移動
  movesAvailable(): boolean {
    return this.tileMatchesAvailable() || this.getEmptyCells().length > 0;
  }
  
  // 檢查是否有相鄰的相同磚塊
  tileMatchesAvailable(): boolean {
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const tile = this.getTileAt(x, y);
        if (tile) {
          for (let direction of Object.values(this.directions)) {
            const vector = direction;
            const cell = { x: x + vector.x, y: y + vector.y };
            const other = this.getTileAt(cell.x, cell.y);
            
            if (other && other.value === tile.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  
  // 繼續遊戲（2048後）
  keepPlaying() {
    this.gameState.gameWon = false;
  }
  
  // 重新開始遊戲
  restartGame() {
    this.startNewGame();
  }
  
  // 回到遊戲選擇器
  goBack() {
    this.router.navigate(['/']);
  }
  
  // 更新最佳分數
  updateBestScore() {
    if (this.gameState.score > this.gameState.bestScore) {
      this.gameState.bestScore = this.gameState.score;
      this.saveBestScore();
    }
  }
  
  // 儲存最佳分數
  saveBestScore() {
    localStorage.setItem('2048-best-score', this.gameState.bestScore.toString());
  }
  
  // 載入最佳分數
  loadBestScore() {
    const saved = localStorage.getItem('2048-best-score');
    this.gameState.bestScore = saved ? parseInt(saved) : 0;
  }
  
  // 鍵盤事件處理
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const keyMap: {[key: string]: 'left' | 'right' | 'up' | 'down'} = {
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'ArrowUp': 'up',
      'ArrowDown': 'down'
    };
    
    const direction = keyMap[event.key];
    if (direction) {
      event.preventDefault();
      this.move(direction);
    }
    
    // 重新開始遊戲
    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      this.restartGame();
    }
  }
  
  // 獲取磚塊樣式
  getTileStyle(tile: Tile): any {
    const position = {
      x: tile.x * (this.tileSize + this.tileSpacing) + this.tileSpacing,
      y: tile.y * (this.tileSize + this.tileSpacing) + this.tileSpacing
    };
    
    return {
      'position': 'absolute',
      'left.px': position.x,
      'top.px': position.y,
      'width.px': this.tileSize,
      'height.px': this.tileSize,
      'line-height.px': this.tileSize,
      'transform': tile.isNew ? 'scale(0)' : 'scale(1)',
      'transition': `all ${this.animationDuration}ms ease-in-out`
    };
  }
  
  // 獲取磚塊CSS類別
  getTileClass(tile: Tile): string {
    let classes = [`tile-${tile.value}`];
    
    if (tile.merged) {
      classes.push('tile-merged');
    }
    
    if (tile.isNew) {
      classes.push('tile-new');
    }
    
    if (tile.value > 2048) {
      classes.push('tile-super');
    }
    
    return classes.join(' ');
  }
  
  // 獲取網格背景
  getGridBackground(): any[] {
    const cells = [];
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        cells.push({
          x: x * (this.tileSize + this.tileSpacing) + this.tileSpacing,
          y: y * (this.tileSize + this.tileSpacing) + this.tileSpacing
        });
      }
    }
    return cells;
  }
  
  // 獲取網格容器樣式
  getGridContainerStyle(): any {
    const size = this.gridSize * (this.tileSize + this.tileSpacing) + this.tileSpacing;
    return {
      'width.px': size,
      'height.px': size
    };
  }
  
  // 獲取網格背景格子樣式
  getGridCellStyle(cell: any): any {
    return {
      'position': 'absolute',
      'left.px': cell.x,
      'top.px': cell.y,
      'width.px': this.tileSize,
      'height.px': this.tileSize
    };
  }
  
  // 手勢操作支援
  private touchStartX = 0;
  private touchStartY = 0;
  
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }
  
  onTouchEnd(event: TouchEvent) {
    if (event.changedTouches.length === 1) {
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;
      
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // 水平滑動
          this.move(deltaX > 0 ? 'right' : 'left');
        } else {
          // 垂直滑動
          this.move(deltaY > 0 ? 'down' : 'up');
        }
      }
    }
  }
}
