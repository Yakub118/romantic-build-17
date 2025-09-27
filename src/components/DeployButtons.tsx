import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Rocket, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeployButtonsProps {
  proposalSlug: string;
  deploySlots: number;
  onDeploySuccess?: (platform: 'vercel' | 'netlify') => void;
}

const DeployButtons = ({ proposalSlug, deploySlots, onDeploySuccess }: DeployButtonsProps) => {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState<{vercel: boolean, netlify: boolean}>({
    vercel: false,
    netlify: false
  });

  const handleVercelDeploy = async () => {
    if (deploySlots <= 0) {
      toast({
        title: "No Deploy Slots Available",
        description: "You've used all your deploy slots. Upgrade your plan to deploy more sites.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(prev => ({ ...prev, vercel: true }));
    
    try {
      // Generate deployment URL for Vercel
      const deployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(
        `https://github.com/your-template-repo/romantic-microsite?template=true&proposal=${proposalSlug}`
      )}`;
      
      // Open Vercel deploy page
      window.open(deployUrl, '_blank');
      
      toast({
        title: "Deploying to Vercel! 🚀",
        description: "Follow the instructions in the new tab to complete your deployment.",
        duration: 5000
      });

      // Simulate successful deployment (in real app, you'd track this)
      setTimeout(() => {
        onDeploySuccess?.('vercel');
        setIsDeploying(prev => ({ ...prev, vercel: false }));
      }, 3000);

    } catch (error) {
      console.error('Vercel deployment error:', error);
      toast({
        title: "Deployment Failed",
        description: "There was an issue starting the Vercel deployment. Please try again.",
        variant: "destructive"
      });
      setIsDeploying(prev => ({ ...prev, vercel: false }));
    }
  };

  const handleNetlifyDeploy = async () => {
    if (deploySlots <= 0) {
      toast({
        title: "No Deploy Slots Available",
        description: "You've used all your deploy slots. Upgrade your plan to deploy more sites.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(prev => ({ ...prev, netlify: true }));
    
    try {
      // Generate deployment URL for Netlify
      const deployUrl = `https://app.netlify.com/start/deploy?repository=${encodeURIComponent(
        `https://github.com/your-template-repo/romantic-microsite?proposal=${proposalSlug}`
      )}`;
      
      // Open Netlify deploy page
      window.open(deployUrl, '_blank');
      
      toast({
        title: "Deploying to Netlify! ⚡",
        description: "Follow the instructions in the new tab to complete your deployment.",
        duration: 5000
      });

      // Simulate successful deployment (in real app, you'd track this)
      setTimeout(() => {
        onDeploySuccess?.('netlify');
        setIsDeploying(prev => ({ ...prev, netlify: false }));
      }, 3000);

    } catch (error) {
      console.error('Netlify deployment error:', error);
      toast({
        title: "Deployment Failed",
        description: "There was an issue starting the Netlify deployment. Please try again.",
        variant: "destructive"
      });
      setIsDeploying(prev => ({ ...prev, netlify: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-romantic text-primary mb-2">Deploy Your Microsite</h3>
        <p className="text-muted-foreground">
          Deploy to your own hosting and keep your love story forever
        </p>
        <Badge variant="secondary" className="mt-2">
          <Rocket className="w-3 h-3 mr-1" />
          {deploySlots} deploy slot{deploySlots !== 1 ? 's' : ''} remaining
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vercel Deploy */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="glass border-white/20 hover-romantic">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">▲</span>
                </div>
                <CardTitle className="text-lg">Vercel</CardTitle>
              </div>
              <CardDescription>Deploy with zero configuration</CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Automatic HTTPS & CDN
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Custom domain support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Perfect for React apps
                </li>
              </ul>

              <Button
                onClick={handleVercelDeploy}
                disabled={isDeploying.vercel || deploySlots <= 0}
                variant="default"
                size="lg"
                className="w-full"
              >
                {isDeploying.vercel ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Deploy to Vercel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Netlify Deploy */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="glass border-white/20 hover-romantic">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center mb-2">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">N</span>
                </div>
                <CardTitle className="text-lg">Netlify</CardTitle>
              </div>
              <CardDescription>Deploy with powerful features</CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Form handling & functions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Branch-based deployments
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Easy rollbacks
                </li>
              </ul>

              <Button
                onClick={handleNetlifyDeploy}
                disabled={isDeploying.netlify || deploySlots <= 0}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                {isDeploying.netlify ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Deploy to Netlify
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {deploySlots <= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 rounded-lg glass border-white/20"
        >
          <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            You've used all your deploy slots. 
            <Button variant="link" className="p-0 h-auto font-semibold text-primary">
              Upgrade your plan
            </Button> to deploy more microsites.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DeployButtons;