import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Star, 
  Trophy, 
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  streakType: 'daily_post' | 'login' | 'interaction' | 'eco_points';
  nextMilestone: number;
  totalPoints: number;
}

interface StreakCounterProps {
  streakData: StreakData;
  onStreakUpdate?: (newStreak: number) => void;
  showConfetti?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  streakData,
  onStreakUpdate,
  showConfetti = true
}) => {
  const [previousStreak, setPreviousStreak] = useState(streakData.currentStreak);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (streakData.currentStreak > previousStreak) {
      setShowCelebration(true);
      
      // Check if it's a new record
      if (streakData.currentStreak > streakData.longestStreak) {
        setIsNewRecord(true);
        
        // Trigger confetti for new records
        if (showConfetti) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3B82F6', '#10B981', '#F59E0B']
          });
        }
      }
      
      onStreakUpdate?.(streakData.currentStreak);
      
      // Reset celebration after animation
      setTimeout(() => {
        setShowCelebration(false);
        setIsNewRecord(false);
      }, 3000);
    }
    
    setPreviousStreak(streakData.currentStreak);
  }, [streakData.currentStreak, previousStreak, streakData.longestStreak, showConfetti, onStreakUpdate]);

  const getStreakIcon = () => {
    switch (streakData.streakType) {
      case 'daily_post': return Calendar;
      case 'login': return Target;
      case 'interaction': return TrendingUp;
      case 'eco_points': return Star;
      default: return Flame;
    }
  };

  const getStreakColor = () => {
    if (streakData.currentStreak >= 30) return 'text-purple-500';
    if (streakData.currentStreak >= 14) return 'text-blue-500';
    if (streakData.currentStreak >= 7) return 'text-green-500';
    if (streakData.currentStreak >= 3) return 'text-orange-500';
    return 'text-orange-500';
  };

  const getStreakLevel = () => {
    if (streakData.currentStreak >= 30) return 'Legend';
    if (streakData.currentStreak >= 14) return 'Master';
    if (streakData.currentStreak >= 7) return 'Expert';
    if (streakData.currentStreak >= 3) return 'Rising';
    return 'Beginner';
  };

  const progress = (streakData.currentStreak / streakData.nextMilestone) * 100;

  const StreakIcon = getStreakIcon();

  return (
    <Card className="relative overflow-hidden hover-lift">
      {/* Animated background for celebrations */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20"
          />
        )}
      </AnimatePresence>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={showCelebration ? {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ duration: 0.6 }}
              className={`p-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 ${getStreakColor()}`}
            >
              <StreakIcon className="w-6 h-6" />
            </motion.div>
            
            <div>
              <h3 className="font-semibold text-lg">Streak</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {streakData.streakType.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className={getStreakColor()}>
            {getStreakLevel()}
          </Badge>
        </div>

        {/* Main streak counter */}
        <div className="text-center mb-4">
          <motion.div
            key={streakData.currentStreak}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block"
          >
            <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {streakData.currentStreak}
            </span>
            <span className="text-lg text-muted-foreground ml-2">days</span>
            
            {/* New record indicator */}
            <AnimatePresence>
              {isNewRecord && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-8"
                >
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                    <Trophy className="w-3 h-3 mr-1" />
                    New Record!
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress to next milestone */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress to {streakData.nextMilestone} days</span>
            <span className="text-muted-foreground">
              {streakData.nextMilestone - streakData.currentStreak} to go
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-semibold">{streakData.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{streakData.totalPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>

        {/* Celebration message */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-x-4 bottom-4 p-3 bg-primary/10 rounded-lg border border-primary/20"
            >
              <div className="text-center">
                <p className="text-sm font-medium text-primary">
                  {isNewRecord ? '🎉 New Personal Record!' : '🔥 Streak Extended!'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep up the great work!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;