import { useState } from 'react';
import { HomeScreen } from './HomeScreen';
import { PhotoUploadScreen } from './PhotoUploadScreen';
import { GameScreen } from './GameScreen';
import { EndScreen } from './EndScreen';

export type GameScreen = 'home' | 'photo-upload' | 'game' | 'end';

export interface PlayerData {
  name: string;
  avatarImageUrl?: string;
}

export interface GameState {
  currentPosition: number;
  correctAnswers: number;
  totalQuestions: number;
  usedQuestions: Set<string>;
}

export const GameContainer = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('home');
  const [playerData, setPlayerData] = useState<PlayerData>({ name: '' });
  const [gameState, setGameState] = useState<GameState>({
    currentPosition: 1,
    correctAnswers: 0,
    totalQuestions: 0,
    usedQuestions: new Set()
  });

  const handleScreenChange = (screen: GameScreen) => {
    setCurrentScreen(screen);
  };

  const handlePlayerDataUpdate = (data: Partial<PlayerData>) => {
    setPlayerData(prev => ({ ...prev, ...data }));
  };

  const handleGameStateUpdate = (state: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...state }));
  };

  const resetGame = () => {
    setGameState({
      currentPosition: 1,
      correctAnswers: 0,
      totalQuestions: 0,
      usedQuestions: new Set()
    });
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNext={() => handleScreenChange('photo-upload')} />;
      
      case 'photo-upload':
        return (
          <PhotoUploadScreen
            onNext={() => handleScreenChange('game')}
            onBack={() => handleScreenChange('home')}
            onPlayerDataUpdate={handlePlayerDataUpdate}
            playerData={playerData}
          />
        );
      
      case 'game':
        return (
          <GameScreen
            playerData={playerData}
            gameState={gameState}
            onGameStateUpdate={handleGameStateUpdate}
            onGameEnd={() => handleScreenChange('end')}
          />
        );
      
      case 'end':
        return (
          <EndScreen
            gameState={gameState}
            playerData={playerData}
            onPlayAgain={() => {
              resetGame();
              handleScreenChange('photo-upload');
            }}
            onHome={() => {
              resetGame();
              handleScreenChange('home');
            }}
          />
        );
      
      default:
        return <HomeScreen onNext={() => handleScreenChange('photo-upload')} />;
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