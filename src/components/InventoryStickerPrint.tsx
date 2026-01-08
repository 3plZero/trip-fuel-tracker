import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import dostLogo from '@/assets/dost-car-logo.jpg';

type StickerSize = 'small' | 'medium' | 'large';

interface InventoryStickerPrintProps {
  item: {
    id: string;
    name: string;
    product_id: string;
    brand_model?: string | null;
    serial_number?: string | null;
    property_number?: string | null;
    date_received?: string | null;
    total_cost?: number | null;
    accountable_person?: string | null;
    created_at?: string | null;
  };
  size: StickerSize;
  onSizeChange: (size: StickerSize) => void;
}

const sizeConfig: Record<StickerSize, {
  container: string;
  title: string;
  subtitle: string;
  details: string;
  label: string;
  qrSize: number;
  dimensions: string;
}> = {
  small: {
    container: 'w-[3in] p-3',
    title: 'text-sm font-bold',
    subtitle: 'text-[9px]',
    details: 'text-[8px]',
    label: 'text-[7px]',
    qrSize: 60,
    dimensions: '3" x 2"',
  },
  medium: {
    container: 'w-[4in] p-4',
    title: 'text-base font-bold',
    subtitle: 'text-[10px]',
    details: 'text-[9px]',
    label: 'text-[8px]',
    qrSize: 80,
    dimensions: '4" x 2.5"',
  },
  large: {
    container: 'w-[5in] p-5',
    title: 'text-lg font-bold',
    subtitle: 'text-xs',
    details: 'text-[10px]',
    label: 'text-[9px]',
    qrSize: 100,
    dimensions: '5" x 3"',
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

export default function InventoryStickerPrint({ item, size, onSizeChange }: InventoryStickerPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const config = sizeConfig[size];
  const itemUrl = `${window.location.origin}/inventory-items/${item.id}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Sticker - ${item.product_id}</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sticker {
              background: white;
              border: 2px solid #000;
              padding: ${size === 'small' ? '12px' : size === 'medium' ? '16px' : '20px'};
              width: ${size === 'small' ? '3in' : size === 'medium' ? '4in' : '5in'};
            }
            .header {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              margin-bottom: 8px;
              padding-bottom: 8px;
              border-bottom: 1px solid #ccc;
            }
            .logo {
              width: ${size === 'small' ? '35px' : size === 'medium' ? '45px' : '55px'};
              height: auto;
            }
            .header-text {
              flex: 1;
            }
            .dept-label {
              font-size: ${size === 'small' ? '6px' : size === 'medium' ? '7px' : '8px'};
              color: #666;
            }
            .dept-name {
              font-size: ${size === 'small' ? '8px' : size === 'medium' ? '9px' : '10px'};
              font-weight: bold;
            }
            .region {
              font-size: ${size === 'small' ? '6px' : size === 'medium' ? '7px' : '8px'};
            }
            .tagline {
              font-size: ${size === 'small' ? '5px' : size === 'medium' ? '6px' : '7px'};
              font-style: italic;
              color: #666;
            }
            .content {
              display: flex;
              gap: 12px;
            }
            .info {
              flex: 1;
            }
            .item-name {
              font-size: ${size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px'};
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 4px;
              line-height: 1.2;
            }
            .particulars {
              font-size: ${size === 'small' ? '8px' : size === 'medium' ? '9px' : '10px'};
              margin-bottom: 4px;
            }
            .particulars-label {
              color: #666;
            }
            .property-number {
              font-size: ${size === 'small' ? '8px' : size === 'medium' ? '9px' : '10px'};
              margin-bottom: 8px;
            }
            .details {
              font-size: ${size === 'small' ? '7px' : size === 'medium' ? '8px' : '9px'};
              line-height: 1.5;
            }
            .qr-container {
              display: flex;
              align-items: center;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const particulars = [item.brand_model, item.serial_number ? `SN:${item.serial_number}` : null]
    .filter(Boolean)
    .join('/ ');

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Sticker Size</Label>
        <RadioGroup
          value={size}
          onValueChange={(value) => onSizeChange(value as StickerSize)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="small" />
            <Label htmlFor="small" className="cursor-pointer">Small (3" x 2")</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="cursor-pointer">Medium (4" x 2.5")</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="large" />
            <Label htmlFor="large" className="cursor-pointer">Large (5" x 3")</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Preview */}
      <div className="border rounded-lg p-4 bg-muted/30 overflow-auto">
        <div ref={printRef}>
          <div className={`sticker bg-white border-2 border-black ${config.container}`}>
            {/* Header */}
            <div className="flex items-start gap-2 mb-2 pb-2 border-b border-gray-300">
              <img src={dostLogo} alt="DOST" className={`${size === 'small' ? 'w-[35px]' : size === 'medium' ? 'w-[45px]' : 'w-[55px]'}`} />
              <div className="flex-1">
                <p className={config.label} style={{ color: '#666' }}>Republic of the Philippines</p>
                <p className={`${config.subtitle} font-bold`}>DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
                <p className={config.label}>BAGUIO-BENGUET</p>
                <p className={config.label} style={{ fontStyle: 'italic', color: '#666' }}>OneDOST4U: Solutions and Opportunities for All</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex gap-3">
              <div className="flex-1">
                {/* Item Name */}
                <h2 className={`${config.title} uppercase leading-tight mb-1`}>
                  {item.name}
                </h2>

                {/* Particulars */}
                {particulars && (
                  <p className={config.subtitle}>
                    <span className="text-muted-foreground">Particulars (Brand, Model, Serial Number): </span>
                    <span className="font-semibold">{particulars}</span>
                  </p>
                )}

                {/* Property Number */}
                {item.property_number && (
                  <p className={config.subtitle}>
                    <span className="text-muted-foreground">Property Number: </span>
                    <span className="font-semibold">{item.property_number}</span>
                  </p>
                )}

                {/* Details */}
                <div className={`${config.details} mt-2 space-y-0.5`}>
                  {item.date_received && (
                    <p>
                      <span className="text-muted-foreground">Date Acquired: </span>
                      {format(new Date(item.date_received), 'MMMM d, yyyy')}
                    </p>
                  )}
                  {item.total_cost && (
                    <p>
                      <span className="text-muted-foreground">Acquisition Cost: </span>
                      {formatCurrency(item.total_cost)}
                    </p>
                  )}
                  {item.accountable_person && (
                    <p>
                      <span className="text-muted-foreground">Issued to: </span>
                      {item.accountable_person}
                    </p>
                  )}
                  {item.created_at && (
                    <p>
                      <span className="text-muted-foreground">Date issued: </span>
                      {format(new Date(item.created_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex items-center">
                <QRCodeCanvas 
                  value={itemUrl}
                  size={config.qrSize}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <Button onClick={handlePrint} className="w-full gap-2">
        <Printer className="h-4 w-4" />
        Print Sticker ({config.dimensions})
      </Button>
    </div>
  );
}
