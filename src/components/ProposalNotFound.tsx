import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Home } from "lucide-react";
import { getDefaultTheme } from "@/types/themes";
import { ThemeProvider } from "./ThemeProvider";
import EnhancedFloatingBackground from "./EnhancedFloatingBackground";

interface ProposalNotFoundProps {
  onBackToHome?: () => void;
}

const ProposalNotFound = ({ onBackToHome }: ProposalNotFoundProps) => {
  const theme = getDefaultTheme();

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen relative overflow-hidden">
        <EnhancedFloatingBackground theme={theme} />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-romantic rounded-full shadow-glow-romantic mb-6"
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <h1 className="text-3xl md:text-4xl font-romantic text-primary mb-4">
                  This love story has ended 💔
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  This romantic link might be broken, expired, or invalid.
                  <br />
                  Ask your partner to resend the love letter 💌
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="romantic"
                  size="lg"
                  onClick={handleBackToHome}
                  className="text-lg px-8 py-4 shadow-glow-romantic"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home ✨
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ProposalNotFound;