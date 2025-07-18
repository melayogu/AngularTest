import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-memory-card',
  imports: [CommonModule],
  templateUrl: './memory-card.component.html',
  styleUrls: ['./memory-card.component.css']
})
export class MemoryCardComponent implements OnInit, OnDestroy {
  gameRunning = false;
  gameOver = false;
  score = 0;
  moves = 0;
  matchedPairs = 0;
  gameTime = 0;
  
  cards: Card[] = [];
  flippedCards: Card[] = [];
  
  // 遊戲設定
  gridSize = 4; // 4x4 網格
  totalPairs = 8;
  
  // 計時器
  timeInterval: any;
  
  // 卡片符號
  symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.initializeGame();
  }
  
  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
  
  initializeGame() {
    this.score = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.gameTime = 0;
    this.gameOver = false;
    this.flippedCards = [];
    
    // 創建卡片
    this.cards = [];
    const selectedSymbols = this.symbols.slice(0, this.totalPairs);
    const cardSymbols = [...selectedSymbols, ...selectedSymbols]; // 每個符號兩張卡片
    
    // 洗牌
    for (let i = cardSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]];
    }
    
    // 創建卡片對象
    cardSymbols.forEach((symbol, index) => {
      this.cards.push({
        id: index,
        symbol: symbol,
        isFlipped: false,
        isMatched: false
      });
    });
  }
  
  startGame() {
    if (this.gameRunning) return;
    
    this.gameRunning = true;
    this.initializeGame();
    
    // 啟動計時器
    this.timeInterval = setInterval(() => {
      this.gameTime++;
    }, 1000);
  }
  
  resetGame() {
    this.gameRunning = false;
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    this.initializeGame();
  }
  
  backToMenu() {
    this.resetGame();
    this.router.navigate(['/']);
  }
  
  flipCard(card: Card) {
    if (!this.gameRunning || card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
      return;
    }
    
    card.isFlipped = true;
    this.flippedCards.push(card);
    
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }
  
  checkMatch() {
    const [card1, card2] = this.flippedCards;
    
    if (card1.symbol === card2.symbol) {
      // 匹配成功
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchedPairs++;
      this.score += 10;
      this.flippedCards = [];
      
      // 檢查是否遊戲結束
      if (this.matchedPairs === this.totalPairs) {
        this.endGame();
      }
    } else {
      // 不匹配，延遲翻回
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
      }, 1000);
    }
  }
  
  endGame() {
    this.gameRunning = false;
    this.gameOver = true;
    
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    
    // 計算最終分數（時間和移動次數越少分數越高）
    const timeBonus = Math.max(0, 300 - this.gameTime);
    const moveBonus = Math.max(0, 100 - this.moves);
    this.score += timeBonus + moveBonus;
  }
  
  getCardClass(card: Card): string {
    let classes = 'memory-card';
    
    if (card.isFlipped || card.isMatched) {
      classes += ' flipped';
    }
    
    if (card.isMatched) {
      classes += ' matched';
    }
    
    return classes;
  }
  
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  getDifficulty(): string {
    if (this.moves <= 20) return '完美';
    if (this.moves <= 30) return '優秀';
    if (this.moves <= 40) return '良好';
    if (this.moves <= 50) return '一般';
    return '需要練習';
  }
  
  getDifficultyColor(): string {
    if (this.moves <= 20) return '#4CAF50';
    if (this.moves <= 30) return '#8BC34A';
    if (this.moves <= 40) return '#FFC107';
    if (this.moves <= 50) return '#FF9800';
    return '#F44336';
  }
}
