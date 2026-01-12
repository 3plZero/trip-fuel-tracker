import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

interface ItemQRCodeProps {
  itemId: string;
  productId: string;
  size?: number;
}

export default function ItemQRCode({ itemId, productId, size = 200 }: ItemQRCodeProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Point to the public scan page instead of the protected item view
  const itemUrl = `${window.location.origin}/scan/${itemId}`;

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR-${productId}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={canvasRef} className="bg-white p-4 rounded-lg">
        <QRCodeCanvas 
          value={itemUrl} 
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Scan to view item details
      </p>
      <Button onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download QR Code
      </Button>
    </div>
  );
}
