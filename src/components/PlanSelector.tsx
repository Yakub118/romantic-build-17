import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Zap, Rocket, Star } from "lucide-react";

export type PlanType = "freemium" | "weekly" | "deploy";

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: "freemium",
    name: "Free",
    price: "₹0",
    description: "Perfect for trying out",
    features: [
      "Up to 3 microsites",
      "24 hours live time",
      "50 views per site",
      "Contains ads"
    ],
    icon: <Heart className="w-6 h-6" />,
    badge: "Most Popular"
  },
  {
    id: "weekly",
    name: "Weekly Pass",
    price: "₹30",
    description: "Extended time, no ads",
    features: [
      "7 days live time",
      "Unlimited views",
      "No advertisements",
      "Premium support"
    ],
    icon: <Zap className="w-6 h-6" />,
    highlighted: true
  },
  {
    id: "deploy",
    name: "Deploy Forever",
    price: "₹100",
    description: "Permanent hosting solution",
    features: [
      "2 deploy slots",
      "Deploy to Vercel/Netlify",
      "No expiry date",
      "Your own hosting",
      "No ads forever"
    ],
    icon: <Rocket className="w-6 h-6" />,
    badge: "Best Value"
  }
];

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onPlanChange: (plan: PlanType) => void;
  onProceed: () => void;
  isProcessing?: boolean;
}

const PlanSelector = ({ selectedPlan, onPlanChange, onProceed, isProcessing }: PlanSelectorProps) => {
  const [hoveredPlan, setHoveredPlan] = useState<PlanType | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-romantic text-primary mb-2">Choose Your Plan</h3>
        <p className="text-muted-foreground">Select the perfect plan for your romantic microsite</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plans.indexOf(plan) * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredPlan(plan.id)}
            onHoverEnd={() => setHoveredPlan(null)}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.id 
                  ? 'border-primary bg-primary/5 shadow-glow-romantic' 
                  : 'border-white/30 hover:border-primary/50'
              } ${plan.highlighted ? 'ring-2 ring-primary/20' : ''} glass`}
              onClick={() => onPlanChange(plan.id)}
            >
              <CardHeader className="text-center pb-4">
                {plan.badge && (
                  <Badge variant="secondary" className="self-center mb-2 bg-gradient-romantic text-white">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                )}
                
                <div className="flex justify-center mb-2">
                  <div className={`p-3 rounded-full ${
                    selectedPlan === plan.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  } transition-colors`}>
                    {plan.icon}
                  </div>
                </div>

                <CardTitle className="text-xl font-romantic">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">{plan.price}</div>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center text-sm"
                    >
                      <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {selectedPlan === plan.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4"
                  >
                    <div className="w-full h-1 bg-gradient-romantic rounded-full"></div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <Button
          onClick={onProceed}
          disabled={isProcessing}
          size="lg"
          variant={selectedPlan === "freemium" ? "romantic" : "default"}
          className="text-lg px-8 py-6 shadow-glow-romantic"
        >
          {isProcessing ? (
            "Processing..."
          ) : selectedPlan === "freemium" ? (
            "Continue with Free Plan 🚀"
          ) : selectedPlan === "weekly" ? (
            "Purchase Weekly Pass ₹30 💫"
          ) : (
            "Purchase Deploy Forever ₹100 ✨"
          )}
        </Button>
      </motion.div>

      <div className="text-center text-xs text-muted-foreground mt-4">
        {selectedPlan === "freemium" && (
          "Start with 3 free microsites, each lasting 24 hours with up to 50 views"
        )}
        {selectedPlan === "weekly" && (
          "Perfect for special occasions - 7 days of ad-free hosting"
        )}
        {selectedPlan === "deploy" && (
          "Deploy to your own hosting and keep your microsites forever"
        )}
      </div>
    </div>
  );
};

export default PlanSelector;