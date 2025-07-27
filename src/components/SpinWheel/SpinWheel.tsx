import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCoins } from '@/hooks/useCoins';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface SpinReward {
  value: number;
  probability: number;
  color: string;
}

const SpinWheel = () => {
  const { addCoins } = useCoins();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<SpinReward | null>(null);
  const [timeToNextSpin, setTimeToNextSpin] = useState<number | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  
  const rewards: SpinReward[] = [
    { value: 1, probability: 0.5, color: '#4CAF50' },
    { value: 10, probability: 0.25, color: '#2196F3' },
    { value: 50, probability: 0.15, color: '#FF9800' },
    { value: 100, probability: 0.1, color: '#F44336' },
  ];

  const segments = rewards.map((reward, index) => {
    const segmentSize = 360 / rewards.length;
    const startAngle = index * segmentSize;
    const endAngle = (index + 1) * segmentSize;
    return {
      ...reward,
      startAngle,
      endAngle,
      midAngle: startAngle + segmentSize / 2
    };
  });

  useEffect(() => {
    const lastSpinTime = localStorage.getItem('lastSpinTime');
    
    if (lastSpinTime) {
      const now = new Date().getTime();
      const lastSpin = parseInt(lastSpinTime, 10);
      const timeSinceLastSpin = now - lastSpin;
      const cooldownTime = 6 * 60 * 60 * 1000;
      
      if (timeSinceLastSpin < cooldownTime) {
        setCanSpin(false);
        setTimeToNextSpin(cooldownTime - timeSinceLastSpin);
        
        const timer = setInterval(() => {
          setTimeToNextSpin(prev => {
            if (prev !== null && prev <= 1000) {
              clearInterval(timer);
              setCanSpin(true);
              return null;
            }
            return prev !== null ? prev - 1000 : null;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        setCanSpin(true);
      }
    } else {
      setCanSpin(true);
    }
  }, []);
  
  const spinWheel = () => {
    if (!canSpin || !user) return;
    
    setIsSpinning(true);
    setSpinResult(null);
    setShowWinAnimation(false);
    
    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedReward: SpinReward | null = null;
    
    for (const reward of rewards) {
      cumulativeProbability += reward.probability;
      if (rand <= cumulativeProbability) {
        selectedReward = reward;
        break;
      }
    }
    
    if (!selectedReward) selectedReward = rewards[rewards.length - 1];
    
    const segmentIndex = rewards.findIndex(reward => reward.value === selectedReward?.value);
    const segmentAngle = segments[segmentIndex].midAngle;
    const targetRotation = 1800 + (360 - segmentAngle);
    
    document.documentElement.style.setProperty('--rotation-angle', `${targetRotation}deg`);
    setRotation(prevRotation => prevRotation + targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(selectedReward);
      setShowWinAnimation(true);
      
      if (selectedReward) {
        addCoins(selectedReward.value, 'Spin Wheel');
      }
      
      const now = new Date().getTime();
      localStorage.setItem('lastSpinTime', now.toString());
      setCanSpin(false);
      setTimeToNextSpin(6 * 60 * 60 * 1000);
    }, 5000);
  };
  
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  if (!user) {
    return (
      <div className="p-6 bg-spdm-gray rounded-lg text-center">
        <h2 className="text-xl font-semibold text-spdm-green mb-3">Spin Wheel</h2>
        <p className="text-gray-400">Please login to use the Spin Wheel feature.</p>
      </div>
    );
  }
  
  return (
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
        🎰 Spin the Wheel
      </motion.h2>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative z-10">
        <div className="relative w-64 h-64">
          <motion.div 
            className="absolute w-full h-full rounded-full overflow-hidden border-4 border-sonic-blue glow-border shadow-2xl"
            animate={{ scale: isSpinning ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
          >
            <motion.div 
              className="w-full h-full transition-transform duration-[5s] ease-out"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              {segments.map((segment, index) => (
                <div 
                  key={index}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    transform: `rotate(${segment.startAngle}deg)`,
                    transformOrigin: 'center',
                    clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)`,
                    backgroundColor: segment.color
                  }}
                >
                  <motion.div 
                    className="absolute top-[15%] left-1/2 transform -translate-x-1/2 text-sm font-bold text-black"
                    style={{ transform: `translateX(-50%) rotate(${90}deg)` }}
                    animate={{ scale: isSpinning ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
                  >
                    {segment.value} Coins
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full z-10 border-2 border-gray-800"
            animate={{ scale: isSpinning ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
          />
          
          <motion.div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white z-10 clip-triangle"
            animate={{ scale: isSpinning ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
          />
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            className="bg-gradient-to-br from-sonic-darker/80 to-sonic-dark/80 p-6 rounded-xl border border-sonic-blue/30 w-full max-w-xs glow-border backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sonic-blue font-bold mb-4 text-lg sonic-glow">🎁 Possible Rewards</h3>
            <ul className="space-y-2">
              {rewards.map((reward, index) => (
                <motion.li 
                  key={index} 
                  className="flex justify-between items-center p-2 rounded-lg bg-sonic-blue/5 border border-sonic-blue/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-white font-semibold">{reward.value} Coins</span>
                  <span className="text-sonic-blue text-sm">{reward.probability * 100}% chance</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <AnimatePresence>
            {spinResult && showWinAnimation && (
              <motion.div 
                className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg text-center max-w-xs w-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <motion.h3 
                  className="text-green-400 font-medium mb-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  You won!
                </motion.h3>
                <p className="text-2xl font-bold text-white">
                  <motion.span 
                    className="text-spdm-green"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {spinResult.value}
                  </motion.span> Coins
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            onClick={spinWheel}
            disabled={!canSpin || isSpinning}
            className={`w-full max-w-xs font-medium text-lg py-3 ${
              canSpin && !isSpinning
                ? 'bg-gradient-to-r from-sonic-blue to-sonic-electric hover:from-sonic-darkBlue hover:to-sonic-blue text-white glow-border shadow-lg'
                : 'bg-gray-700 cursor-not-allowed text-gray-300'
            }`}
          >
            {isSpinning ? 'Spinning...' : canSpin ? 'Spin the Wheel' : 'On Cooldown'}
          </Button>
          
          {!canSpin && timeToNextSpin !== null && (
            <motion.p 
              className="text-sm text-sonic-blue/70 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Next spin available in: <span className="text-sonic-blue font-bold">{formatTimeRemaining(timeToNextSpin)}</span>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;