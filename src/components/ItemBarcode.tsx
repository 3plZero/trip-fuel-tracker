import { useRef } from 'react';
import Barcode from 'react-barcode';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ItemBarcodeProps {
  value: string;
  productId: string;
}

export default function ItemBarcode({ value, productId }: ItemBarcodeProps) {
  const barcodeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = barcodeRef.current?.querySelector('svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Barcode-${productId}.png`;
        link.href = url;
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={barcodeRef} className="bg-white p-4 rounded-lg">
        <Barcode 
          value={value}
          format="CODE128"
          width={2}
          height={80}
          displayValue={true}
          fontSize={14}
          margin={10}
          background="#ffffff"
        />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Scan barcode to identify item
      </p>
      <Button onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download Barcode
      </Button>
    </div>
  );
}
