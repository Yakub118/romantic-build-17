import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Clock, Eye, Zap, Rocket, ArrowRight } from "lucide-react";
import { ThemeProvider } from "./ThemeProvider";
import { getDefaultTheme } from "@/types/themes";
import EnhancedFloatingBackground from "./EnhancedFloatingBackground";

interface UpsellPageProps {
  reason?: 'expired' | 'views_exceeded' | 'not_found';
  partnerName?: string;
}

const UpsellPage = ({ reason = 'expired', partnerName }: UpsellPageProps) => {
  const theme = getDefaultTheme();

  const getTitle = () => {
    switch (reason) {
      case 'views_exceeded':
        return "This Love Story Got Too Popular! 👀";
      case 'expired':
        return "Your Link Has Expired 💔";
      default:
        return "This Love Story Has Ended 💔";
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'views_exceeded':
        return `Amazing! This romantic proposal has reached its view limit. ${partnerName ? partnerName + ', your' : 'Your'} love story was so captivating that everyone wanted to see it!`;
      case 'expired':
        return `This romantic microsite has reached its 24-hour time limit. ${partnerName ? partnerName + ', the' : 'The'} moment was beautiful, but time has moved on.`;
      default:
        return "This romantic link might be broken, invalid, or has been removed by the creator.";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen relative overflow-hidden">
        <EnhancedFloatingBackground theme={theme} />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Heart Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-romantic rounded-full shadow-glow-romantic mb-8"
            >
              <Heart className="w-12 h-12 text-white animate-heart-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-romantic text-primary mb-6"
            >
              {getTitle()}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-muted-foreground mb-12 max-w-lg mx-auto"
            >
              {getDescription()}
            </motion.p>

            {/* Upgrade Options */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              <Card className="glass border-white/20 hover-romantic">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-romantic text-primary">Weekly Pass</CardTitle>
                  <CardDescription>Perfect for special occasions</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-primary mb-4">₹30</div>
                  <ul className="text-sm space-y-2 mb-6 text-left">
                    <li className="flex items-center">
                      <Clock className="w-4 h-4 text-primary mr-2" />
                      7 days live time
                    </li>
                    <li className="flex items-center">
                      <Eye className="w-4 h-4 text-primary mr-2" />
                      Unlimited views
                    </li>
                    <li className="flex items-center">
                      <Heart className="w-4 h-4 text-primary mr-2" />
                      No advertisements
                    </li>
                  </ul>
                  <Button variant="romantic" className="w-full">
                    Upgrade Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-white/20 hover-romantic">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">
                    <Rocket className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-romantic text-primary">Deploy Forever</CardTitle>
                  <CardDescription>Your own permanent hosting</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-primary mb-4">₹100</div>
                  <ul className="text-sm space-y-2 mb-6 text-left">
                    <li className="flex items-center">
                      <Rocket className="w-4 h-4 text-primary mr-2" />
                      Deploy to Vercel/Netlify
                    </li>
                    <li className="flex items-center">
                      <Heart className="w-4 h-4 text-primary mr-2" />
                      No expiry date
                    </li>
                    <li className="flex items-center">
                      <Zap className="w-4 h-4 text-primary mr-2" />
                      2 deploy slots
                    </li>
                  </ul>
                  <Button variant="secondary" className="w-full">
                    Get Forever Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground">
                Create your own beautiful love microsite that lasts forever 💌
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = '/'}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  Create New Microsite ✨
                </Button>
                
                <Button
                  variant="romantic"
                  size="lg"
                  onClick={() => window.location.href = '/pricing'}
                  className="shadow-glow-romantic"
                >
                  View All Plans 💖
                </Button>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute inset-0 overflow-hidden pointer-events-none"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 100, x: Math.random() * window.innerWidth, opacity: 0 }}
                  animate={{ 
                    y: -100, 
                    x: Math.random() * window.innerWidth,
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 4 + Math.random() * 2,
                    delay: Math.random() * 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute text-2xl"
                >
                  💖
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default UpsellPage;