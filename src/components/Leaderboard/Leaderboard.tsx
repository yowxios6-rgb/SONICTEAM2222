import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCoins } from '@/hooks/useCoins';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  coins: number;
  position: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const { user } = useAuth();
  const { addCoins } = useCoins();
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallets' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get users with at least 10 coins, ordered by balance
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select(`
          user_id,
          balance,
          profiles:profiles(username)
        `)
        .gte('balance', 10)
        .order('balance', { ascending: false })
        .limit(10);

      if (walletsError) throw walletsError;

      if (walletsData) {
        const formattedData = walletsData.map((entry, index) => ({
          user_id: entry.user_id,
          username: entry.profiles?.username || 'Unknown',
          coins: entry.balance,
          position: index + 1
        }));
        setLeaderboard(formattedData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimPositionReward = async () => {
    if (!user || hasClaimedReward) return;

    const userPosition = leaderboard.find(entry => entry.user_id === user.id);
    if (!userPosition) return;

    let rewardAmount = 0;
    if (userPosition.position === 1) rewardAmount = 100;
    else if (userPosition.position === 2) rewardAmount = 50;
    else if (userPosition.position === 3) rewardAmount = 25;

    if (rewardAmount > 0) {
      try {
        await addCoins(rewardAmount, `Top ${userPosition.position} Leaderboard Reward`);
        setHasClaimedReward(true);
        
        toast({
          title: "Reward Claimed!",
          description: `You received ${rewardAmount} coins for being #${userPosition.position} on the leaderboard!`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to claim reward. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-spdm-green" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30';
      default:
        return 'bg-spdm-gray/50 border-spdm-green/20';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-spdm-green"></div>
      </div>
    );
  }

  const userPosition = user ? leaderboard.find(entry => entry.user_id === user.id) : null;
  const canClaimReward = userPosition && userPosition.position <= 3 && !hasClaimedReward;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-sonic-dark via-sonic-blue/10 to-sonic-darker rounded-xl p-8 border border-sonic-blue/30 shadow-2xl glow-border relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-sonic-blue/5 to-transparent opacity-50"></div>
        
        <div className="flex justify-between items-center mb-6">
          <motion.h2 
            className="text-3xl font-bold text-sonic-blue sonic-glow"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(0, 150, 255, 0.8)",
                "0 0 20px rgba(0, 150, 255, 1)",
                "0 0 10px rgba(0, 150, 255, 0.8)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆 Top Players
          </motion.h2>
          <div className="text-sm text-sonic-blue/70">
            Updates in real-time • Min 10 coins to appear
          </div>
        </div>

        {/* Reward Info */}
        <div className="bg-gradient-to-br from-sonic-darker/80 to-sonic-dark/80 rounded-xl p-6 mb-6 border border-sonic-blue/30 glow-border backdrop-blur-sm relative z-10">
          <h3 className="text-xl font-semibold text-sonic-blue mb-4 sonic-glow">🎁 Position Rewards</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Crown className="w-8 h-8 text-yellow-400 mb-2" />
              <span className="text-yellow-400 font-bold">1st Place</span>
              <span className="text-white">100 coins</span>
            </div>
            <div className="flex flex-col items-center">
              <Trophy className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-400 font-bold">2nd Place</span>
              <span className="text-white">50 coins</span>
            </div>
            <div className="flex flex-col items-center">
              <Medal className="w-8 h-8 text-amber-600 mb-2" />
              <span className="text-amber-600 font-bold">3rd Place</span>
              <span className="text-white">25 coins</span>
            </div>
          </div>
        </div>

        {/* User's Position */}
        {userPosition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-4 border ${getPositionColor(userPosition.position)}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {getPositionIcon(userPosition.position)}
                <div>
                  <span className="text-spdm-green font-bold">Your Position: #{userPosition.position}</span>
                  <div className="text-white font-semibold">{userPosition.coins.toLocaleString()} coins</div>
                </div>
              </div>
              {canClaimReward && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={claimPositionReward}
                  className="px-4 py-2 bg-spdm-green hover:bg-spdm-darkGreen text-black font-medium rounded-lg"
                >
                  Claim Reward
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No players with 10+ coins yet</p>
              <p className="text-sm">Be the first to reach 10 coins!</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${getPositionColor(entry.position)} ${
                  user?.id === entry.user_id ? 'ring-2 ring-spdm-green' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getPositionIcon(entry.position)}
                      <span className="text-2xl font-bold text-white">#{entry.position}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {entry.username}
                        {user?.id === entry.user_id && (
                          <span className="ml-2 text-sm text-spdm-green">(You)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-spdm-green">
                      {entry.coins.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">coins</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;