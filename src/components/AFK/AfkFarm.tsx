import { useState, useEffect } from 'react';
import { useCoins } from '@/hooks/useCoins';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MusicDialog } from './MusicDialog';

const AfkFarm = () => {
  const { coins, addCoins } = useCoins();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isActive, setIsActive] = useState(false);
  const [timePassed, setTimePassed] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(20);
  const [limitReached, setLimitReached] = useState(false);
  const [showMusicDialog, setShowMusicDialog] = useState(false);
  
  // Constants
  const COIN_RATE = 0.1; // 0.1 coins per minute
  const COIN_INTERVAL = 60; // 1 minute in seconds
  const MAX_DAILY_COINS = 20;
  const MUSIC_PROMPT_INTERVAL = 5 * 60; // 5 minutes in seconds
  const MIN_COIN_AMOUNT = 1; // Minimum coin amount to add
  
  // Load AFK state from localStorage on component mount
  useEffect(() => {
    if (!user) return;
    
    const storedAfkData = localStorage.getItem(`afk_farm_${user.id}`);
    if (storedAfkData) {
      const { startTime, earnedToday, lastReset } = JSON.parse(storedAfkData);
      
      // Check if we need to reset the daily limit
      const now = new Date();
      const lastResetDate = new Date(lastReset);
      if (now.toDateString() !== lastResetDate.toDateString()) {
        // New day, reset the limit
        setCoinsEarned(0);
        saveAfkState(0);
      } else {
        // Same day, restore earned amount
        setCoinsEarned(earnedToday);
        
        if (earnedToday >= MAX_DAILY_COINS) {
          setLimitReached(true);
        }
      }
    }
  }, [user]);
  
  // Timer effect for AFK farming
  useEffect(() => {
    if (!isActive || !user) return;
    
    const interval = setInterval(() => {
      setTimePassed(prev => {
        const newTime = prev + 1;
        
        // Show music dialog every MUSIC_PROMPT_INTERVAL seconds
        if (newTime % MUSIC_PROMPT_INTERVAL === 0) {
          setShowMusicDialog(true);
        }
        
        // Give coins every COIN_INTERVAL seconds
        if (newTime > 0 && newTime % COIN_INTERVAL === 0) {
          // Calculate coins to add, ensuring it's at least 1
          const coinsToAdd = Math.max(MIN_COIN_AMOUNT, Math.round(COIN_RATE * 10)); // 1 coin per minute
          const newEarned = coinsEarned + coinsToAdd;
          setCoinsEarned(newEarned);
          saveAfkState(newEarned);
          
          // Add coins to balance
          addCoins(coinsToAdd, 'AFK Farm');
          
          // Check if limit reached
          if (newEarned >= MAX_DAILY_COINS) {
            setLimitReached(true);
            setIsActive(false);
            toast({
              title: "Daily limit reached",
              description: "You've reached the daily limit of 20 coins from AFK farming",
            });
          }
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, timePassed, coinsEarned, user]);
  
  const saveAfkState = (earnedAmount: number) => {
    if (!user) return;
    
    const afkData = {
      startTime: new Date().toISOString(),
      earnedToday: earnedAmount,
      lastReset: new Date().toISOString(),
    };
    
    localStorage.setItem(`afk_farm_${user.id}`, JSON.stringify(afkData));
  };
  
  const toggleFarming = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to use the AFK farm",
        variant: "destructive",
      });
      return;
    }
    
    if (limitReached) {
      toast({
        title: "Limit reached",
        description: "You've reached the daily limit for AFK farming",
        variant: "destructive",
      });
      return;
    }
    
    setIsActive(!isActive);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate remaining coins
  const remainingCoins = MAX_DAILY_COINS - coinsEarned;
  
  if (!user) {
    return (
      <div className="p-6 bg-spdm-gray rounded-lg text-center">
        <h2 className="text-xl font-semibold text-spdm-green mb-3">AFK Farm</h2>
        <p className="text-gray-400">Please login to use the AFK Farm feature.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-8 bg-gradient-to-br from-sonic-dark via-sonic-blue/10 to-sonic-darker rounded-xl border border-sonic-blue/30 shadow-2xl glow-border relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-sonic-blue/5 to-transparent opacity-50"></div>
        
        <motion.h2 
          className="text-3xl font-bold text-sonic-blue text-center mb-8 sonic-glow relative z-10"
          animate={{ 
            textShadow: [
              "0 0 10px rgba(0, 150, 255, 0.8)",
              "0 0 20px rgba(0, 150, 255, 1)",
              "0 0 10px rgba(0, 150, 255, 0.8)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚡ AFK Farm
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div>
            <motion.div 
              className={`p-8 rounded-xl border ${isActive ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-400/40 glow-border shadow-2xl' : 'bg-gradient-to-br from-sonic-gray/80 to-sonic-dark/80 border-sonic-blue/20 glow-border'} flex flex-col items-center transition-all duration-300 backdrop-blur-sm`}
              whileHover={{ scale: 1.02 }}
              animate={isActive ? {
                boxShadow: [
                  "0 0 20px rgba(34, 197, 94, 0.3)",
                  "0 0 40px rgba(34, 197, 94, 0.5)",
                  "0 0 20px rgba(34, 197, 94, 0.3)"
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  {isActive ? 'Currently Farming' : 'Start AFK Farming'}
                </h3>
                <p className="text-sm text-sonic-blue/70">
                  {isActive 
                    ? 'Leave this page open to continue farming'
                    : 'Start farming to earn 0.1 coins per minute'
                  }
                </p>
              </div>
              
              {isActive && (
                <motion.div 
                  className="w-32 h-32 rounded-full border-4 border-green-400 flex items-center justify-center mb-8 glow-border"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    borderColor: ["#4ade80", "#22c55e", "#4ade80"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-3xl font-bold text-green-400">{formatTime(timePassed)}</span>
                </motion.div>
              )}
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                onClick={toggleFarming}
                className={`w-full ${
                  limitReached
                    ? 'bg-gray-700 cursor-not-allowed text-gray-300'
                    : isActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white glow-border shadow-lg'
                } text-lg py-3`}
                disabled={limitReached}
                >
                {limitReached 
                  ? 'Daily Limit Reached' 
                  : isActive 
                    ? 'Stop Farming' 
                    : 'Start Farming'
                }
                </Button>
              </motion.div>
            </motion.div>
          </div>
          
          <div>
            <motion.div 
              className="bg-gradient-to-br from-sonic-darker/80 to-sonic-dark/80 p-8 rounded-xl border border-sonic-blue/30 glow-border backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-sonic-blue mb-6 sonic-glow">📊 Your Stats</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-sonic-blue/70 mb-2 font-medium">Earned today</p>
                  <div className="bg-sonic-darker/60 rounded-xl p-4 border border-sonic-blue/20 glow-border">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{coinsEarned.toFixed(1)} / {MAX_DAILY_COINS} coins</span>
                      <span className="text-xs text-sonic-blue">{((coinsEarned / MAX_DAILY_COINS) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-sonic-darker rounded-full h-3 mt-3 border border-sonic-blue/20">
                      <div 
                        className="bg-gradient-to-r from-sonic-blue to-sonic-electric h-3 rounded-full transition-all duration-500 glow-border" 
                        style={{ width: `${(coinsEarned / MAX_DAILY_COINS) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-sonic-blue/70 mb-2 font-medium">Rate</p>
                  <div className="bg-sonic-darker/60 rounded-xl p-4 border border-sonic-blue/20 glow-border">
                    <span className="text-white font-semibold">{COIN_RATE} coins per minute</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-sonic-blue/70 mb-2 font-medium">Time to limit</p>
                  <div className="bg-sonic-darker/60 rounded-xl p-4 border border-sonic-blue/20 glow-border">
                    <span className="text-white font-semibold">
                      {limitReached 
                        ? 'Limit reached'
                        : `${Math.ceil(remainingCoins / COIN_RATE)} minutes remaining`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {limitReached && (
              <motion.div 
                className="mt-6 p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl text-center glow-border backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-yellow-400 font-bold text-lg">🎯 Daily limit reached</p>
                <p className="text-sm text-yellow-300/80 mt-2">
                  Come back tomorrow to farm more coins!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <MusicDialog 
        open={showMusicDialog} 
        onOpenChange={setShowMusicDialog} 
      />
    </>
  );
};

export default AfkFarm;