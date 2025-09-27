import { useEffect } from 'react';

interface AdSenseProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  adLayout?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AdSense = ({ 
  adSlot = "auto",
  adFormat = "auto", 
  adLayout,
  className = "",
  style = {}
}: AdSenseProps) => {
  useEffect(() => {
    try {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXX';
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        // Initialize the adsbygoogle array
        window.adsbygoogle = [];
      }

      // Push the ad
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style
        }}
        data-ad-client="ca-pub-XXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
      
      {/* Fallback for when ads are blocked */}
      <div className="ad-fallback hidden">
        <div className="glass p-4 text-center rounded-lg border-white/20">
          <p className="text-sm text-muted-foreground">
            💖 Support our free service by allowing ads 💖
          </p>
        </div>
      </div>
    </div>
  );
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdSense;