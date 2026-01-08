import { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import dostLogo from '@/assets/dost-sticker-logo.png';

type StickerSize = 'small' | 'medium' | 'large';
type CodeType = 'qr' | 'barcode';

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
  logoSize: string;
  title: string;
  subtitle: string;
  details: string;
  label: string;
  qrSize: number;
  printQrSize: number;
  barcodeWidth: number;
  barcodeHeight: number;
  dimensions: string;
}> = {
  small: {
    container: 'w-[3in] p-3',
    logoSize: '24px',
    title: 'text-sm font-bold',
    subtitle: 'text-[9px]',
    details: 'text-[8px]',
    label: 'text-[7px]',
    qrSize: 120,
    printQrSize: 300,
    barcodeWidth: 1,
    barcodeHeight: 35,
    dimensions: '3" x 2"',
  },
  medium: {
    container: 'w-[4in] p-4',
    logoSize: '30px',
    title: 'text-base font-bold',
    subtitle: 'text-[10px]',
    details: 'text-[9px]',
    label: 'text-[8px]',
    qrSize: 150,
    printQrSize: 350,
    barcodeWidth: 1.5,
    barcodeHeight: 45,
    dimensions: '4" x 2.5"',
  },
  large: {
    container: 'w-[5in] p-5',
    logoSize: '36px',
    title: 'text-lg font-bold',
    subtitle: 'text-xs',
    details: 'text-[10px]',
    label: 'text-[9px]',
    qrSize: 180,
    printQrSize: 400,
    barcodeWidth: 2,
    barcodeHeight: 55,
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
  const printQrRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);
  const [codeType, setCodeType] = useState<CodeType>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>('');
  
  const config = sizeConfig[size];
  const itemUrl = `${window.location.origin}/inventory-items/${item.id}`;

  // Convert high-res QR code canvas to data URL for printing
  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = printQrRef.current?.querySelector('canvas');
      if (canvas) {
        setQrDataUrl(canvas.toDataURL('image/png'));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [size, item.id]);

  // Convert Barcode SVG to data URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const svg = barcodeRef.current?.querySelector('svg');
      if (svg) {
        const data = new XMLSerializer().serializeToString(svg);
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
        setBarcodeDataUrl(dataUrl);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [size, item.product_id]);

  const handlePrint = () => {
    const logoSize = config.logoSize;
    const codeImageUrl = codeType === 'qr' ? qrDataUrl : barcodeDataUrl;
    const codeSize = codeType === 'qr' 
      ? `width: ${config.qrSize}px; height: ${config.qrSize}px;`
      : `height: ${config.barcodeHeight + 20}px;`;

    const particulars = [item.brand_model, item.serial_number ? `SN:${item.serial_number}` : null]
      .filter(Boolean)
      .join('/ ');

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
              padding: ${size === 'small' ? '12px' : size === 'medium' ? '16px' : '20px'};
              width: ${size === 'small' ? '3in' : size === 'medium' ? '4in' : '5in'};
            }
            .header {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 4px;
            }
            .logo {
              width: ${logoSize};
              height: ${logoSize};
            }
            .header-text {
              flex: 1;
            }
            .dept-label {
              font-size: ${size === 'small' ? '6px' : size === 'medium' ? '7px' : '8px'};
              color: #666;
            }
            .dept-name {
              font-size: ${size === 'small' ? '9px' : size === 'medium' ? '10px' : '11px'};
              font-weight: bold;
            }
            .region {
              font-size: ${size === 'small' ? '7px' : size === 'medium' ? '8px' : '9px'};
            }
            .tagline {
              font-size: ${size === 'small' ? '5px' : size === 'medium' ? '6px' : '7px'};
              font-style: italic;
              color: #666;
            }
            .item-box {
              background: #e5e5e5;
              padding: 8px;
              margin-bottom: 8px;
            }
            .item-name {
              font-size: ${size === 'small' ? '14px' : size === 'medium' ? '18px' : '22px'};
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 4px;
              line-height: 1.1;
            }
            .particulars {
              font-size: ${size === 'small' ? '8px' : size === 'medium' ? '9px' : '10px'};
              margin-bottom: 2px;
            }
            .particulars-label {
              color: #666;
            }
            .property-number {
              font-size: ${size === 'small' ? '8px' : size === 'medium' ? '9px' : '10px'};
            }
            .content {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .details {
              font-size: ${size === 'small' ? '7px' : size === 'medium' ? '8px' : '9px'};
              line-height: 1.6;
            }
            .code-image {
              ${codeSize}
              image-rendering: crisp-edges;
              image-rendering: -webkit-optimize-contrast;
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="header">
              <img src="${dostLogo}" class="logo" alt="DOST" />
              <div class="header-text">
                <p class="dept-label">Republic of the Philippines</p>
                <p class="dept-name">DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
                <p class="region">BAGUIO-BENGUET</p>
                <p class="tagline">OneDOST4U: Solutions and Opportunities for All</p>
              </div>
            </div>
            <div class="item-box">
              <div class="item-name">${item.name}</div>
              ${particulars ? `<p class="particulars"><span class="particulars-label">Particulars (Brand, Model, Serial Number): </span><strong>${particulars}</strong></p>` : ''}
              ${item.property_number ? `<p class="property-number"><span class="particulars-label">Property Number: </span><strong>${item.property_number}</strong></p>` : ''}
            </div>
            <div class="content">
              <div class="details">
                ${item.date_received ? `<p><span style="color:#666">Date Acquired: </span>${format(new Date(item.date_received), 'MMMM d, yyyy')}</p>` : ''}
                ${item.total_cost ? `<p><span style="color:#666">Acquisition Cost: </span>${formatCurrency(item.total_cost)}</p>` : ''}
                ${item.accountable_person ? `<p><span style="color:#666">Issued to: </span>${item.accountable_person}</p>` : ''}
                ${item.created_at ? `<p><span style="color:#666">Date issued: </span>${format(new Date(item.created_at), 'MMMM d, yyyy')}</p>` : ''}
              </div>
              <img src="${codeImageUrl}" class="code-image" alt="${codeType === 'qr' ? 'QR Code' : 'Barcode'}" />
            </div>
          </div>
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
      {/* Size & Code Type Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sticker Size</Label>
          <RadioGroup
            value={size}
            onValueChange={(value) => onSizeChange(value as StickerSize)}
            className="flex flex-wrap gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="small" />
              <Label htmlFor="small" className="cursor-pointer text-sm">Small (3"x2")</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="cursor-pointer text-sm">Medium (4"x2.5")</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <Label htmlFor="large" className="cursor-pointer text-sm">Large (5"x3")</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Code Type</Label>
          <RadioGroup
            value={codeType}
            onValueChange={(value) => setCodeType(value as CodeType)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="qr" id="qr" />
              <Label htmlFor="qr" className="cursor-pointer text-sm">QR Code</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="barcode" id="barcode" />
              <Label htmlFor="barcode" className="cursor-pointer text-sm">Barcode</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Hidden high-resolution QR for printing */}
      <div className="hidden">
        <div ref={printQrRef}>
          <QRCodeCanvas 
            value={itemUrl}
            size={config.printQrSize}
            level="H"
            includeMargin={true}
          />
        </div>
        <div ref={barcodeRef}>
          <Barcode 
            value={item.product_id}
            format="CODE128"
            width={config.barcodeWidth}
            height={config.barcodeHeight}
            displayValue={true}
            fontSize={size === 'small' ? 8 : size === 'medium' ? 10 : 12}
            margin={0}
            background="#ffffff"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="border rounded-lg p-4 bg-muted/30 overflow-auto">
        <div className={`sticker bg-white ${config.container}`}>
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1">
            <img 
              src={dostLogo} 
              alt="DOST" 
              style={{ width: config.logoSize, height: config.logoSize }}
            />
            <div className="flex-1">
              <p className={config.label} style={{ color: '#666' }}>Republic of the Philippines</p>
              <p className={`${config.subtitle} font-bold`}>DEPARTMENT OF SCIENCE AND TECHNOLOGY</p>
              <p className={config.label}>BAGUIO-BENGUET</p>
              <p className={config.label} style={{ fontStyle: 'italic', color: '#666' }}>OneDOST4U: Solutions and Opportunities for All</p>
            </div>
          </div>

          {/* Item Box */}
          <div className="bg-gray-200 p-2 mb-2">
            {/* Item Name */}
            <h2 className={`${config.title} uppercase leading-tight`} style={{ fontSize: size === 'small' ? '14px' : size === 'medium' ? '18px' : '22px' }}>
              {item.name}
            </h2>

            {/* Particulars */}
            {particulars && (
              <p className={config.subtitle}>
                <span style={{ color: '#666' }}>Particulars (Brand, Model, Serial Number): </span>
                <span className="font-semibold">{particulars}</span>
              </p>
            )}

            {/* Property Number */}
            {item.property_number && (
              <p className={config.subtitle}>
                <span style={{ color: '#666' }}>Property Number: </span>
                <span className="font-semibold">{item.property_number}</span>
              </p>
            )}
          </div>

          {/* Content - Details and Code */}
          <div className="flex justify-between items-end">
            {/* Details */}
            <div className={`${config.details} space-y-0.5`}>
              {item.date_received && (
                <p>
                  <span style={{ color: '#666' }}>Date Acquired: </span>
                  {format(new Date(item.date_received), 'MMMM d, yyyy')}
                </p>
              )}
              {item.total_cost && (
                <p>
                  <span style={{ color: '#666' }}>Acquisition Cost: </span>
                  {formatCurrency(item.total_cost)}
                </p>
              )}
              {item.accountable_person && (
                <p>
                  <span style={{ color: '#666' }}>Issued to: </span>
                  {item.accountable_person}
                </p>
              )}
              {item.created_at && (
                <p>
                  <span style={{ color: '#666' }}>Date issued: </span>
                  {format(new Date(item.created_at), 'MMMM d, yyyy')}
                </p>
              )}
            </div>

            {/* Code Preview */}
            <div>
              {codeType === 'qr' ? (
                <QRCodeCanvas 
                  value={itemUrl}
                  size={config.qrSize}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <Barcode 
                  value={item.product_id}
                  format="CODE128"
                  width={config.barcodeWidth}
                  height={config.barcodeHeight}
                  displayValue={true}
                  fontSize={size === 'small' ? 8 : size === 'medium' ? 10 : 12}
                  margin={0}
                  background="#ffffff"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <Button onClick={handlePrint} className="w-full gap-2">
        <Printer className="h-4 w-4" />
        Print Sticker with {codeType === 'qr' ? 'QR Code' : 'Barcode'} ({config.dimensions})
      </Button>
    </div>
  );
}
