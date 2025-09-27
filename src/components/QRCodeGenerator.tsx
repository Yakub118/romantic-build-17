import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  url: string;
  proposalData: {
    proposerName: string;
    partnerName: string;
  };
}

const QRCodeGenerator = ({ url, proposalData }: QRCodeGeneratorProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadQRCode = () => {
    // Create a canvas and draw the SVG to it for download
    const svg = document.querySelector('svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgBlob = new Blob([svg.outerHTML], {type: 'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = 200;
        canvas.height = 200;
        ctx?.drawImage(img, 0, 0, 200, 200);
        
        const link = document.createElement('a');
        link.download = `proposal-qr-${proposalData.proposerName}-${proposalData.partnerName}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        URL.revokeObjectURL(url);
        
        toast({
          title: "QR Code Downloaded! 📱",
          description: "Your romantic QR code is ready to share!",
        });
      };
      
      img.src = url;
    }
  };

  return (
    <Card className="glass border-white/20 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-romantic">
          <QrCode className="w-5 h-5" />
          QR Code 📱
        </CardTitle>
        <CardDescription>
          Share your proposal with a beautiful QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg shadow-soft">
            <QRCodeSVG
              value={url}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#8B5A5A"
              bgColor="#FFFFFF"
            />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Scan this QR code to open the proposal
          </p>
          
          <Button
            variant="romantic"
            onClick={downloadQRCode}
            className="shadow-glow-romantic"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;