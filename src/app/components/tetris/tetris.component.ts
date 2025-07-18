import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface TetrisBlock {
  x: number;
  y: number;
  color: string;
}

interface TetrisPiece {
  blocks: TetrisBlock[];
  type: string;
  rotation: number;
}

@Component({
  selector: 'app-tetris',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.css']
})
export class TetrisComponent implements OnInit, OnDestroy {
  // 遊戲設定
  boardWidth = 10;
  boardHeight = 20;
  blockSize = 30;
  
  // 遊戲狀態
  gameRunning = false;
  gameOver = false;
  score = 0;
  level = 1;
  lines = 0;
  
  // 遊戲板
  board: (string | null)[][] = [];
  
  // 當前方塊
  currentPiece: TetrisPiece | null = null;
  nextPiece: TetrisPiece | null = null;
  
  // 遊戲循環
  gameLoop: any;
  dropTime = 1000; // 毫秒
  
  // 方塊類型定義
  pieceTypes = {
    I: { blocks: [[0, 0], [1, 0], [2, 0], [3, 0]], color: '#00f0f0' },
    O: { blocks: [[0, 0], [1, 0], [0, 1], [1, 1]], color: '#f0f000' },
    T: { blocks: [[1, 0], [0, 1], [1, 1], [2, 1]], color: '#a000f0' },
    S: { blocks: [[1, 0], [2, 0], [0, 1], [1, 1]], color: '#00f000' },
    Z: { blocks: [[0, 0], [1, 0], [1, 1], [2, 1]], color: '#f00000' },
    J: { blocks: [[0, 0], [0, 1], [1, 1], [2, 1]], color: '#0000f0' },
    L: { blocks: [[2, 0], [0, 1], [1, 1], [2, 1]], color: '#f0a000' }
  };
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.initializeBoard();
    this.generateNextPiece();
    this.spawnPiece();
  }
  
  ngOnDestroy() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }
  
  // 初始化遊戲板
  initializeBoard() {
    this.board = Array(this.boardHeight).fill(null).map(() => 
      Array(this.boardWidth).fill(null)
    );
  }
  
  // 生成隨機方塊
  generatePiece(): TetrisPiece {
    const types = Object.keys(this.pieceTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const pieceData = this.pieceTypes[randomType as keyof typeof this.pieceTypes];
    
    return {
      blocks: pieceData.blocks.map(([x, y]) => ({
        x: x + Math.floor(this.boardWidth / 2) - 1,
        y: y,
        color: pieceData.color
      })),
      type: randomType,
      rotation: 0
    };
  }
  
  // 生成下一個方塊
  generateNextPiece() {
    this.nextPiece = this.generatePiece();
  }
  
  // 生成新方塊
  spawnPiece() {
    if (this.nextPiece) {
      this.currentPiece = this.nextPiece;
      this.generateNextPiece();
      
      // 檢查遊戲是否結束
      if (this.checkCollision(this.currentPiece)) {
        this.gameOver = true;
        this.gameRunning = false;
        if (this.gameLoop) {
          clearInterval(this.gameLoop);
        }
      }
    }
  }
  
  // 檢查碰撞
  checkCollision(piece: TetrisPiece): boolean {
    return piece.blocks.some(block => {
      return block.x < 0 || 
             block.x >= this.boardWidth || 
             block.y >= this.boardHeight || 
             (block.y >= 0 && this.board[block.y][block.x] !== null);
    });
  }
  
  // 移動方塊
  movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece) return false;
    
    const newPiece = {
      ...this.currentPiece,
      blocks: this.currentPiece.blocks.map(block => ({
        ...block,
        x: block.x + dx,
        y: block.y + dy
      }))
    };
    
    if (!this.checkCollision(newPiece)) {
      this.currentPiece = newPiece;
      return true;
    }
    
    return false;
  }
  
  // 旋轉方塊
  rotatePiece() {
    if (!this.currentPiece) return;
    
    const centerX = this.currentPiece.blocks.reduce((sum, block) => sum + block.x, 0) / this.currentPiece.blocks.length;
    const centerY = this.currentPiece.blocks.reduce((sum, block) => sum + block.y, 0) / this.currentPiece.blocks.length;
    
    const rotatedPiece = {
      ...this.currentPiece,
      blocks: this.currentPiece.blocks.map(block => ({
        ...block,
        x: Math.round(centerX - (block.y - centerY)),
        y: Math.round(centerY + (block.x - centerX))
      })),
      rotation: (this.currentPiece.rotation + 1) % 4
    };
    
    if (!this.checkCollision(rotatedPiece)) {
      this.currentPiece = rotatedPiece;
    }
  }
  
  // 放置方塊
  placePiece() {
    if (!this.currentPiece) return;
    
    this.currentPiece.blocks.forEach(block => {
      if (block.y >= 0) {
        this.board[block.y][block.x] = block.color;
      }
    });
    
    this.clearLines();
    this.spawnPiece();
  }
  
  // 清除完整行
  clearLines() {
    let linesCleared = 0;
    
    for (let y = this.boardHeight - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== null)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.boardWidth).fill(null));
        linesCleared++;
        y++; // 重新檢查這一行
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += linesCleared * 100 * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropTime = Math.max(50, 1000 - (this.level - 1) * 50);
    }
  }
  
  // 方塊下降
  dropPiece() {
    if (!this.movePiece(0, 1)) {
      this.placePiece();
    }
  }
  
  // 硬下降
  hardDrop() {
    if (!this.currentPiece) return;
    
    while (this.movePiece(0, 1)) {
      this.score += 2;
    }
    this.placePiece();
  }
  
  // 開始遊戲
  startGame() {
    this.gameRunning = true;
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.dropTime = 1000;
    
    this.initializeBoard();
    this.generateNextPiece();
    this.spawnPiece();
    
    this.gameLoop = setInterval(() => {
      if (this.gameRunning && !this.gameOver) {
        this.dropPiece();
      }
    }, this.dropTime);
  }
  
  // 暫停遊戲
  pauseGame() {
    this.gameRunning = !this.gameRunning;
    
    if (this.gameRunning) {
      this.gameLoop = setInterval(() => {
        if (this.gameRunning && !this.gameOver) {
          this.dropPiece();
        }
      }, this.dropTime);
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
  
  // 回到遊戲選擇器
  goBack() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
    this.router.navigate(['/']);
  }
  
  // 鍵盤事件處理
  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (!this.gameRunning || this.gameOver) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.movePiece(1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (this.movePiece(0, 1)) {
          this.score += 1;
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.rotatePiece();
        break;
      case ' ':
        event.preventDefault();
        this.hardDrop();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        this.pauseGame();
        break;
    }
  }
  
  // 獲取方塊樣式
  getBlockStyle(x: number, y: number): any {
    const boardCell = this.board[y] && this.board[y][x];
    let backgroundColor = '#333';
    
    // 檢查固定方塊
    if (boardCell) {
      backgroundColor = boardCell;
    }
    
    // 檢查當前方塊
    if (this.currentPiece) {
      const currentBlock = this.currentPiece.blocks.find(block => block.x === x && block.y === y);
      if (currentBlock) {
        backgroundColor = currentBlock.color;
      }
    }
    
    return {
      'background-color': backgroundColor,
      'border': backgroundColor === '#333' ? '1px solid #555' : '1px solid #000'
    };
  }
  
  // 獲取下一個方塊預覽
  getNextPiecePreview(): TetrisBlock[] {
    if (!this.nextPiece) return [];
    
    const minX = Math.min(...this.nextPiece.blocks.map(b => b.x));
    const minY = Math.min(...this.nextPiece.blocks.map(b => b.y));
    
    return this.nextPiece.blocks.map(block => ({
      ...block,
      x: block.x - minX,
      y: block.y - minY
    }));
  }
  
  // 獲取預覽方塊顏色
  getPreviewBlockColor(x: number, y: number): string {
    const previewBlocks = this.getNextPiecePreview();
    const block = previewBlocks.find(b => b.x === x && b.y === y);
    return block ? block.color : '#333';
  }
}
