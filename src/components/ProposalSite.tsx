import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Sparkles, Share2, Volume2, VolumeX, Camera, Upload } from "lucide-react";
import { getThemeById, getDefaultTheme } from "@/types/themes";
import { ThemeProvider } from "./ThemeProvider";
import EnhancedFloatingBackground from "./EnhancedFloatingBackground";
import MemoryCarousel from "./MemoryCarousel";
import EnhancedConfetti from "./EnhancedConfetti";
import EnhancedBalloons from "./EnhancedBalloons";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { supabase } from "@/integrations/supabase/client";
import LoveLetterDisplay from "./LoveLetterDisplay";
import TimelineDisplay from "./TimelineDisplay";
import CountdownDisplay from "./CountdownDisplay";

interface Photo {
  url: string;
  caption: string;
}

interface ProposalData {
  proposerName: string;
  partnerName: string;
  loveMessage: string;
  theme: string;
  photos: Photo[];
  loveLetter?: string;
  timelineMemories?: any[];
  confettiStyle?: string;
  customEndingMessage?: string;
  voiceNoteUrl?: string;
  countdownDate?: Date | string | null;
}

type ProposalStep = "intro" | "question1" | "question2" | "question3" | "balloons" | "transition" | "final" | "response-collection" | "response-submitted" | "celebration";

