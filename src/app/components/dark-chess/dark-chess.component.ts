import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// 棋子類型
type PieceType = '帥' | '仕' | '相' | '俥' | '傌' | '炮' | '兵' | '將' | '士' | '象' | '車' | '馬' | '包' | '卒' | null;
type PieceColor = 'red' | 'black' | null;

interface ChessPiece {
  id: number;
  type: PieceType;
  color: PieceColor;
  isRevealed: boolean;
  isCaptured: boolean;
}

interface BoardCell {
  row: number;
  col: number;
  piece: ChessPiece | null;
}

@Component({
  selector: 'app-dark-chess',
  imports: [CommonModule],
  templateUrl: './dark-chess.component.html',
  styleUrls: ['./dark-chess.component.css']
})
export class DarkChessComponent implements OnInit {
  gameRunning = false;
  gameOver = false;
  winner: PieceColor = null;

  board: BoardCell[][] = [];
  selectedCell: BoardCell | null = null;
  validMoves: { row: number; col: number }[] = [];

  currentPlayer: PieceColor = 'red';
  redScore = 0;
  blackScore = 0;
  turnCount = 0;

  // 棋子階級 (用於吃子規則)
  readonly pieceRank: { [key: string]: number } = {
    '帥': 7, '將': 7,
    '仕': 6, '士': 6,
    '相': 5, '象': 5,
    '俥': 4, '車': 4,
    '傌': 3, '馬': 3,
    '炮': 2, '包': 2,
    '兵': 1, '卒': 1
  };

  // 棋子分數
  readonly pieceScore: { [key: string]: number } = {
    '帥': 100, '將': 100,
    '仕': 20, '士': 20,
    '相': 20, '象': 20,
    '俥': 40, '車': 40,
    '傌': 30, '馬': 30,
    '炮': 30, '包': 30,
    '兵': 10, '卒': 10
  };

  capturedRedPieces: ChessPiece[] = [];
  capturedBlackPieces: ChessPiece[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeGame();
  }

  initializeGame() {
    this.gameOver = false;
    this.winner = null;
    this.selectedCell = null;
    this.validMoves = [];
    this.currentPlayer = 'red';
    this.redScore = 0;
    this.blackScore = 0;
    this.turnCount = 0;
    this.capturedRedPieces = [];
    this.capturedBlackPieces = [];

    // 創建所有棋子
    const pieces: ChessPiece[] = this.createAllPieces();

    // 洗牌
    this.shuffleArray(pieces);

    // 初始化 4x8 棋盤
    this.board = [];
    let pieceIndex = 0;

    for (let row = 0; row < 4; row++) {
      const boardRow: BoardCell[] = [];
      for (let col = 0; col < 8; col++) {
        boardRow.push({
          row,
          col,
          piece: pieces[pieceIndex++]
        });
      }
      this.board.push(boardRow);
    }
  }

  createAllPieces(): ChessPiece[] {
    const pieces: ChessPiece[] = [];
    let id = 0;

    // 紅方棋子
    const redPieces: PieceType[] = ['帥', '仕', '仕', '相', '相', '俥', '俥', '傌', '傌', '炮', '炮', '兵', '兵', '兵', '兵', '兵'];
    // 黑方棋子
    const blackPieces: PieceType[] = ['將', '士', '士', '象', '象', '車', '車', '馬', '馬', '包', '包', '卒', '卒', '卒', '卒', '卒'];

    redPieces.forEach(type => {
      pieces.push({
        id: id++,
        type,
        color: 'red',
        isRevealed: false,
        isCaptured: false
      });
    });

    blackPieces.forEach(type => {
      pieces.push({
        id: id++,
        type,
        color: 'black',
        isRevealed: false,
        isCaptured: false
      });
    });

    return pieces;
  }

  shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  startGame() {
    if (this.gameRunning) return;
    this.gameRunning = true;
    this.initializeGame();
  }

  resetGame() {
    this.gameRunning = false;
    this.initializeGame();
  }

  onCellClick(cell: BoardCell) {
    if (!this.gameRunning || this.gameOver) return;

    // 如果有未翻開的棋子，翻開它
    if (cell.piece && !cell.piece.isRevealed && !cell.piece.isCaptured) {
      this.revealPiece(cell);
      return;
    }

    // 如果沒有選中的棋子
    if (!this.selectedCell) {
      // 選中自己的棋子
      if (cell.piece && cell.piece.isRevealed && !cell.piece.isCaptured && cell.piece.color === this.currentPlayer) {
        this.selectedCell = cell;
        this.calculateValidMoves(cell);
      }
      return;
    }

    // 如果點擊的是已選中的棋子，取消選中
    if (this.selectedCell === cell) {
      this.selectedCell = null;
      this.validMoves = [];
      return;
    }

    // 如果點擊的是自己的另一個棋子，切換選中
    if (cell.piece && cell.piece.isRevealed && !cell.piece.isCaptured && cell.piece.color === this.currentPlayer) {
      this.selectedCell = cell;
      this.calculateValidMoves(cell);
      return;
    }

    // 嘗試移動或吃子
    if (this.isValidMove(cell)) {
      this.makeMove(cell);
    }
  }

