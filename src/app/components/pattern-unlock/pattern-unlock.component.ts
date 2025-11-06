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
  totalScore = 0;
  level = 1;

  canvasWidth = 300;
  canvasHeight = 300;
  dotRadius = 40;
  gridSize = 3;

  messageColor = '#333';
  messageText = '繪製圖案來解鎖';

  isPlayingDemo = false;
  demoPattern: number[] = [];
  demoLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  userCanDraw = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeDots();
    this.gameStartTime = Date.now();
    // 遊戲開始時播放示範
    setTimeout(() => this.playDemo(), 500);
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
    if (this.isGameOver || this.isPlayingDemo || !this.userCanDraw) return;

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
      this.totalScore += this.score;

      // 顯示成功和下一個等級的信息
      setTimeout(() => {
        this.messageText = `✓ 恭喜！等級 ${this.level} 完成！準備進入等級 ${this.level + 1}...`;
        this.messageColor = '#4CAF50';
        this.updateCanvas();

        // 延遲後進入下一等級
        setTimeout(() => this.nextLevel(), 2000);
      }, 1000);
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
    this.level = 1;
    this.gridSize = 3;
    this.dotRadius = 40;
    this.totalScore = 0;
    this.attempts = 0;
    this.isGameOver = false;
    this.isWon = false;
    this.score = 0;
    this.gameStartTime = Date.now();
    this.selectedDots = [];
    this.lines = [];
    this.maxAttempts = 5;
    this.initializeDots();
    this.generateNewPattern();
    this.dots.forEach(dot => dot.isSelected = false);
    this.messageText = '繪製圖案來解鎖';
    this.messageColor = '#333';
    this.userCanDraw = true;
    this.updateCanvas();
    // 重新開始時播放示範
    setTimeout(() => this.playDemo(), 500);
  }

  playDemo() {
    this.isPlayingDemo = true;
    this.userCanDraw = false;
    this.messageText = '🎬 示範中...';
    this.messageColor = '#2196F3';
    this.demoPattern = [...this.correctPattern];
    this.demoLines = [];

    const delayBetweenDots = 400; // 每個點之間的延遲時間（毫秒）
    let currentIndex = 0;

    const playNextDot = () => {
      if (currentIndex < this.demoPattern.length) {
        const dotId = this.demoPattern[currentIndex];
        const dot = this.dots[dotId];

        // 添加線條
        if (currentIndex > 0) {
          const prevDot = this.dots[this.demoPattern[currentIndex - 1]];
          this.demoLines.push({
            x1: prevDot.x,
            y1: prevDot.y,
            x2: dot.x,
            y2: dot.y
          });
        }

        this.drawDemo();
        currentIndex++;
        setTimeout(playNextDot, delayBetweenDots);
      } else {
        // 示範完成
        this.isPlayingDemo = false;
        this.userCanDraw = true;
        this.messageText = '✓ 示範完成，現在輪到你！';
        this.messageColor = '#4CAF50';
        this.demoPattern = [];
        this.demoLines = [];
        this.updateCanvas();

        // 3秒後提示用戶開始繪製
        setTimeout(() => {
          this.messageText = '現在請繪製相同的圖案（等級 ' + this.level + '）';
          this.messageColor = '#333';
          this.updateCanvas();
        }, 2000);
      }
    };

    playNextDot();
  }

  drawDemo() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 繪製網格背景
    this.drawGridBackground(ctx);

    // 繪製示範線條
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 3;
    for (const line of this.demoLines) {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    }

    // 繪製所有點，示範中的點用不同顏色
    for (const dot of this.dots) {
      const isDemoDot = this.demoLines.length > 0 && this.demoLines.some(line =>
        (line.x1 === dot.x && line.y1 === dot.y) || (line.x2 === dot.x && line.y2 === dot.y)
      );
      ctx.fillStyle = isDemoDot ? '#FF9800' : '#E0E0E0';
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, this.dotRadius, 0, 2 * Math.PI);
      ctx.fill();

      if (isDemoDot) {
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }

  nextLevel() {
    this.level++;
    this.gridSize++;
    this.dotRadius = Math.max(25, 40 - this.level * 2);

    // 增加最大嘗試次數
    this.maxAttempts = 5 + Math.floor(this.level / 2);

    // 重新初始化點和圖案
    this.initializeDots();
    this.generateNewPattern();

    // 重置遊戲狀態
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
    this.userCanDraw = true;
    this.updateCanvas();

    // 播放示範
    setTimeout(() => this.playDemo(), 500);
  }

  generateNewPattern() {
    // 根據等級和格子大小生成新的隨機圖案
    const totalDots = this.gridSize * this.gridSize;
    const patternLength = Math.min(5 + this.level, totalDots);

    const pattern: number[] = [];
    const usedDots = new Set<number>();

    // 第一個點隨機選擇
    let firstDot = Math.floor(Math.random() * totalDots);
    pattern.push(firstDot);
    usedDots.add(firstDot);

    // 生成剩餘的圖案點
    while (pattern.length < patternLength) {
      let nextDot: number;
      let attempts = 0;

      do {
        nextDot = Math.floor(Math.random() * totalDots);
        attempts++;
      } while ((usedDots.has(nextDot) || !this.isAdjacentOrDiagonal(pattern[pattern.length - 1], nextDot)) && attempts < 10);

      if (attempts < 10) {
        pattern.push(nextDot);
        usedDots.add(nextDot);
      } else {
        // 如果找不到相鄰的點，就隨機選擇任何未使用的點
        for (let i = 0; i < totalDots; i++) {
          if (!usedDots.has(i)) {
            pattern.push(i);
            usedDots.add(i);
            break;
          }
        }
      }
    }

    this.correctPattern = pattern;
  }

  isAdjacentOrDiagonal(dot1: number, dot2: number): boolean {
    const row1 = Math.floor(dot1 / this.gridSize);
    const col1 = dot1 % this.gridSize;
    const row2 = Math.floor(dot2 / this.gridSize);
    const col2 = dot2 % this.gridSize;

    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
  }

  getHintPattern(): string {
    return `等級 ${this.level} - 總分: ${this.totalScore}`;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
