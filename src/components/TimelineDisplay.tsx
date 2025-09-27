import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TimelineMemory {
  id: string;
  date: string;
  title: string;
  description: string;
  photoUrl?: string;
}

interface TimelineDisplayProps {
  memories: TimelineMemory[];
}

const TimelineDisplay = ({ memories }: TimelineDisplayProps) => {
  if (!memories.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="my-12"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl font-romantic text-primary mb-4 flex items-center justify-center gap-2">
          <Clock className="w-8 h-8" />
          Our Journey Together 🕰️
        </h3>
        <p className="text-muted-foreground">Every moment with you has been magical</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

        <div className="space-y-12">
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 + index * 0.3, duration: 0.8 }}
              className={`relative flex items-center ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg z-10" />

              {/* Memory card */}
              <div className={`w-5/12 ${index % 2 === 0 ? "mr-auto pr-8" : "ml-auto pl-8"}`}>
                <Card className="glass border-white/30 shadow-soft hover:shadow-glow-romantic transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                          {memory.date}
                        </span>
                      </div>
                      
                      {memory.photoUrl && (
                        <div className="flex justify-center">
                          <img
                            src={memory.photoUrl}
                            alt={memory.title}
                            className="w-24 h-24 object-cover rounded-full border-4 border-white/30 shadow-soft"
                          />
                        </div>
                      )}
                      
                      <div className="text-center space-y-2">
                        <h4 className="text-lg font-romantic text-primary">
                          {memory.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memory.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineDisplay;