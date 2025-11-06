import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Dot {
  id: number;
  x: number;
  y: number;
  isSelected: boolean;
}

@Component({
  selector: 'app-pattern-unlock',
  imports: [CommonModule],
  templateUrl: './pattern-unlock.component.html',
  styleUrls: ['./pattern-unlock.component.css']
})
export class PatternUnlockComponent implements OnInit {
  dots: Dot[] = [];
  selectedDots: number[] = [];
  lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  isDrawing = false;
  correctPattern: number[] = [0, 1, 2, 5, 8, 7, 6, 3];
  attempts = 0;
  maxAttempts = 5;
  isGameOver = false;
  isWon = false;
  score = 0;
  gameStartTime = 0;

  canvasWidth = 300;
  canvasHeight = 300;
  dotRadius = 40;
  gridSize = 3;

  messageColor = '#333';
  messageText = '繪製圖案來解鎖';

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeDots();
    this.gameStartTime = Date.now();
  }

  initializeDots() {
    this.dots = [];
    const spacing = this.canvasWidth / (this.gridSize + 1);

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        this.dots.push({
          id: i * this.gridSize + j,
          x: spacing * (j + 1),
          y: spacing * (i + 1),
          isSelected: false
        });
      }
    }
  }

  onMouseDown(event: MouseEvent) {
    if (this.isGameOver) return;

    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const dot = this.dots.find(d => {
      const distance = Math.sqrt(Math.pow(d.x - x, 2) + Math.pow(d.y - y, 2));
      return distance <= this.dotRadius;
    });

    if (dot && !dot.isSelected) {
      this.isDrawing = true;
      this.selectDot(dot);
      this.updateCanvas();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing || this.isGameOver) return;

    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 檢查是否經過新的點
    const dot = this.dots.find(d => {
      const distance = Math.sqrt(Math.pow(d.x - x, 2) + Math.pow(d.y - y, 2));
      return distance <= this.dotRadius && !d.isSelected;
    });

    if (dot) {
      this.selectDot(dot);
    }

    // 更新臨時線條
    if (this.selectedDots.length > 0) {
      const lastDot = this.dots[this.selectedDots[this.selectedDots.length - 1]];
      this.updateCanvasWithTempLine(lastDot.x, lastDot.y, x, y);
    }
  }

  onMouseUp() {
    if (!this.isDrawing || this.isGameOver) return;

    this.isDrawing = false;
    this.validatePattern();
    this.updateCanvas();
  }

  selectDot(dot: Dot) {
    dot.isSelected = true;
    this.selectedDots.push(dot.id);

    // 如果不是第一個點，添加線條
    if (this.selectedDots.length > 1) {
      const prevDot = this.dots[this.selectedDots[this.selectedDots.length - 2]];
      this.lines.push({
        x1: prevDot.x,
        y1: prevDot.y,
        x2: dot.x,
        y2: dot.y
      });
    }
  }

  validatePattern() {
    if (this.selectedDots.length === 0) return;

    this.attempts++;

    if (this.selectedDots.length === this.correctPattern.length &&
        this.selectedDots.every((dot, idx) => dot === this.correctPattern[idx])) {
      this.isWon = true;
      this.isGameOver = true;
      this.messageText = '✓ 解鎖成功！';
      this.messageColor = '#4CAF50';

      const timeTaken = Math.floor((Date.now() - this.gameStartTime) / 1000);
      this.score = Math.max(1000 - this.attempts * 100 - timeTaken * 10, 0);
    } else {
      this.messageText = `✗ 錯誤！嘗試次數: ${this.attempts}/${this.maxAttempts}`;
      this.messageColor = '#F44336';

      if (this.attempts >= this.maxAttempts) {
        this.isGameOver = true;
        this.messageText = '✗ 遊戲結束，次數已用盡！';
      }

      // 1.5秒後重置
      setTimeout(() => this.resetPattern(), 1500);
    }
  }

  resetPattern() {
    this.selectedDots = [];
    this.lines = [];
    this.dots.forEach(dot => dot.isSelected = false);
    if (!this.isGameOver) {
      this.messageText = '繪製圖案來解鎖';
      this.messageColor = '#333';
    }
    this.updateCanvas();
  }

  updateCanvas() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 繪製網格背景
    this.drawGridBackground(ctx);

    // 繪製線條
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    for (const line of this.lines) {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    }

    // 繪製點
    for (const dot of this.dots) {
      ctx.fillStyle = dot.isSelected ? '#2196F3' : '#E0E0E0';
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, this.dotRadius, 0, 2 * Math.PI);
      ctx.fill();

      if (dot.isSelected) {
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }

  updateCanvasWithTempLine(x1: number, y1: number, x2: number, y2: number) {
    this.updateCanvas();

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    // 繪製臨時線條
    ctx.strokeStyle = '#90CAF9';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawGridBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.strokeStyle = '#BDBDBD';
    ctx.lineWidth = 1;
    const spacing = this.canvasWidth / (this.gridSize + 1);

    for (let i = 1; i <= this.gridSize; i++) {
      for (let j = 1; j <= this.gridSize; j++) {
        ctx.strokeRect(
          spacing * j - 30,
          spacing * i - 30,
          60,
          60
        );
      }
    }
  }

  resetGame() {
    this.attempts = 0;
    this.isGameOver = false;
    this.isWon = false;
    this.score = 0;
    this.gameStartTime = Date.now();
    this.selectedDots = [];
    this.lines = [];
    this.dots.forEach(dot => dot.isSelected = false);
    this.messageText = '繪製圖案來解鎖';
    this.messageColor = '#333';
    this.updateCanvas();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getHintPattern(): string {
    return '提示: 按照數字順序連接 0→1→2→5→8→7→6→3';
  }
}
