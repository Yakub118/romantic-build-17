import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Sparkles, Camera, Wand2, Gift, Bell, Eye } from "lucide-react";
import FloatingBackground from "./FloatingBackground";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-romantic.jpg";
import PhotoUpload, { Photo } from "./PhotoUpload";
import { supabase } from "@/integrations/supabase/client";
import ThemeSelector from "./ThemeSelector";
import { ROMANTIC_THEMES } from "@/types/themes";
import ProposalSuccess from "./ProposalSuccess";
import LoveLetterEditor from "./LoveLetterEditor";
import TimelineEditor, { TimelineMemory } from "./TimelineEditor";
import ConfettiSelector, { ConfettiStyle } from "./ConfettiSelector";
import CustomEndingMessage from "./CustomEndingMessage";
import VoiceNoteUpload from "./VoiceNoteUpload";
import CountdownEditor from "./CountdownEditor";
import PlanSelector, { PlanType } from "./PlanSelector";
import { compressImage } from "@/utils/imageCompression";

interface ProposalResponse {
  id: string;
  proposal_slug: string;
  partner_name: string;
  response_type: 'yes' | 'no' | 'not_yet';
  message: string | null;
  photo_url: string | null;
  created_at: string;
}

// Photo interface moved to PhotoUpload.tsx

interface ProposalData {
  proposerName: string;
  partnerName: string;
  loveMessage: string;
  theme: string;
  photos: Photo[];
  loveLetter: string;
  timelineMemories: TimelineMemory[];
  confettiStyle: ConfettiStyle;
  customEndingMessage: string;
  voiceNote: File | null;
  countdownDate: Date | null;
  voiceNoteUrl?: string;
  planType: PlanType;
}

const ProposalBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [responses, setResponses] = useState<ProposalResponse[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSlug, setSuccessSlug] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [formData, setFormData] = useState<ProposalData>({
    proposerName: "",
    partnerName: "",
    loveMessage: "",
    theme: "romantic-garden",
    photos: [],
    loveLetter: "",
    timelineMemories: [],
    confettiStyle: "hearts",
    customEndingMessage: "",
    voiceNote: null,
    countdownDate: null,
    planType: "freemium"
  });

  // Check for responses on component mount
  useEffect(() => {
    checkForResponses();
  }, []);

  const checkForResponses = async () => {
    try {
      // Get all proposal slugs from localStorage
      const proposals: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('proposal-')) {
          const slug = key.replace('proposal-', '');
          proposals.push(slug);
        }
      }

      if (proposals.length === 0) return;

      // Check for responses to these proposals
      const { data, error } = await supabase
        .from('proposal_responses')
        .select('*')
        .in('proposal_slug', proposals)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error checking responses:', error);
        return;
      }

      setResponses((data || []) as ProposalResponse[]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewResponse = (slug: string) => {
    navigate(`/response/${slug}`);
  };

  // Use themes from the new theme system
  const themes = ROMANTIC_THEMES;

  const handleGenerateMicrosite = async () => {
    if (!formData.proposerName || !formData.partnerName || !formData.loveMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields to create your romantic proposal.",
        variant: "destructive"
      });
      return;
    }

    // Generate unique slug
    const slug = `${formData.proposerName.toLowerCase().replace(/\s+/g, "-")}-${formData.partnerName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    
    // Show loading state
    toast({
      title: "Creating your magical microsite... ✨",
      description: "This may take a moment while we make everything perfect.",
    });
    
    try {
      // Compress images before upload to save storage space
      const photoData = [];
      
      for (const photo of formData.photos) {
        try {
          // Compress image if it's larger than 1MB
          const processedFile = photo.file.size > 1024 * 1024 
            ? await compressImage(photo.file, { maxSizeMB: 1, quality: 0.8 })
            : photo.file;
          
          const fileExt = processedFile.name.split('.').pop();
          const fileName = `proposals/${slug}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('response-photos')
            .upload(fileName, processedFile);
          
          if (uploadError) {
            console.error('Upload error:', uploadError);
            // Fallback to blob URL for now
            photoData.push({
              url: photo.url,
              caption: photo.caption
            });
            continue;
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('response-photos')
            .getPublicUrl(fileName);
          
          photoData.push({
            url: publicUrl,
            caption: photo.caption
          });
        } catch (error) {
          console.error('Error uploading photo:', error);
          // Fallback to blob URL
          photoData.push({
            url: photo.url,
            caption: photo.caption
          });
        }
      }

      // Upload timeline photos
      const timelineData = [];
      for (const memory of formData.timelineMemories) {
        let memoryToStore = { ...memory };
        
        if (memory.photo) {
          try {
            const fileExt = memory.photo.name.split('.').pop();
            const fileName = `timeline/${slug}/${memory.id}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('response-photos')
              .upload(fileName, memory.photo);
            
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('response-photos')
                .getPublicUrl(fileName);
              
              memoryToStore.photoUrl = publicUrl;
            }
          } catch (error) {
            console.error('Error uploading timeline photo:', error);
          }
        }
        
        // Remove the File object before storing
        const { photo, ...memoryWithoutFile } = memoryToStore;
        timelineData.push(memoryWithoutFile);
      }

      // Upload voice note if provided
      let voiceNoteUrl = null;
      if (formData.voiceNote) {
        try {
          const fileExt = formData.voiceNote.name.split('.').pop();
          const fileName = `voice-notes/${slug}/voice-message.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('response-photos')
            .upload(fileName, formData.voiceNote);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('response-photos')
              .getPublicUrl(fileName);
            
            voiceNoteUrl = publicUrl;
          }
        } catch (error) {
          console.error('Error uploading voice note:', error);
        }
      }
      
      // Store permanently in Supabase with plan type
      const { error: dbError } = await supabase
        .from('proposals')
        .insert([{
          slug,
          proposer_name: formData.proposerName,
          partner_name: formData.partnerName,
          love_message: formData.loveMessage,
          theme: formData.theme,
          photos: photoData,
          love_letter: formData.loveLetter || null,
          timeline_memories: timelineData,
          confetti_style: formData.confettiStyle,
          custom_ending_message: formData.customEndingMessage || null,
          voice_note_url: voiceNoteUrl,
          countdown_date: formData.countdownDate ? formData.countdownDate.toISOString() : null,
          plan_type: formData.planType
        }]);
      
      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
      
      // Also store in localStorage for immediate access
      const proposalToStore = {
        ...formData,
        photos: photoData,
        timelineMemories: timelineData,
        voiceNoteUrl,
        voiceNote: null // Remove file object
      };
      localStorage.setItem(`proposal-${slug}`, JSON.stringify(proposalToStore));
      
      toast({
        title: "Proposal Created! 💖",
        description: "Your romantic microsite is ready to share with your love.",
      });

      // Show success page
      setSuccessSlug(slug);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Something went wrong 😔",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof Omit<ProposalData, 'photos' | 'timelineMemories' | 'voiceNote'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotosChange = (photos: Photo[]) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  const handleMemoriesChange = (memories: TimelineMemory[]) => {
    setFormData(prev => ({ ...prev, timelineMemories: memories }));
  };

  const handleVoiceNoteChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, voiceNote: file }));
  };

  const handleCountdownChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, countdownDate: date }));
  };

  const handlePreview = () => {
    if (!formData.proposerName || !formData.partnerName || !formData.loveMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields before previewing.",
        variant: "destructive"
      });
      return;
    }
    
    // Store temporary data for preview
    const tempSlug = `preview-${Date.now()}`;
    const tempData = {
      ...formData,
      photos: formData.photos.map(photo => ({
        url: photo.url,
        caption: photo.caption
      })),
      timelineMemories: formData.timelineMemories.map(memory => ({
        ...memory,
        photoUrl: memory.photoUrl || (memory.photo ? URL.createObjectURL(memory.photo) : undefined)
      })),
      voiceNoteUrl: formData.voiceNote ? URL.createObjectURL(formData.voiceNote) : undefined
    };
    
    localStorage.setItem(`proposal-${tempSlug}`, JSON.stringify(tempData));
    
    // Open preview in new tab
    window.open(`/love/${tempSlug}?preview=true`, '_blank');
  };

  // Show success page if proposal was created
  if (showSuccess && successSlug) {
    return (
      <ProposalSuccess
        slug={successSlug}
        proposalData={formData}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-dreamy opacity-80" />
      
      <FloatingBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-romantic rounded-full shadow-glow-romantic mb-6"
          >
            <Heart className="w-10 h-10 text-white animate-heart-pulse" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-romantic text-primary mb-4 animate-fade-in">
            Create Your Own Love Microsite 💌
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design a magical, personalized proposal experience that will make their heart skip a beat
          </p>
        </motion.div>

        {/* Response Notifications */}
        {responses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8 space-y-4"
          >
            {responses.map((response) => (
              <Alert key={response.id} className="glass border-primary/30 bg-gradient-romantic/20">
                <Gift className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium">
                      ✨ {response.partner_name} has replied to your proposal! 
                      {response.response_type === 'yes' && ' 💖 They said YES!'}
                      {response.response_type === 'no' && ' 💙 They need time to think'}
                      {response.response_type === 'not_yet' && ' 💭 They aren\'t ready yet'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewResponse(response.proposal_slug)}
                    className="ml-4 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    View Reply
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="glass border-white/20 shadow-soft">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-romantic text-primary flex items-center justify-center gap-2">
                <Wand2 className="w-6 h-6" />
                Proposal Builder
              </CardTitle>
              <CardDescription>
                Fill in the details to create your personalized romantic proposal
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposer" className="text-sm font-medium">Your Name</Label>
                    <Input
                      id="proposer"
                      placeholder="Your name"
                      value={formData.proposerName}
                      onChange={(e) => handleInputChange("proposerName", e.target.value)}
                      className="glass border-white/30"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partner" className="text-sm font-medium">Their Name</Label>
                    <Input
                      id="partner"
                      placeholder="Their name"
                      value={formData.partnerName}
                      onChange={(e) => handleInputChange("partnerName", e.target.value)}
                      className="glass border-white/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">Your Love Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your heartfelt message here... Tell them how much they mean to you"
                    value={formData.loveMessage}
                    onChange={(e) => handleInputChange("loveMessage", e.target.value)}
                    className="glass border-white/30 min-h-[120px] resize-none"
                    required
                  />
                </div>

                <ThemeSelector
                  selectedTheme={formData.theme}
                  onThemeChange={(themeId) => handleInputChange("theme", themeId)}
                />

                <LoveLetterEditor
                  loveLetter={formData.loveLetter}
                  onLoveLetterChange={(letter) => handleInputChange("loveLetter", letter)}
                />

                <TimelineEditor
                  memories={formData.timelineMemories}
                  onMemoriesChange={handleMemoriesChange}
                />

                <PhotoUpload
                  photos={formData.photos}
                  onPhotosChange={handlePhotosChange}
                  maxPhotos={10}
                />

                <ConfettiSelector
                  selectedStyle={formData.confettiStyle}
                  onStyleChange={(style) => setFormData(prev => ({ ...prev, confettiStyle: style }))}
                />

                <CustomEndingMessage
                  message={formData.customEndingMessage}
                  onMessageChange={(message) => handleInputChange("customEndingMessage", message)}
                />

                <VoiceNoteUpload
                  voiceNote={formData.voiceNote}
                  onVoiceNoteChange={handleVoiceNoteChange}
                />

                <CountdownEditor
                  countdownDate={formData.countdownDate}
                  onCountdownChange={handleCountdownChange}
                  isEnabled={countdownEnabled}
                  onEnabledChange={setCountdownEnabled}
                />

                <PlanSelector
                  selectedPlan={formData.planType}
                  onPlanChange={(plan) => setFormData(prev => ({ ...prev, planType: plan }))}
                  onProceed={() => {/* Will handle payment/plan upgrade here */}}
                  isProcessing={false}
                />

                <div className="flex flex-col gap-3 sm:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handlePreview}
                      className="w-full text-base sm:text-lg py-4 sm:py-6 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Preview 👀
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="romantic"
                      size="lg"
                      onClick={handleGenerateMicrosite}
                      className="w-full text-base sm:text-lg py-4 sm:py-6"
                    >
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Generate My Proposal Website ❤️
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProposalBuilder;