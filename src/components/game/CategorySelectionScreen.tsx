import React, { useState, useEffect } from 'react';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description: string;
  difficulty_level: number;
  order_index: number;
  isUnlocked: boolean;
  completedLevels: number;
  totalLevels: number;
  progress: number;
}

interface CategorySelectionScreenProps {
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  onBack: () => void;
}

export const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({
  onCategorySelect,
  onBack
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (categoriesError) throw categoriesError;

      // Load player progress if user is authenticated
      let progressData = [];
      if (user) {
        const { data, error } = await supabase
          .from('player_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        progressData = data || [];
      }

      // Calculate category progress and unlock status
      const categoriesWithProgress = categoriesData.map((category, index) => {
        const categoryProgress = progressData.find(p => p.category_id === category.id);
        const completedLevels = categoryProgress ? Math.max(0, categoryProgress.current_position - 1) : 0;
        const totalLevels = 10; // Each category has 10 levels
        const progress = Math.floor((completedLevels / totalLevels) * 100);
        
        // First category is always unlocked, others unlock when previous is completed
        let isUnlocked = index === 0; // First category always unlocked
        if (index > 0 && user) {
          const previousCategory = categoriesData[index - 1];
          const previousProgress = progressData.find(p => p.category_id === previousCategory.id);
          const previousCompletedLevels = previousProgress ? Math.max(0, previousProgress.current_position - 1) : 0;
          isUnlocked = previousCompletedLevels >= 10; // Previous category must be completed
        }
        
        return {
          ...category,
          isUnlocked,
          completedLevels,
          totalLevels,
          progress
        };
      });

      setCategories(categoriesWithProgress);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories without progress
      const defaultCategories = [
        { id: '1', name: 'Κεφάλαιο 1: Προβλήματα και Δεδομένα', description: 'Βασικές έννοιες', difficulty_level: 1, order_index: 1, isUnlocked: true, completedLevels: 0, totalLevels: 10, progress: 0 }
      ];
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColors = (index: number) => {
    const colors = [
      { 
        bg: 'from-pink-500/20 via-rose-400/20 to-red-400/20', 
        border: 'border-pink-400/30', 
        glow: 'shadow-pink-400/20',
        accent: 'text-pink-400',
        button: 'from-pink-500 to-rose-500'
      },
      { 
        bg: 'from-cyan-500/20 via-blue-400/20 to-indigo-400/20', 
        border: 'border-cyan-400/30', 
        glow: 'shadow-cyan-400/20',
        accent: 'text-cyan-400',
        button: 'from-cyan-500 to-blue-500'
      },
      { 
        bg: 'from-lime-500/20 via-green-400/20 to-emerald-400/20', 
        border: 'border-lime-400/30', 
        glow: 'shadow-lime-400/20',
        accent: 'text-lime-400',
        button: 'from-lime-500 to-green-500'
      },
      { 
        bg: 'from-purple-500/20 via-violet-400/20 to-indigo-400/20', 
        border: 'border-purple-400/30', 
        glow: 'shadow-purple-400/20',
        accent: 'text-purple-400',
        button: 'from-purple-500 to-violet-500'
      },
      { 
        bg: 'from-orange-500/20 via-amber-400/20 to-yellow-400/20', 
        border: 'border-orange-400/30', 
        glow: 'shadow-orange-400/20',
        accent: 'text-orange-400',
        button: 'from-orange-500 to-amber-500'
      }
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard glowColor="cyan" className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-exo text-lg">Φόρτωση Κεφαλαίων... 📚</p>
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
          <NeonButton variant="purple" onClick={onBack}>
            ← Επιστροφή στο Μενού
          </NeonButton>
          
          <div className="text-center">
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
              Επιλέξτε Κεφάλαιο
            </h1>
            <p className="text-white/70 font-exo">
              Κάθε κεφάλαιο περιέχει 10 πίστες με ασκήσεις συμπλήρωσης κενών
            </p>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const colors = getCategoryColors(index);
            const isLocked = !category.isUnlocked;
            
            return (
              <div key={category.id} className="relative">
                {/* Category Card */}
                <div 
                  className={`
                    relative bg-gradient-to-br ${colors.bg} 
                    ${colors.border} border-2 rounded-2xl p-6 
                    backdrop-blur-sm transition-all duration-300
                    ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                    ${colors.glow} shadow-2xl
                  `}
                  onClick={() => !isLocked && onCategorySelect(category.id, category.name)}
                >
                  {/* Lock overlay for locked categories */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <p className="text-white/80 font-exo text-sm">Κλειδωμένο</p>
                      </div>
                    </div>
                  )}

                  {/* Chapter Number Badge */}
                  <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-br from-white/90 to-white/70 flex items-center justify-center shadow-lg">
                    <span className="font-orbitron font-bold text-gray-800">
                      {category.order_index}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className={`font-orbitron font-bold text-lg ${colors.accent} mb-2`}>
                        {category.name}
                      </h3>
                      <p className="text-white/80 font-exo text-sm">
                        {category.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Πρόοδος</span>
                        <span className={colors.accent}>
                          {category.completedLevels}/{category.totalLevels}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${colors.button} transition-all duration-500`}
                          style={{ width: `${category.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Difficulty Stars */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-sm font-exo">Δυσκολία:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span 
                            key={i} 
                            className={i < category.difficulty_level ? colors.accent : 'text-white/30'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Play Button */}
                    {!isLocked && (
                      <button 
                        className={`
                          w-full py-3 px-4 rounded-xl 
                          bg-gradient-to-r ${colors.button} 
                          text-white font-exo font-bold
                          hover:shadow-lg transition-all duration-300
                          hover:scale-105
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCategorySelect(category.id, category.name);
                        }}
                      >
                        {category.completedLevels === 0 ? '🎮 Ξεκίνα' : '📚 Συνέχεια'}
                      </button>
                    )}
                  </div>

                  {/* Completion Badge */}
                  {category.completedLevels === category.totalLevels && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
                      <span className="text-lg">🏆</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="max-w-4xl mx-auto">
          <GlassCard glowColor="cyan" className="text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {categories.filter(c => c.isUnlocked).length}
                </div>
                <div className="text-white/70 text-sm font-exo">Διαθέσιμα</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {categories.filter(c => c.completedLevels === c.totalLevels).length}
                </div>
                <div className="text-white/70 text-sm font-exo">Ολοκληρωμένα</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {categories.reduce((sum, c) => sum + c.completedLevels, 0)}
                </div>
                <div className="text-white/70 text-sm font-exo">Πίστες Τελειωμένες</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {categories.reduce((sum, c) => sum + c.totalLevels, 0)}
                </div>
                <div className="text-white/70 text-sm font-exo">Συνολικές Πίστες</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </NeonBackdrop>
  );
};