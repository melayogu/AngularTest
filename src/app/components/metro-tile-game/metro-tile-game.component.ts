import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Position {
  x: number;
  y: number;
}

interface Tile {
  type: 'straight' | 'turn' | 'cross' | 'start' | 'end' | 'wall';
  rotation: number; // 0, 90, 180, 270 degrees
  isFixed: boolean;
  hasPath: boolean;
  position: Position;
}

@Component({
  selector: 'app-metro-tile-game',
  imports: [CommonModule],
  templateUrl: './metro-tile-game.component.html',
  styleUrls: ['./metro-tile-game.component.css']
})
export class MetroTileGameComponent implements OnInit, OnDestroy {
  gridSize = 6;
  grid: Tile[][] = [];
  playerPosition: Position = { x: 0, y: 0 };
  exitPosition: Position = { x: 5, y: 5 };
  gameWon = false;
  gameStarted = false;
  moves = 0;
  timeElapsed = 0;
  gameTimer: any;
  level = 1;

  // 台灣捷運線顏色
  metroColors = [
    '#0070BD', // 淡水信義線 (藍)
    '#D2001E', // 板南線 (紅)
    '#7A6600', // 文湖線 (褐)
    '#7CB342', // 松山新店線 (綠)
    '#FF8C00', // 中和新蘆線 (橘)
  ];

  currentColor = this.metroColors[0];

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeGame();
  }

  ngOnDestroy() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  initializeGame() {
    this.grid = [];
    this.gameWon = false;
    this.gameStarted = false;
    this.moves = 0;
    this.timeElapsed = 0;
    this.currentColor = this.metroColors[(this.level - 1) % this.metroColors.length];

    // 初始化網格
    for (let y = 0; y < this.gridSize; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x] = this.createRandomTile(x, y);
      }
    }

    // 設置起點和終點
    this.grid[0][0] = {
      type: 'start',
      rotation: 0,
      isFixed: true,
      hasPath: true,
      position: { x: 0, y: 0 }
    };

    this.grid[this.exitPosition.y][this.exitPosition.x] = {
      type: 'end',
      rotation: 0,
      isFixed: true,
      hasPath: true,
      position: { x: this.exitPosition.x, y: this.exitPosition.y }
    };

    this.playerPosition = { x: 0, y: 0 };
  }

  createRandomTile(x: number, y: number): Tile {
    const types = ['straight', 'turn', 'cross'];
    const randomType = types[Math.floor(Math.random() * types.length)] as 'straight' | 'turn' | 'cross';
    const randomRotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];

    return {
      type: randomType,
      rotation: randomRotation,
      isFixed: false,
      hasPath: false,
      position: { x, y }
    };
  }

  rotateTile(x: number, y: number) {
    if (!this.gameStarted) {
      this.startGame();
    }

    const tile = this.grid[y][x];
    if (tile.isFixed) return;

    tile.rotation = (tile.rotation + 90) % 360;
    this.moves++;
    this.checkPath();
  }

  startGame() {
    this.gameStarted = true;
    this.gameTimer = setInterval(() => {
      this.timeElapsed++;
    }, 1000);
  }

  checkPath() {
    // 重置所有地磚的路徑狀態
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x].hasPath = false;
      }
    }

    // 從起點開始檢查路徑
    const visited = new Set<string>();
    const queue: Position[] = [{ x: 0, y: 0 }];
    this.grid[0][0].hasPath = true;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const currentTile = this.grid[current.y][current.x];
      const connections = this.getTileConnections(currentTile);

      for (const direction of connections) {
        const next = this.getNextPosition(current, direction);
        if (this.isValidPosition(next)) {
          const nextTile = this.grid[next.y][next.x];
          const oppositeDirection = this.getOppositeDirection(direction);
          const nextConnections = this.getTileConnections(nextTile);

          if (nextConnections.includes(oppositeDirection)) {
            nextTile.hasPath = true;
            if (!visited.has(`${next.x},${next.y}`)) {
              queue.push(next);
            }
          }
        }
      }
    }

    // 檢查是否到達終點
    if (this.grid[this.exitPosition.y][this.exitPosition.x].hasPath) {
      this.gameWon = true;
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }
    }
  }

  getTileConnections(tile: Tile): string[] {
    const connections: string[] = [];

    switch (tile.type) {
      case 'start':
        connections.push('right');
        break;
      case 'end':
        connections.push('left');
        break;
      case 'straight':
        if (tile.rotation === 0 || tile.rotation === 180) {
          connections.push('left', 'right');
        } else {
          connections.push('up', 'down');
        }
        break;
      case 'turn':
        switch (tile.rotation) {
          case 0:
            connections.push('right', 'down');
            break;
          case 90:
            connections.push('down', 'left');
            break;
          case 180:
            connections.push('left', 'up');
            break;
          case 270:
            connections.push('up', 'right');
            break;
        }
        break;
      case 'cross':
        connections.push('up', 'down', 'left', 'right');
        break;
    }

    return connections;
  }

  getNextPosition(pos: Position, direction: string): Position {
    switch (direction) {
      case 'up': return { x: pos.x, y: pos.y - 1 };
      case 'down': return { x: pos.x, y: pos.y + 1 };
      case 'left': return { x: pos.x - 1, y: pos.y };
      case 'right': return { x: pos.x + 1, y: pos.y };
      default: return pos;
    }
  }

  getOppositeDirection(direction: string): string {
    switch (direction) {
      case 'up': return 'down';
      case 'down': return 'up';
      case 'left': return 'right';
      case 'right': return 'left';
      default: return direction;
    }
  }

  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.gridSize &&
           pos.y >= 0 && pos.y < this.gridSize;
  }

  getTileSymbol(tile: Tile): string {
    switch (tile.type) {
      case 'start':
        return '🚇'; // 捷運入口
      case 'end':
        return '🏁'; // 終點
      case 'straight':
        return tile.rotation === 0 || tile.rotation === 180 ? '═' : '║';
      case 'turn':
        switch (tile.rotation) {
          case 0: return '╚';
          case 90: return '╗';
          case 180: return '╝';
          case 270: return '╔';
          default: return '╚';
        }
      case 'cross':
        return '╬';
      default:
        return '·';
    }
  }

  nextLevel() {
    this.level++;
    this.initializeGame();
  }

  resetGame() {
    this.level = 1;
    this.initializeGame();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
