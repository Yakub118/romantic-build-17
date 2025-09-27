import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface LoveLetterDisplayProps {
  letter: string;
  authorName: string;
}

const LoveLetterDisplay = ({ letter, authorName }: LoveLetterDisplayProps) => {
  if (!letter.trim()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="my-8"
    >
      <Card className="glass border-white/30 shadow-glow-romantic p-6 bg-gradient-to-br from-amber-50/10 to-orange-100/10">
        <CardContent className="p-0">
          <div className="relative">
            {/* Handwritten style background */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="lines" x="0" y="0" width="400" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="20" x2="400" y2="20" stroke="#8B5A5A" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#lines)"/>
              </svg>
            </div>
            
            {/* Letter content */}
            <div className="relative z-10 space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 2 }}
              >
                <h3 className="text-2xl font-script text-primary text-center mb-6">
                  A Letter From My Heart ✉️
                </h3>
                
                <div className="prose prose-lg prose-pink max-w-none">
                  <p className="font-script text-lg leading-relaxed text-foreground whitespace-pre-wrap text-center italic">
                    "{letter}"
                  </p>
                </div>
                
                <div className="mt-6 text-right">
                  <p className="font-script text-lg text-primary">
                    With all my love,
                  </p>
                  <p className="font-script text-xl text-primary font-medium">
                    {authorName} 💕
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoveLetterDisplay;