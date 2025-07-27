
import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, TrendingUp, Wallet } from "lucide-react";

const WalletDisplay = () => {
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastBalance, setLastBalance] = useState<number | null>(null);
  
  // Detect balance changes for animations
  useEffect(() => {
    if (user && lastBalance !== null && user.coins !== lastBalance) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    if (user) {
      setLastBalance(user.coins);
    }
  }, [user?.coins]);
  
  if (!user) return null;
  
  return (
    <motion.div 
      className="bg-gradient-to-br from-sonic-dark via-sonic-blue/10 to-sonic-darker border border-sonic-blue/30 rounded-xl p-6 shadow-2xl glow-border relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 150, 255, 0.3)" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-sonic-blue/5 to-transparent opacity-50"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-sonic-blue/20 to-sonic-electric/20 border border-sonic-blue/30 glow-border"
            animate={isAnimating ? { 
              rotate: 360,
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 20px rgba(0, 150, 255, 0.3)",
                "0 0 40px rgba(0, 150, 255, 0.6)",
                "0 0 20px rgba(0, 150, 255, 0.3)"
              ]
            } : {}}
            transition={{ duration: 0.8 }}
          >
            <Wallet className="w-8 h-8 text-sonic-blue" />
          </motion.div>
          <div>
            <motion.p 
              className="text-sm text-sonic-blue/80 font-medium mb-1"
              animate={{ 
                textShadow: [
                  "0 0 5px rgba(0, 150, 255, 0.5)",
                  "0 0 15px rgba(0, 150, 255, 0.8)",
                  "0 0 5px rgba(0, 150, 255, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Wallet Balance
            </motion.p>
            <div className="flex items-center space-x-2">
              <AnimatePresence mode="popLayout">
                <motion.span 
                  key={user.coins}
                  initial={{ y: -30, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1, 
                    scale: 1,
                    textShadow: [
                      "0 0 10px rgba(0, 150, 255, 0.8)",
                      "0 0 20px rgba(0, 150, 255, 1)",
                      "0 0 10px rgba(0, 150, 255, 0.8)"
                    ]
                  }}
                  exit={{ y: 30, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                  className="text-3xl font-bold text-sonic-blue sonic-glow"
                >
                  {user.coins.toLocaleString()}
                </motion.span>
              </AnimatePresence>
              <motion.div
                className="flex items-center space-x-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Coins className="w-6 h-6 text-sonic-electric" />
                <span className="text-white font-medium">coins</span>
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-3">
          <motion.div 
            className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-400/20 border border-green-400/30 glow-border"
            animate={{ 
              boxShadow: [
                "0 0 10px rgba(34, 197, 94, 0.3)",
                "0 0 20px rgba(34, 197, 94, 0.5)",
                "0 0 10px rgba(34, 197, 94, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-green-400 text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Active
            </span>
          </motion.div>
          
          {user.level !== undefined && (
            <motion.div 
              className="px-3 py-1 rounded-lg bg-sonic-blue/20 border border-sonic-blue/30"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs text-sonic-blue font-medium">
                Level <span className="text-sonic-electric font-bold">{user.level}</span>
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WalletDisplay;
