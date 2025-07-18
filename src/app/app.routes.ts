import { Routes } from '@angular/router';
import { GameSelectorComponent } from './components/game-selector/game-selector.component';
import { RiverRaftingComponent } from './components/river-rafting/river-rafting.component';
import { SnakeGameComponent } from './components/snake-game/snake-game.component';
import { MemoryCardComponent } from './components/memory-card/memory-card.component';
import { TetrisComponent } from './components/tetris/tetris.component';
import { SpaceInvadersComponent } from './components/space-invaders/space-invaders.component';

export const routes: Routes = [
  { path: '', component: GameSelectorComponent },
  { path: 'river-rafting', component: RiverRaftingComponent },
  { path: 'snake-game', component: SnakeGameComponent },
  { path: 'memory-card', component: MemoryCardComponent },
  { path: 'tetris', component: TetrisComponent },
  { path: 'space-invaders', component: SpaceInvadersComponent },
  // 為尚未實現的遊戲添加佔位符路由
  { path: 'puzzle-2048', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' } // 萬用路由，重定向到首頁
];
