import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Heart } from "lucide-react";
import { getThemeById, getDefaultTheme } from "@/types/themes";
import { ThemeProvider } from "./ThemeProvider";
import EnhancedFloatingBackground from "./EnhancedFloatingBackground";

interface CountdownDisplayProps {
  targetDate: Date;
  partnerName: string;
  theme: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownDisplay = ({ targetDate, partnerName, theme }: CountdownDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  const themeObj = getThemeById(theme) || getDefaultTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        clearInterval(timer);
        // Refresh the page to show the actual proposal
        setTimeout(() => window.location.reload(), 1000);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <ThemeProvider theme={themeObj}>
        <div className="min-h-screen relative overflow-hidden">
          <EnhancedFloatingBackground theme={themeObj} />
          <div className="relative z-10 min-h-screen flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-romantic text-primary mb-4">
                The moment has arrived! ✨
              </h1>
              <p className="text-lg text-muted-foreground">Preparing your surprise...</p>
            </motion.div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={themeObj}>
      <div className="min-h-screen relative overflow-hidden">
        <EnhancedFloatingBackground theme={themeObj} />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-romantic rounded-full shadow-glow-romantic mb-8"
            >
              <Heart className="w-10 h-10 text-white animate-heart-pulse" />
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-romantic text-primary mb-6">
              Hello {partnerName}, ✨
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Something magical is waiting for you...<br />
              But it's not ready just yet 💫
            </p>

            <Card className="glass border-white/30 shadow-glow-romantic p-8 mb-8">
              <CardContent className="p-0">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-romantic text-primary">
                    Countdown to Magic
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-4 rounded-lg bg-white/10 border border-white/20"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {timeLeft.days}
                    </div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="p-4 rounded-lg bg-white/10 border border-white/20"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {timeLeft.hours}
                    </div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="p-4 rounded-lg bg-white/10 border border-white/20"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {timeLeft.minutes}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    className="p-4 rounded-lg bg-white/10 border border-white/20"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {timeLeft.seconds}
                    </div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            <p className="text-muted-foreground">
              Something very special is coming your way... 💕
            </p>
          </motion.div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default CountdownDisplay;