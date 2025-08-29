import { useState } from 'react';
import { HomeScreen, GameMode } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { EndScreen } from './EndScreen';
import { useGameMode } from '@/hooks/useGameMode';
import { useProgressTracking } from '@/hooks/useProgressTracking';

export type GameScreen = 'home' | 'game' | 'end';

export interface PlayerData {
  name: string;
  avatarImageUrl?: string;
  stickFigureColor?: 'classic' | 'pink';
}

export interface GameState {
  currentPosition: number;
  currentLevelProgress: number;
  correctAnswers: number;
  totalQuestions: number;
  usedQuestions: Set<string>;
  gameMode: GameMode;
  selectedCategoryIds: string[];
}

export const GameContainer = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('home');
  const [playerData, setPlayerData] = useState<PlayerData>({ name: '' });
  const [gameState, setGameState] = useState<GameState>({
    currentPosition: 1,
    currentLevelProgress: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    usedQuestions: new Set(),
    gameMode: 'progress',
    selectedCategoryIds: []
  });
  
  const { initializeGameMode, gameModeState } = useGameMode();
  const { updateQuestionStatus } = useProgressTracking();

  const handleScreenChange = (screen: GameScreen) => {
    setCurrentScreen(screen);
  };

  const handlePlayerDataUpdate = (data: Partial<PlayerData>) => {
    setPlayerData(prev => ({ ...prev, ...data }));
  };

  const handleGameStateUpdate = (state: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...state }));
  };

  const handleModeSelect = async (mode: GameMode, categoryIds: string[] = []) => {
    await initializeGameMode(mode, categoryIds);
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      selectedCategoryIds: categoryIds
    }));
    setCurrentScreen('game');
  };

  const resetGame = () => {
    setGameState({
      currentPosition: 1,
      currentLevelProgress: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      usedQuestions: new Set(),
      gameMode: 'progress',
      selectedCategoryIds: []
    });
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onModeSelect={handleModeSelect} />;
      
      case 'game':
        return (
          <GameScreen
            playerData={playerData}
            gameState={gameState}
            gameModeState={gameModeState}
            onGameStateUpdate={handleGameStateUpdate}
            onGameEnd={() => handleScreenChange('end')}
            onQuestionAnswered={updateQuestionStatus}
          />
        );
      
      case 'end':
        return (
          <EndScreen
            gameState={gameState}
            playerData={playerData}
            onPlayAgain={() => {
              resetGame();
              handleScreenChange('game');
            }}
            onHome={() => {
              resetGame();
              handleScreenChange('home');
            }}
          />
        );
      
      default:
        return <HomeScreen onModeSelect={handleModeSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {renderCurrentScreen()}
      </div>
    </div>
  );
};