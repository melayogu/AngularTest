import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'action' | 'puzzle' | 'arcade' | 'strategy';
}

@Component({
  selector: 'app-game-selector',
  imports: [CommonModule, FormsModule],
  templateUrl: './game-selector.component.html',
  styleUrls: ['./game-selector.component.css']
})
export class GameSelectorComponent {
  games: GameInfo[] = [
    {
      id: 'river-rafting',
      name: '🏊‍♂️ 漂漂河小遊戲',
      description: '操控小船在河道中收集金幣，避開障礙物',
      icon: '🚣‍♀️',
      route: '/river-rafting',
      difficulty: 'medium',
      category: 'action'
    },
    {
      id: 'snake-game',
      name: '🐍 貪吃蛇',
      description: '經典貪吃蛇遊戲，收集食物讓蛇變長',
      icon: '🐍',
      route: '/snake-game',
      difficulty: 'easy',
      category: 'arcade'
    },
    {
      id: 'memory-card',
      name: '🃏 記憶翻牌',
      description: '測試你的記憶力，翻開相同的卡片',
      icon: '🧠',
      route: '/memory-card',
      difficulty: 'medium',
      category: 'puzzle'
    },
    {
      id: 'tetris',
      name: '🧩 俄羅斯方塊',
      description: '經典俄羅斯方塊遊戲',
      icon: '⬜',
      route: '/tetris',
      difficulty: 'hard',
      category: 'puzzle'
    },
    {
      id: 'space-invaders',
      name: '🚀 太空入侵者',
      description: '射擊外星人，保衛地球',
      icon: '👾',
      route: '/space-invaders',
      difficulty: 'medium',
      category: 'action'
    },
    {
      id: 'puzzle-2048',
      name: '🔢 2048',
      description: '數字拼圖遊戲，合成到2048',
      icon: '🎯',
      route: '/puzzle-2048',
      difficulty: 'medium',
      category: 'puzzle'
    },
    {
      id: 'metro-tile-game',
      name: '🚇 台北捷運地磚',
      description: '旋轉地磚建立捷運路線，引導乘客到達出口',
      icon: '🚆',
      route: '/metro-tile-game',
      difficulty: 'medium',
      category: 'puzzle'
    }
    ,
    {
      id: 'elevator-game',
      name: '🛗 電梯上下樓',
      description: '控制電梯上下樓，挑戰你的反應力',
      icon: '🛗',
      route: '/elevator-game',
      difficulty: 'easy',
      category: 'arcade'
    },
    {
      id: 'pattern-unlock',
      name: '🔓 圖形解鎖',
      description: '透過繪製特定圖案來解鎖手機',
      icon: '🔐',
      route: '/pattern-unlock',
      difficulty: 'medium',
      category: 'puzzle'
    }
  ];

  selectedCategory: string = 'all';
  selectedDifficulty: string = 'all';

  constructor(private router: Router) {}

  get filteredGames(): GameInfo[] {
    return this.games.filter(game => {
      const categoryMatch = this.selectedCategory === 'all' || game.category === this.selectedCategory;
      const difficultyMatch = this.selectedDifficulty === 'all' || game.difficulty === this.selectedDifficulty;
      return categoryMatch && difficultyMatch;
    });
  }

  playGame(game: GameInfo) {
    this.router.navigate([game.route]);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'action': return '#E91E63';
      case 'puzzle': return '#9C27B0';
      case 'arcade': return '#2196F3';
      case 'strategy': return '#795548';
      default: return '#757575';
    }
  }
}
