import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "./WalletDisplay";
import RewardLinks from "../Rewards/RewardLinks";
import SpinWheel from "../SpinWheel/SpinWheel";
import Shop from "../Shop/Shop";
import AfkFarm from "../AFK/AfkFarm";
import Leaderboard from "../Leaderboard/Leaderboard";
import PromoCodeForm from "../PromoCode/PromoCodeForm";
import { motion } from "framer-motion";

interface DashboardProps {
  activeTab?: 'rewards' | 'spin' | 'shop' | 'afk' | 'leaderboard';
}

const Dashboard = ({ activeTab = 'rewards' }: DashboardProps) => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'rewards' | 'spin' | 'shop' | 'afk' | 'leaderboard'>(activeTab);
  
  // Update tab when activeTab prop changes
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  
  const paymentMethods = [
    {
      name: "PayPal",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png",
      description: "Fast and secure international payments"
    },
    {
      name: "Zelle",
      logo: "https://logodownload.org/wp-content/uploads/2022/03/zelle-logo-1.png",
      description: "Instant bank transfers (US only)"
    },
    {
      name: "Cash App",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Square_Cash_app_logo.svg/1200px-Square_Cash_app_logo.svg.png",
      description: "Quick and easy mobile payments"
    },
    {
      name: "BBVA México",
      logo: "https://brandemia.org/contenido/subidas/2019/04/logo-bbva-960x640.jpg",
      description: "Direct bank transfers in Mexico"
    },
    {
      name: "Oxxo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Oxxo_Logo.svg/2560px-Oxxo_Logo.svg.png",
      description: "Cash payments at any Oxxo store"
    },
    {
      name: "Free Fire Account",
      logo: "https://cdn.pixabay.com/photo/2021/08/31/18/28/garena-free-fire-6589783_1280.png",
      description: "Trade with Free Fire accounts"
    }
  ];

  const handlePaymentClick = () => {
    window.open('https://t.me/yowxios', '_blank');
  };
  
  if (!user) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-spdm-green mb-4 glow-text">Please Login to Access Dashboard</h2>
          <p className="text-gray-400">Create an account or login to access exclusive features.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-spdm-green glow-text">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <WalletDisplay />
          </div>
          <div className="md:col-span-1">
            <PromoCodeForm />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex overflow-x-auto pb-2 space-x-2">
            <TabButton 
              active={currentTab === 'rewards'} 
              onClick={() => setCurrentTab('rewards')}
              label="Free Coins"
            />
            <TabButton 
              active={currentTab === 'spin'} 
              onClick={() => setCurrentTab('spin')}
              label="Spin Wheel"
            />
            <TabButton 
              active={currentTab === 'shop'} 
              onClick={() => setCurrentTab('shop')}
              label="Shop"
            />
            <TabButton 
              active={currentTab === 'afk'} 
              onClick={() => setCurrentTab('afk')}
              label="AFK Farm"
            />
            <TabButton 
              active={currentTab === 'leaderboard'} 
              onClick={() => setCurrentTab('leaderboard')}
              label="Leaderboard"
            />
          </div>
        </div>
        
        <div className="mt-6 animate-fade-in">
          {currentTab === 'rewards' && <RewardLinks />}
          {currentTab === 'spin' && <SpinWheel />}
          {currentTab === 'shop' && <Shop />}
          {currentTab === 'afk' && <AfkFarm />}
          {currentTab === 'leaderboard' && <Leaderboard />}
        </div>

        {/* Payment Methods Section */}
        <div className="mt-12 bg-gradient-to-br from-sonic-dark via-sonic-blue/10 to-sonic-darker rounded-xl p-8 border border-sonic-blue/30 shadow-2xl glow-border relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-sonic-blue/5 to-transparent opacity-50"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 relative z-10"
          >
            <motion.h2 
              className="text-3xl font-bold text-sonic-blue mb-4 sonic-glow"
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(0, 150, 255, 0.8)",
                  "0 0 20px rgba(0, 150, 255, 1)",
                  "0 0 10px rgba(0, 150, 255, 0.8)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💳 Payment Methods
            </motion.h2>
            <p className="text-sonic-blue/70 text-lg">Choose your preferred payment method to purchase coins</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={handlePaymentClick}
                className="bg-gradient-to-br from-sonic-gray/80 to-sonic-dark/80 rounded-xl p-5 border border-sonic-blue/20 hover:border-sonic-blue/50 transition-all cursor-pointer glow-border backdrop-blur-sm"
                whileHover={{
                  boxShadow: "0 0 25px rgba(0, 150, 255, 0.3)",
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 flex items-center justify-center">
                    <img 
                      src={method.logo} 
                      alt={method.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-sonic-blue/70 text-center font-medium">
                    {method.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-center relative z-10"
          >
            <p className="text-sonic-blue/70 mb-6 text-lg">
              Need help with payment? Contact our support team
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(0, 150, 255, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://discord.gg/aJaKPWr42x', '_blank')}
              className="px-8 py-3 bg-transparent hover:bg-sonic-blue/10 border-2 border-sonic-blue text-sonic-blue font-semibold rounded-full transition-all glow-border text-lg"
            >
              Contact Support
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const TabButton = ({ active, onClick, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
      active 
        ? 'bg-spdm-green text-black shadow-md shadow-spdm-green/20' 
        : 'bg-spdm-gray text-gray-300 hover:bg-spdm-green/20 hover:text-spdm-green'
    }`}
  >
    {label}
  </button>
);

export default Dashboard;