
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCoins } from '@/hooks/useCoins';
import { useAuth } from '@/hooks/useAuth';
import Purchase from './Purchase';

interface ShopItem {
  id: string;
  name: string;
  duration: string;
  durationDays: number;
  price: number;
  description: string;
}

const Shop = () => {
  const { coins, spendCoins } = useCoins();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const shopItems: ShopItem[] = [
    {
      id: 'key_1day',
      name: '1 Day Key',
      duration: '1 Day',
      durationDays: 1,
      price: 20,
      description: 'Access to premium features for 24 hours'
    },
    {
      id: 'key_7days',
      name: '7 Days Key',
      duration: '7 Days',
      durationDays: 7,
      price: 100,
      description: 'Access to premium features for a full week'
    },
    {
      id: 'key_30days',
      name: '30 Days Key',
      duration: '30 Days',
      durationDays: 30,
      price: 500,
      description: 'Access to premium features for a month'
    },
    {
      id: 'key_1year',
      name: '1 Year Key',
      duration: '1 Year',
      durationDays: 365,
      price: 2000,
      description: 'Access to premium features for a full year'
    }
  ];
  
  const handlePurchase = (item: ShopItem) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to make a purchase",
        variant: "destructive",
      });
      return;
    }
    
    if (coins < item.price) {
      toast({
        title: "Insufficient coins",
        description: `You need ${item.price} coins to purchase this item`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedItem(item);
    setIsPurchasing(true);
  };
  
  const closePurchaseModal = () => {
    setIsPurchasing(false);
    setSelectedItem(null);
  };
  
  if (!user) {
    return (
      <div className="p-6 bg-spdm-gray rounded-lg text-center">
        <h2 className="text-xl font-semibold text-spdm-green mb-3">Shop</h2>
        <p className="text-gray-400">Please login to access the shop.</p>
      </div>
    );
  }
  
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
            🛒 Key Shop
          </motion.h2>
          <motion.div 
            className="px-6 py-2 rounded-full bg-gradient-to-r from-sonic-dark to-sonic-darker border border-sonic-blue/30 text-sonic-blue glow-border"
            animate={{ 
              boxShadow: [
                "0 0 10px rgba(0, 150, 255, 0.3)",
                "0 0 20px rgba(0, 150, 255, 0.5)",
                "0 0 10px rgba(0, 150, 255, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="font-medium">{coins}</span> coins available
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {shopItems.map((item) => (
            <motion.div 
              key={item.id}
              className="bg-gradient-to-br from-sonic-gray/80 to-sonic-dark/80 rounded-xl p-6 border border-sonic-blue/20 hover:border-sonic-blue/50 transition-all flex flex-col glow-border backdrop-blur-sm"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(0, 150, 255, 0.3)",
                y: -5
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-3">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-sonic-blue/20 to-sonic-electric/20 flex items-center justify-center border border-sonic-blue/30 glow-border"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sonic-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">{item.name}</h3>
              <p className="text-sm text-sonic-blue/70 text-center mt-1 mb-4">{item.description}</p>
              
              <div className="text-center text-3xl font-bold text-sonic-blue mt-auto mb-6 sonic-glow">
                {item.price} <span className="text-sm font-normal text-sonic-blue/70">coins</span>
              </div>
              
              <motion.button
                onClick={() => handlePurchase(item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-2 rounded-md font-medium ${
                  coins >= item.price
                    ? 'bg-gradient-to-r from-sonic-blue to-sonic-electric hover:from-sonic-darkBlue hover:to-sonic-blue text-white glow-border shadow-lg'
                    : 'bg-gray-700 cursor-not-allowed text-gray-300'
                }`}
                disabled={coins < item.price}
              >
                {coins >= item.price ? 'Purchase' : 'Not enough coins'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div 
        className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/30 glow-border backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-yellow-400 font-bold mb-2 text-lg">💡 How to get more coins</h3>
        <p className="text-sm text-yellow-300/80">
          You can earn coins by completing reward tasks, using the spin wheel, or using the AFK farm. 
          The more coins you collect, the better items you can purchase!
        </p>
      </motion.div>
      
      {isPurchasing && selectedItem && (
        <Purchase item={selectedItem} onClose={closePurchaseModal} />
      )}
    </div>
  );
};

export default Shop;
