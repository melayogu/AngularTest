import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Position {
  row: number;
  col: number;
}

interface ConveyorNode {
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  type: 'normal' | 'spawn' | 'exit';
  exitColor?: string;
}

interface Bomb {
  id: number;
  position: Position;
  color: string;
  direction: 'up' | 'down' | 'left' | 'right';
}

@Component({
  selector: 'app-bomb-conveyor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bomb-conveyor.component.html',
  styleUrls: ['./bomb-conveyor.component.css']
})
export class BombConveyorComponent implements OnInit, OnDestroy {
  gridSize = 8;
  grid: (ConveyorNode | null)[][] = [];
  bombs: Bomb[] = [];
  score = 0;
  lives = 3;
  gameOver = false;
  isPaused = false;

  private gameLoop: any;
  private bombIdCounter = 0;
  private spawnInterval = 3000; // 每3秒生成一個炸彈
  private lastSpawnTime = 0;

  colors = ['red', 'blue', 'green', 'yellow'];

  ngOnInit() {
    this.initializeGrid();
    this.startGame();
  }

  ngOnDestroy() {
    this.stopGame();
  }

  initializeGrid() {
    // 初始化空網格
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = null;
      }
    }

    // 設置生成點（左側中間）
    this.grid[3][0] = {
      position: { row: 3, col: 0 },
      direction: 'right',
      type: 'spawn'
    };
    this.grid[4][0] = {
      position: { row: 4, col: 0 },
      direction: 'right',
      type: 'spawn'
    };

    // 設置初始履帶路徑
    for (let col = 1; col < 7; col++) {
      this.grid[3][col] = {
        position: { row: 3, col },
        direction: 'right',
        type: 'normal'
      };
      this.grid[4][col] = {
        position: { row: 4, col },
        direction: 'right',
        type: 'normal'
      };
    }

    // 設置出口（右側）
    this.grid[1][7] = {
      position: { row: 1, col: 7 },
      direction: 'right',
      type: 'exit',
      exitColor: 'red'
    };
    this.grid[3][7] = {
      position: { row: 3, col: 7 },
      direction: 'right',
      type: 'exit',
      exitColor: 'blue'
    };
    this.grid[4][7] = {
      position: { row: 4, col: 7 },
      direction: 'right',
      type: 'exit',
      exitColor: 'green'
    };
    this.grid[6][7] = {
      position: { row: 6, col: 7 },
      direction: 'right',
      type: 'exit',
      exitColor: 'yellow'
    };

    // 添加一些轉向節點
    this.grid[3][4] = {
      position: { row: 3, col: 4 },
      direction: 'up',
      type: 'normal'
    };
    this.grid[4][4] = {
      position: { row: 4, col: 4 },
      direction: 'down',
      type: 'normal'
    };

    // 添加垂直路徑
    this.grid[2][4] = {
      position: { row: 2, col: 4 },
      direction: 'up',
      type: 'normal'
    };
    this.grid[1][4] = {
      position: { row: 1, col: 4 },
      direction: 'right',
      type: 'normal'
    };
    this.grid[1][5] = {
      position: { row: 1, col: 5 },
      direction: 'right',
      type: 'normal'
    };
    this.grid[1][6] = {
      position: { row: 1, col: 6 },
      direction: 'right',
      type: 'normal'
    };

    this.grid[5][4] = {
      position: { row: 5, col: 4 },
      direction: 'down',
      type: 'normal'
    };
    this.grid[6][4] = {
      position: { row: 6, col: 4 },
      direction: 'right',
      type: 'normal'
    };
    this.grid[6][5] = {
      position: { row: 6, col: 5 },
      direction: 'right',
      type: 'normal'
    };
    this.grid[6][6] = {
      position: { row: 6, col: 6 },
      direction: 'right',
      type: 'normal'
    };
  }

  startGame() {
    this.gameOver = false;
    this.isPaused = false;
    this.score = 0;
    this.lives = 3;
    this.bombs = [];
    this.lastSpawnTime = Date.now();

    this.gameLoop = setInterval(() => {
      if (!this.isPaused && !this.gameOver) {
        this.update();
      }
    }, 100); // 每100ms更新一次
  }

  stopGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }

  update() {
    // 生成新炸彈
    const currentTime = Date.now();
    if (currentTime - this.lastSpawnTime > this.spawnInterval) {
      this.spawnBomb();
      this.lastSpawnTime = currentTime;
    }

    // 移動炸彈
    this.moveBombs();
  }

  spawnBomb() {
    const spawnPoints = this.grid.flat().filter(node => node?.type === 'spawn');
    if (spawnPoints.length > 0) {
      const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];

      if (spawnPoint) {
        this.bombs.push({
          id: this.bombIdCounter++,
          position: { ...spawnPoint.position },
          color: color,
          direction: spawnPoint.direction
        });
      }
    }
  }

  moveBombs() {
    const bombsToRemove: number[] = [];

    for (let i = 0; i < this.bombs.length; i++) {
      const bomb = this.bombs[i];
      const nextPos = this.getNextPosition(bomb.position, bomb.direction);

      // 檢查下一個位置
      if (this.isValidPosition(nextPos)) {
        const nextNode = this.grid[nextPos.row][nextPos.col];

        if (nextNode) {
          if (nextNode.type === 'exit') {
            // 到達出口
            if (nextNode.exitColor === bomb.color) {
              this.score += 10;
            } else {
              this.lives--;
              if (this.lives <= 0) {
                this.gameOver = true;
              }
            }
            bombsToRemove.push(i);
          } else {
            // 移動到下一個節點並改變方向
            bomb.position = nextPos;
            bomb.direction = nextNode.direction;
          }
        } else {
          // 沒有履帶節點，炸彈掉落
          this.lives--;
          if (this.lives <= 0) {
            this.gameOver = true;
          }
          bombsToRemove.push(i);
        }
      } else {
        // 超出邊界
        this.lives--;
        if (this.lives <= 0) {
          this.gameOver = true;
        }
        bombsToRemove.push(i);
      }
    }

    // 移除已處理的炸彈
    for (let i = bombsToRemove.length - 1; i >= 0; i--) {
      this.bombs.splice(bombsToRemove[i], 1);
    }
  }

  getNextPosition(pos: Position, direction: string): Position {
    const next = { ...pos };
    switch (direction) {
      case 'up':
        next.row--;
        break;
      case 'down':
        next.row++;
        break;
      case 'left':
        next.col--;
        break;
      case 'right':
        next.col++;
        break;
    }
    return next;
  }

  isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < this.gridSize &&
           pos.col >= 0 && pos.col < this.gridSize;
  }

  rotateNode(row: number, col: number) {
    const node = this.grid[row][col];
    if (node && node.type === 'normal') {
      const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'right', 'down', 'left'];
      const currentIndex = directions.indexOf(node.direction);
      node.direction = directions[(currentIndex + 1) % 4];
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  restart() {
    this.stopGame();
    this.initializeGrid();
    this.startGame();
  }

  getNodeRotation(direction: string): number {
    switch (direction) {
      case 'up': return 0;
      case 'right': return 90;
      case 'down': return 180;
      case 'left': return 270;
      default: return 0;
    }
  }

  getBombAtPosition(row: number, col: number): Bomb | undefined {
    return this.bombs.find(b => b.position.row === row && b.position.col === col);
  }
}