  revealPiece(cell: BoardCell) {
    if (cell.piece) {
      cell.piece.isRevealed = true;
      this.turnCount++;
      this.switchPlayer();
    }
  }

  calculateValidMoves(cell: BoardCell) {
    this.validMoves = [];
    if (!cell.piece || !cell.piece.isRevealed) return;

    const { row, col } = cell;
    const piece = cell.piece;

    // 炮的移動規則：可以跳過一個棋子吃掉對方棋子
    if (piece.type === '炮' || piece.type === '包') {
      // 普通移動（上下左右一格到空格）
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (this.isInBounds(newRow, newCol)) {
          const targetCell = this.board[newRow][newCol];
          if (!targetCell.piece || targetCell.piece.isCaptured) {
            this.validMoves.push({ row: newRow, col: newCol });
          }
        }
      }

      // 炮跳吃（跳過一個棋子吃掉對方）
      for (const [dr, dc] of directions) {
        let jumped = false;
        let currentRow = row + dr;
        let currentCol = col + dc;

        while (this.isInBounds(currentRow, currentCol)) {
          const targetCell = this.board[currentRow][currentCol];

          if (targetCell.piece && !targetCell.piece.isCaptured) {
            if (!jumped) {
              // 遇到第一個棋子，標記為跳板
              jumped = true;
            } else {
              // 遇到第二個棋子
              if (targetCell.piece.isRevealed && targetCell.piece.color !== piece.color) {
                this.validMoves.push({ row: currentRow, col: currentCol });
              }
              break;
            }
          }

          currentRow += dr;
          currentCol += dc;
        }
      }
    } else {
      // 其他棋子：只能移動一格（上下左右）
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (this.isInBounds(newRow, newCol)) {
          const targetCell = this.board[newRow][newCol];

          // 空格可以移動
          if (!targetCell.piece || targetCell.piece.isCaptured) {
            this.validMoves.push({ row: newRow, col: newCol });
          }
          // 對方已翻開的棋子可以嘗試吃
          else if (targetCell.piece.isRevealed && targetCell.piece.color !== piece.color) {
            if (this.canCapture(piece, targetCell.piece)) {
              this.validMoves.push({ row: newRow, col: newCol });
            }
          }
        }
      }
    }
  }

  canCapture(attacker: ChessPiece, defender: ChessPiece): boolean {
    if (!attacker.type || !defender.type) return false;

    const attackerRank = this.pieceRank[attacker.type];
    const defenderRank = this.pieceRank[defender.type];

    // 特殊規則：兵/卒可以吃帥/將
    if ((attacker.type === '兵' || attacker.type === '卒') &&
        (defender.type === '帥' || defender.type === '將')) {
      return true;
    }

    // 特殊規則：帥/將不能吃兵/卒
    if ((attacker.type === '帥' || attacker.type === '將') &&
        (defender.type === '兵' || defender.type === '卒')) {
      return false;
    }

    // 一般規則：階級高或相同可以吃
    return attackerRank >= defenderRank;
  }

  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < 4 && col >= 0 && col < 8;
  }

  isValidMove(cell: BoardCell): boolean {
    return this.validMoves.some(move => move.row === cell.row && move.col === cell.col);
  }

  makeMove(targetCell: BoardCell) {
    if (!this.selectedCell || !this.selectedCell.piece) return;

    const movingPiece = this.selectedCell.piece;

    // 如果目標格有棋子（吃子）
    if (targetCell.piece && !targetCell.piece.isCaptured) {
      const capturedPiece = targetCell.piece;
      capturedPiece.isCaptured = true;

      // 計算分數
      const score = this.pieceScore[capturedPiece.type!] || 0;
      if (this.currentPlayer === 'red') {
        this.redScore += score;
        this.capturedBlackPieces.push(capturedPiece);
      } else {
        this.blackScore += score;
        this.capturedRedPieces.push(capturedPiece);
      }
    }

    // 移動棋子
    targetCell.piece = movingPiece;
    this.selectedCell.piece = null;

    // 清除選中狀態
    this.selectedCell = null;
    this.validMoves = [];
    this.turnCount++;

    // 檢查遊戲是否結束
    if (this.checkGameOver()) {
      this.gameOver = true;
      this.gameRunning = false;
    } else {
      this.switchPlayer();
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
  }

  checkGameOver(): boolean {
    // 檢查是否還有未翻開的棋子
    let hasUnrevealedPieces = false;
    let redPiecesAlive = 0;
    let blackPiecesAlive = 0;
    let redCanMove = false;
    let blackCanMove = false;

    for (const row of this.board) {
      for (const cell of row) {
        if (cell.piece && !cell.piece.isCaptured) {
          if (!cell.piece.isRevealed) {
            hasUnrevealedPieces = true;
          }

          if (cell.piece.color === 'red') {
            redPiecesAlive++;
            if (cell.piece.isRevealed) {
              // 檢查紅方是否可以移動
              this.calculateValidMovesForCheck(cell);
              if (this.validMoves.length > 0) {
                redCanMove = true;
              }
            }
          } else {
            blackPiecesAlive++;
            if (cell.piece.isRevealed) {
              // 檢查黑方是否可以移動
              this.calculateValidMovesForCheck(cell);
              if (this.validMoves.length > 0) {
                blackCanMove = true;
              }
            }
          }
        }
      }
    }

    this.validMoves = []; // 重置

    // 如果一方沒有棋子了，另一方獲勝
    if (redPiecesAlive === 0) {
      this.winner = 'black';
      return true;
    }
    if (blackPiecesAlive === 0) {
      this.winner = 'red';
      return true;
    }

    // 如果沒有未翻開的棋子且當前玩家無法移動，則輸
    if (!hasUnrevealedPieces) {
      if (this.currentPlayer === 'red' && !redCanMove) {
        this.winner = 'black';
        return true;
      }
      if (this.currentPlayer === 'black' && !blackCanMove) {
        this.winner = 'red';
        return true;
      }
    }

    return false;
  }

  calculateValidMovesForCheck(cell: BoardCell) {
    this.validMoves = [];
    if (!cell.piece || !cell.piece.isRevealed) return;

    const { row, col } = cell;
    const piece = cell.piece;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // 炮的檢查
    if (piece.type === '炮' || piece.type === '包') {
      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (this.isInBounds(newRow, newCol)) {
          const targetCell = this.board[newRow][newCol];
          if (!targetCell.piece || targetCell.piece.isCaptured) {
            this.validMoves.push({ row: newRow, col: newCol });
          }
        }
      }

      // 炮跳吃
      for (const [dr, dc] of directions) {
        let jumped = false;
        let currentRow = row + dr;
        let currentCol = col + dc;

        while (this.isInBounds(currentRow, currentCol)) {
          const targetCell = this.board[currentRow][currentCol];

          if (targetCell.piece && !targetCell.piece.isCaptured) {
            if (!jumped) {
              jumped = true;
            } else {
              if (targetCell.piece.isRevealed && targetCell.piece.color !== piece.color) {
                this.validMoves.push({ row: currentRow, col: currentCol });
              }
              break;
            }
          }

          currentRow += dr;
          currentCol += dc;
        }
      }
    } else {
      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (this.isInBounds(newRow, newCol)) {
          const targetCell = this.board[newRow][newCol];

          if (!targetCell.piece || targetCell.piece.isCaptured) {
            this.validMoves.push({ row: newRow, col: newCol });
          } else if (targetCell.piece.isRevealed && targetCell.piece.color !== piece.color) {
            if (this.canCapture(piece, targetCell.piece)) {
              this.validMoves.push({ row: newRow, col: newCol });
            }
          }
        }
      }
    }
  }

  getCellClass(cell: BoardCell): string {
    const classes: string[] = ['board-cell'];

    if (this.selectedCell === cell) {
      classes.push('selected');
    }

    if (this.validMoves.some(move => move.row === cell.row && move.col === cell.col)) {
      classes.push('valid-move');
    }

    return classes.join(' ');
  }

  getPieceClass(piece: ChessPiece | null): string {
    if (!piece || piece.isCaptured) return 'empty';

    const classes: string[] = ['chess-piece'];

    if (!piece.isRevealed) {
      classes.push('hidden');
    } else {
      classes.push(piece.color || '');
    }

    return classes.join(' ');
  }

  getPieceDisplay(piece: ChessPiece | null): string {
    if (!piece || piece.isCaptured) return '';
    if (!piece.isRevealed) return '?';
    return piece.type || '';
  }

  getWinnerText(): string {
    if (this.winner === 'red') return '🔴 紅方獲勝！';
    if (this.winner === 'black') return '⚫ 黑方獲勝！';
    return '';
  }

  getCurrentPlayerText(): string {
    return this.currentPlayer === 'red' ? '🔴 紅方回合' : '⚫ 黑方回合';
  }

  backToMenu() {
    this.router.navigate(['/']);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.selectedCell = null;
      this.validMoves = [];
    } else if (event.key === 'r' || event.key === 'R') {
      this.resetGame();
    }
  }
}
