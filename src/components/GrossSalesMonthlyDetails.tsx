import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface MonthlyDetail {
  products: string;
  production_volume: string;
  existing_workers_male: number;
  existing_workers_female: number;
  new_workers_male: number;
  new_workers_female: number;
  market_outlets_male: number;
  market_outlets_female: number;
  raw_material_suppliers_male: number;
  raw_material_suppliers_female: number;
  business_status: string;
}

export const emptyMonthlyDetail: MonthlyDetail = {
  products: '', production_volume: '',
  existing_workers_male: 0, existing_workers_female: 0,
  new_workers_male: 0, new_workers_female: 0,
  market_outlets_male: 0, market_outlets_female: 0,
  raw_material_suppliers_male: 0, raw_material_suppliers_female: 0,
  business_status: '',
};

interface Props {
  monthKey: string;
  monthLabel: string;
  detail: MonthlyDetail;
  onChange: (key: string, detail: MonthlyDetail) => void;
}

export function GrossSalesMonthlyDetails({ monthKey, monthLabel, detail, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const set = (field: keyof MonthlyDetail, value: any) => {
    onChange(monthKey, { ...detail, [field]: value });
  };

  const hasData = detail.products || detail.production_volume || detail.business_status ||
    detail.existing_workers_male || detail.existing_workers_female ||
    detail.new_workers_male || detail.new_workers_female ||
    detail.market_outlets_male || detail.market_outlets_female ||
    detail.raw_material_suppliers_male || detail.raw_material_suppliers_female;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between py-1">
        <span>{monthLabel} Details {hasData ? '●' : ''}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2 pl-2 border-l-2 border-muted ml-1">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Products</Label>
            <Input value={detail.products} onChange={e => set('products', e.target.value)} placeholder="e.g. Cookies, Bread" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Qty/Volume of Production</Label>
            <Input value={detail.production_volume} onChange={e => set('production_volume', e.target.value)} placeholder="e.g. 500 packs" className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Existing Workers (M)</Label>
            <Input type="number" value={detail.existing_workers_male || ''} onChange={e => set('existing_workers_male', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Existing Workers (F)</Label>
            <Input type="number" value={detail.existing_workers_female || ''} onChange={e => set('existing_workers_female', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">New Workers (M)</Label>
            <Input type="number" value={detail.new_workers_male || ''} onChange={e => set('new_workers_male', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">New Workers (F)</Label>
            <Input type="number" value={detail.new_workers_female || ''} onChange={e => set('new_workers_female', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Market Outlets (M)</Label>
            <Input type="number" value={detail.market_outlets_male || ''} onChange={e => set('market_outlets_male', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Market Outlets (F)</Label>
            <Input type="number" value={detail.market_outlets_female || ''} onChange={e => set('market_outlets_female', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Suppliers (M)</Label>
            <Input type="number" value={detail.raw_material_suppliers_male || ''} onChange={e => set('raw_material_suppliers_male', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Suppliers (F)</Label>
            <Input type="number" value={detail.raw_material_suppliers_female || ''} onChange={e => set('raw_material_suppliers_female', parseInt(e.target.value) || 0)} placeholder="0" className="h-8 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Business Status / Innovations / Concerns</Label>
          <Textarea value={detail.business_status} onChange={e => set('business_status', e.target.value)} placeholder="Any updates..." rows={2} className="text-sm" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
