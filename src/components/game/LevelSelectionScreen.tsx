import React, { useState, useEffect } from 'react';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { LevelMap } from './LevelMap';
import { PlayerData } from './GameContainer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type MedalType = 'bronze' | 'silver' | 'gold' | null;

interface LevelData {
  id: number;
  isCompleted: boolean;
  score?: number;
  medal: MedalType;
}

interface LevelSelectionScreenProps {
  playerData: PlayerData;
  onLevelSelect: (levelNumber: number) => void;
  onBack: () => void;
}

export const LevelSelectionScreen: React.FC<LevelSelectionScreenProps> = ({
  playerData,
  onLevelSelect,
  onBack
}) => {
  const { user } = useAuth();
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLevelProgress();
  }, [user]);

  const loadLevelProgress = async () => {
    if (!user) {
      // Create default levels with only level 1 unlocked
      const defaultLevels = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        isCompleted: false,
        medal: null as MedalType
      }));
      setLevels(defaultLevels);
      setLoading(false);
      return;
    }

    try {
      // Load player progress from database
      const { data: progressData, error } = await supabase
        .from('player_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Create level data based on progress
      const levelData = Array.from({ length: 50 }, (_, i) => {
        const levelNumber = i + 1;
        // For now, use a simple scoring system based on completion
        // In a real implementation, you'd store actual scores per level
        const isCompleted = progressData?.some(p => p.current_position > levelNumber);
        const score = isCompleted ? Math.floor(60 + Math.random() * 40) : undefined; // Random score for demo
        
        let medal: MedalType = null;
        if (score) {
          if (score >= 90) medal = 'gold';
          else if (score >= 70) medal = 'silver';
          else if (score >= 50) medal = 'bronze';
        }

        return {
          id: levelNumber,
          isCompleted,
          score,
          medal
        };
      });

      setLevels(levelData);
    } catch (error) {
      console.error('Error loading level progress:', error);
      // Fallback to default levels
      const defaultLevels = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        isCompleted: false,
        medal: null as MedalType
      }));
      setLevels(defaultLevels);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSelect = (levelNumber: number) => {
    onLevelSelect(levelNumber);
  };

  if (loading) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard glowColor="cyan" className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-exo text-lg">Loading Level Map... 🗺️</p>
          </GlassCard>
        </div>
      </NeonBackdrop>
    );
  }

  return (
    <NeonBackdrop>
      <div className="min-h-screen p-4 space-y-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <NeonButton
            variant="purple"
            onClick={onBack}
          >
            ← Back to Menu
          </NeonButton>
          
          <div className="text-center">
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
              Choose Your Challenge
            </h1>
            <p className="text-white/70 font-exo">
              Select a level to start your learning adventure!
            </p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Level Map */}
        <div className="flex justify-center">
          <LevelMap
            levels={levels}
            onLevelSelect={handleLevelSelect}
            totalLevels={50}
          />
        </div>

        {/* Progress Stats */}
        <div className="max-w-4xl mx-auto">
          <GlassCard glowColor="lime" className="text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-lime-400">
                  {levels.filter(l => l.isCompleted).length}
                </div>
                <div className="text-white/70 text-sm font-exo">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {levels.filter(l => l.medal === 'gold').length}
                </div>
                <div className="text-white/70 text-sm font-exo">🥇 Gold</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-300">
                  {levels.filter(l => l.medal === 'silver').length}
                </div>
                <div className="text-white/70 text-sm font-exo">🥈 Silver</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {levels.filter(l => l.medal === 'bronze').length}
                </div>
                <div className="text-white/70 text-sm font-exo">🥉 Bronze</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </NeonBackdrop>
  );
};