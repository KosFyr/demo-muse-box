import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerData, GameState } from './GameContainer';
import { CategorySelectionScreen } from './CategorySelectionScreen';
import { LevelSelectionScreen } from './LevelSelectionScreen';
import { SingleLevelGameScreen } from './SingleLevelGameScreen';

interface GameScreenProps {
  playerData: PlayerData;
  gameState: GameState;
  gameModeState: any;
  onGameStateUpdate: (state: Partial<GameState>) => void;
  onGameEnd: () => void;
  onQuestionAnswered: (questionId: string, categoryId: string, isCorrect: boolean) => Promise<void>;
}

export const GameScreen = ({ 
  playerData, 
  gameState, 
  gameModeState, 
  onGameStateUpdate, 
  onGameEnd, 
  onQuestionAnswered 
}: GameScreenProps) => {
  const [currentScreen, setCurrentScreen] = useState<'categorySelect' | 'levelSelect' | 'playLevel'>('categorySelect');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setCurrentScreen('levelSelect');
  };

  const handleLevelSelect = (levelNumber: number) => {
    setSelectedLevel(levelNumber);
    setCurrentScreen('playLevel');
  };

  const handleLevelComplete = (score: number, medal: 'bronze' | 'silver' | 'gold' | null) => {
    // Update game state with level completion
    onGameStateUpdate({
      currentPosition: Math.max(gameState.currentPosition, selectedLevel),
      correctAnswers: gameState.correctAnswers + Math.floor((score / 100) * 10), // Approximate
      totalQuestions: gameState.totalQuestions + 10 // Each level has 10 questions
    });
    
    // Return to level selection
    setCurrentScreen('levelSelect');
  };

  const handleBackToLevelSelection = () => {
    setCurrentScreen('levelSelect');
  };

  const handleBackToCategorySelection = () => {
    setCurrentScreen('categorySelect');
  };

  const handleBackToMenu = () => {
    onGameEnd();
  };

  if (currentScreen === 'playLevel') {
    return (
      <SingleLevelGameScreen
        playerData={playerData}
        categoryId={selectedCategory?.id}
        levelNumber={selectedLevel}
        onLevelComplete={handleLevelComplete}
        onBack={handleBackToLevelSelection}
      />
    );
  }

  if (currentScreen === 'levelSelect' && selectedCategory) {
    return (
      <LevelSelectionScreen
        playerData={playerData}
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
        onLevelSelect={handleLevelSelect}
        onBack={handleBackToCategorySelection}
      />
    );
  }

  return (
    <CategorySelectionScreen
      onCategorySelect={handleCategorySelect}
      onBack={handleBackToMenu}
    />
  );
};