const ProposalSite = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { toast } = useToast();
  const { isPlaying: musicPlaying, toggleMusic } = useBackgroundMusic();
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [currentStep, setCurrentStep] = useState<ProposalStep>("intro");
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noButtonScale, setNoButtonScale] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responsePhoto, setResponsePhoto] = useState<File | null>(null);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load proposal data from localStorage or Supabase
  useEffect(() => {
    const loadProposalData = async () => {
      if (!slug) return;
      
      // First try localStorage for temporary/preview data
      const localData = localStorage.getItem(`proposal-${slug}`);
      if (localData) {
        setProposalData(JSON.parse(localData));
        return;
      }
      
      // Then try Supabase for permanent data
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching proposal:', error);
          return;
        }
        
        if (data) {
          // Transform database data to component format
          setProposalData({
            proposerName: data.proposer_name,
            partnerName: data.partner_name,
            loveMessage: data.love_message,
            theme: data.theme,
            photos: Array.isArray(data.photos) ? (data.photos as unknown as Photo[]) : [],
            loveLetter: data.love_letter,
            timelineMemories: Array.isArray(data.timeline_memories) ? data.timeline_memories : [],
            confettiStyle: data.confetti_style,
            customEndingMessage: data.custom_ending_message,
            voiceNoteUrl: data.voice_note_url,
            countdownDate: data.countdown_date
          });
        }
      } catch (error) {
        console.error('Error loading proposal:', error);
      }
    };
    
    loadProposalData();
  }, [slug]);

  // Typing animation effect
  const typeText = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setCurrentText("");
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setCurrentText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        if (callback) setTimeout(callback, 1000);
      }
    }, 50);
  };


  const handleYesClick = () => {
    if (currentStep === "question1") {
      setCurrentStep("question2");
    } else if (currentStep === "question2") {
      setCurrentStep("question3");
    } else if (currentStep === "question3") {
      setCurrentStep("balloons");
    } else if (currentStep === "final") {
      setCurrentStep("response-collection");
      setShowConfetti(true);
    }
  };

  const handleNoClick = () => {
    const newX = (Math.random() - 0.5) * 200;
    const newY = (Math.random() - 0.5) * 200;
    setNoButtonPosition({ x: newX, y: newY });
    setNoButtonScale(prev => Math.max(0.3, prev - 0.1));
    
    // Show playful message
    const playfulMessages = [
      "Come on, try again! 😊",
      "That's not the right answer! 💕",
      "I know you don't mean that! 😉",
      "The button is getting shy! 🙈"
    ];
    toast({
      title: playfulMessages[Math.floor(Math.random() * playfulMessages.length)],
      duration: 2000,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setResponsePhoto(file);
    }
  };

  const handleResponseSubmit = async (responseType: 'yes' | 'no' | 'not_yet') => {
    if (!proposalData || !slug) return;
    
    setIsSubmittingResponse(true);
    
    try {
      let photoUrl = null;
      
      // Upload photo if provided
      if (responsePhoto) {
        const fileExt = responsePhoto.name.split('.').pop();
        const fileName = `${slug}-response-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('response-photos')
          .upload(fileName, responsePhoto);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('response-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }
      
      // Save response to database
      const { error } = await supabase
        .from('proposal_responses')
        .insert({
          proposal_slug: slug,
          partner_name: proposalData.partnerName,
          response_type: responseType,
          message: responseMessage.trim() || null,
          photo_url: photoUrl
        });
      
      if (error) throw error;
      
      setCurrentStep("response-submitted");
      
      toast({
        title: responseType === 'yes' ? "Response sent! 💕" : "Thank you for your honesty 💭",
        description: "Your heartfelt reply has been delivered.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Something went wrong 😔",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    toggleMusic();
    
    toast({
      title: audioEnabled ? "Music paused 🎵" : "Music playing 🎶",
      description: "Romantic background music " + (audioEnabled ? "paused" : "started"),
      duration: 2000,
    });
  };

  const theme = proposalData ? (getThemeById(proposalData.theme) || getDefaultTheme()) : getDefaultTheme();

  // Check if countdown is active and not expired
  if (proposalData?.countdownDate && !isPreview) {
    const now = new Date();
    const countdownDate = typeof proposalData.countdownDate === 'string' 
      ? new Date(proposalData.countdownDate) 
      : proposalData.countdownDate;
    if (now < countdownDate) {
      return (
        <CountdownDisplay 
          targetDate={countdownDate}
          partnerName={proposalData.partnerName}
          theme={proposalData.theme}
        />
      );
    }
  }

  if (!proposalData) {
    return (
      <ThemeProvider theme={theme}>
        <div className="min-h-screen relative overflow-hidden">
          <EnhancedFloatingBackground theme={theme} />
          <div className="relative z-10 min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <h1 className="text-3xl md:text-4xl font-romantic text-primary mb-4">
                This love story has ended 💔
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                This romantic link might be broken, expired, or invalid.
                <br />
                Ask your partner to resend the love letter 💌
              </p>
              <Button
                variant="romantic"
                size="lg"
                onClick={() => window.location.href = '/'}
                className="text-lg px-8 py-4 shadow-glow-romantic"
              >
                Back to Home ✨
              </Button>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case "intro":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-romantic text-primary mb-6">
                {proposalData.partnerName}, I have something important for you...
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                This is a special moment just for us 💖
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="heart"
                size="lg"
                onClick={() => setCurrentStep("question1")}
                className="text-2xl px-12 py-6 shadow-glow-romantic"
              >
                Start 💖
              </Button>
            </motion.div>
          </motion.div>
        );

      case "question1":
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-romantic text-primary mb-6 sm:mb-8 px-2">
              Do you like surprises?
            </h2>
            
            <div className="flex flex-col gap-4 justify-center items-center px-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="romantic"
                  size="lg"
                  onClick={handleYesClick}
                  className="text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 shadow-glow-romantic w-full sm:w-auto"
                >
                  Yes! ✨
                </Button>
              </motion.div>
              
              <motion.div
                animate={{ x: noButtonPosition.x, y: noButtonPosition.y, scale: noButtonScale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Button
                  variant="playful"
                  size="lg"
                  onClick={handleNoClick}
                  className="text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                >
                  Not really... 😅
                </Button>
              </motion.div>
            </div>
          </motion.div>
        );

      case "question2":
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-romantic text-primary mb-6 sm:mb-8 px-2">
              Do you like how I always think about you?
            </h2>
            
            <div className="flex flex-col gap-4 justify-center items-center px-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="romantic"
                  size="lg"
                  onClick={handleYesClick}
                  className="text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 shadow-glow-romantic w-full sm:w-auto"
                >
                  Yes, always! 💕
                </Button>
              </motion.div>
              
              <motion.div
                animate={{ x: noButtonPosition.x, y: noButtonPosition.y, scale: noButtonScale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Button
                  variant="playful"
                  size="lg"
                  onClick={handleNoClick}
                  className="text-xl px-8 py-4"
                >
                  Maybe too much? 🙈
                </Button>
              </motion.div>
            </div>
          </motion.div>
        );

      case "question3":
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-romantic text-primary mb-8">
              Do you love me?
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="romantic"
                size="lg"
                onClick={handleYesClick}
                className="text-xl px-8 py-4"
              >
                Yes, with all my heart! 💖
              </Button>
              
              <motion.div
                animate={{ x: noButtonPosition.x, y: noButtonPosition.y, scale: noButtonScale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Button
                  variant="playful"
                  size="lg"
                  onClick={handleNoClick}
                  className="text-xl px-8 py-4"
                  style={{ fontSize: `${noButtonScale}rem` }}
                >
                  {noButtonScale > 0.5 ? "I'm not sure... 🤔" : "..."}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        );

      case "balloons":
        return (
          <EnhancedBalloons
            message={`I LOVE YOU ${proposalData.partnerName.toUpperCase()}! 💕`}
            onComplete={() => {
              setTimeout(() => setCurrentStep("transition"), 1000);
            }}
          />
        );

      case "transition":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8"
          >
            {/* Falling petals animation */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0 }}
                  animate={{ 
                    y: window.innerHeight + 100, 
                    rotate: 360,
                    x: Math.random() * window.innerWidth 
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute text-2xl opacity-80"
                >
                  🌹
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-3xl md:text-5xl font-romantic text-primary mb-8 relative z-10">
                This is what I wanted to say for so long...
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <Button
                variant="romantic"
                size="lg"
                onClick={() => setCurrentStep("final")}
                className="text-xl px-8 py-4 relative z-10"
              >
                Tell me... 💖
              </Button>
            </motion.div>
          </motion.div>
        );

      case "final":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <Card className="glass border-white/30 shadow-glow-romantic p-8">
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-4xl md:text-6xl font-romantic text-primary mb-6">
                    Will you be mine forever, {proposalData.partnerName}? 💍
                  </h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="prose prose-lg mx-auto text-center"
                >
                  <p className="text-xl text-foreground leading-relaxed italic">
                    "{proposalData.loveMessage}"
                  </p>
                  <p className="text-lg text-muted-foreground mt-4">
                    - {proposalData.proposerName} 💕
                  </p>
                </motion.div>

                {/* Memory Photos Section */}
                {proposalData.photos && proposalData.photos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    className="pt-8"
                  >
                    <h3 className="text-2xl font-romantic text-primary mb-6 text-center">
                      Our Beautiful Memories Together ✨
                    </h3>
                    <MemoryCarousel photos={proposalData.photos} />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="pt-6"
                >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="heart"
                  size="lg"
                  onClick={handleYesClick}
                  className="text-2xl px-12 py-6 shadow-glow-romantic"
                >
                  Yes, forever! ✨
                </Button>
              </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "response-collection":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-2xl mx-auto"
          >
            <Card className="glass border-white/30 shadow-glow-romantic p-8">
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-3xl md:text-5xl font-romantic text-primary mb-6">
                    Make it official 💌
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Leave a sweet reply so they'll know how you feel.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your heartfelt message here... 💕"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      maxLength={200}
                      className="min-h-24 resize-none border-white/20 bg-white/10 text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground text-right">
                      {responseMessage.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Optional: Add a photo or selfie 📸</p>
                    <div className="flex justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-white/20 bg-white/10 text-foreground hover:bg-white/20"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {responsePhoto ? "Change Photo" : "Upload Photo"}
                      </Button>
                    </div>
                    {responsePhoto && (
                      <div className="flex justify-center">
                        <img
                          src={URL.createObjectURL(responsePhoto)}
                          alt="Selected photo"
                          className="w-24 h-24 object-cover rounded-full border-2 border-white/30 shadow-soft"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 pt-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="heart"
                        size="lg"
                        onClick={() => handleResponseSubmit('yes')}
                        disabled={isSubmittingResponse}
                        className="w-full text-xl py-6 shadow-glow-romantic"
                      >
                        {isSubmittingResponse ? "Sending..." : "Send My Love ❤️"}
                      </Button>
                    </motion.div>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleResponseSubmit('not_yet')}
                      disabled={isSubmittingResponse}
                      className="border-white/20 bg-white/10 text-muted-foreground hover:bg-white/20"
                    >
                      I need more time 💭
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "response-submitted":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-romantic text-primary mb-6 relative z-10 px-4">
                Your heart has been delivered 💌
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="space-y-6 relative z-10 px-4"
            >
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                {proposalData.proposerName} will be notified of your response. Your love story continues... ✨
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="dreamy"
                  size="lg"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Love is in the air! 💖",
                        text: `${proposalData.partnerName} just responded to ${proposalData.proposerName}'s proposal!`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied! 💕",
                        description: "Share this magical moment!",
                      });
                    }
                  }}
                  className="text-lg md:text-xl px-8 py-4 shadow-glow-romantic"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share This Moment 💌
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case "celebration":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            {/* Confetti animation */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0 }}
                  animate={{ 
                    y: window.innerHeight + 100, 
                    rotate: Math.random() * 720,
                    x: Math.random() * window.innerWidth 
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute text-2xl"
                >
                  {['🎉', '💖', '✨', '🌟', '💕', '🎊'][Math.floor(Math.random() * 6)]}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-romantic text-primary mb-6 relative z-10">
                This is just the beginning of our forever story, {proposalData.partnerName}! 💖
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="space-y-4 relative z-10"
            >
              <p className="text-xl text-muted-foreground mb-8">
                Share this magical moment with the world! 🌟
              </p>
              
              <Button
                variant="dreamy"
                size="lg"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "I said YES! 💖",
                      text: `${proposalData.partnerName} and ${proposalData.proposerName} are starting their forever journey!`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied! 💕",
                      description: "Share your happiness with everyone!",
                    });
                  }
                }}
                className="text-xl px-8 py-4"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share My Happiness
              </Button>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen relative overflow-hidden">
        <EnhancedFloatingBackground theme={theme} />
        
        {/* Audio control */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 right-4 z-20"
        >
          <Button
            variant="dreamy"
            size="icon"
            onClick={toggleAudio}
            className="rounded-full shadow-soft"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </motion.div>

        <EnhancedConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ProposalSite;