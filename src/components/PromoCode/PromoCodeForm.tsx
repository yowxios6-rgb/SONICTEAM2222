
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCoins } from '@/hooks/useCoins';
import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

const promoCodeSchema = z.object({
  code: z.string().min(3, { message: "Promo code must be at least 3 characters" })
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

const PromoCodeForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addCoins } = useCoins();
  
  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
    },
  });
  
  const handleSubmit = async (data: PromoCodeFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to redeem codes",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the redeem_promocode RPC function
      const { data: result, error } = await supabase.rpc('secure_redeem_promocode', {
        code_text: data.code.trim()
      });
      
      if (error) throw error;
      
      if (result.success) {
        // Success
        toast({
          title: "Success!",
          description: result.message,
          variant: "default",
        });
        
        // Reset the form
        form.reset();
        
        // Refresh the user's balance
        await addCoins(0, "refresh");
      } else {
        // Error from the function
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error redeeming promo code:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to redeem promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div 
      className="bg-gradient-to-br from-sonic-dark via-purple-900/20 to-sonic-darker border border-purple-400/30 rounded-xl p-6 shadow-2xl glow-border relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 0 30px rgba(168, 85, 247, 0.3)"
      }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center glow-border"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Gift className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <motion.h3 
              className="text-xl font-bold text-purple-400"
              animate={{ 
                textShadow: [
                  "0 0 5px rgba(168, 85, 247, 0.5)",
                  "0 0 15px rgba(168, 85, 247, 0.8)",
                  "0 0 5px rgba(168, 85, 247, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Redeem Promo Code
            </motion.h3>
            <p className="text-sm text-purple-300/70">Enter your code to claim rewards</p>
          </div>
        </div>
      
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <Input
                placeholder="Enter promo code"
                className="bg-sonic-darker/80 border-purple-400/30 focus:border-purple-400 text-white placeholder:text-purple-300/50 pr-28 h-12 text-lg font-mono glow-border"
                {...form.register("code")}
              />
              <motion.div
                className="absolute right-2 top-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-8 px-4 font-medium glow-border"
                  disabled={isSubmitting}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isSubmitting ? "Redeeming..." : "Redeem"}
                </Button>
              </motion.div>
            </div>
            {form.formState.errors.code && (
              <motion.p 
                className="mt-2 text-sm text-red-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {form.formState.errors.code.message}
              </motion.p>
            )}
          </div>
        </form>
      
        <motion.div 
          className="mt-4 p-3 bg-purple-500/10 border border-purple-400/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-purple-300/80 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Enter a valid promo code to receive coins. Each code can only be used once per account.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PromoCodeForm;
