import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParsedItem {
  name?: string;
  brand_model?: string;
  property_number?: string;
  serial_number?: string;
  condition?: string;
  utilization_status?: string;
  quantity?: number;
  unit_cost?: number;
  total_cost?: number;
  accountable_person?: string;
  current_location?: string;
  date_received?: string;
  remarks?: string;
  property_tag?: string;
  property_from?: string;
  category_id?: string;
  _error?: string;
  _selected?: boolean;
}

interface InventoryImportPreviewProps {
  items: ParsedItem[];
  categories: { id: string; name: string }[];
  onItemsChange: (items: ParsedItem[]) => void;
  onBack: () => void;
  onComplete: () => void;
}

const conditionOptions = [
  'Excellent Condition',
  'Good Condition',
  'Fair Condition',
  'Poor Condition',
];

const utilizationOptions = [
  'In Use',
  'Idle',
  'Standby',
  'Under Repair',
  'For Disposal',
];

export default function InventoryImportPreview({
  items,
  categories,
  onItemsChange,
  onBack,
  onComplete,
}: InventoryImportPreviewProps) {
  const [isImporting, setIsImporting] = useState(false);

  const selectedCount = items.filter(i => i._selected && !i._error).length;
  const errorCount = items.filter(i => i._error).length;
  const validCount = items.filter(i => !i._error).length;

  const toggleSelectAll = (checked: boolean) => {
    onItemsChange(items.map(item => ({
      ...item,
      _selected: item._error ? false : checked,
    })));
  };

  const toggleItem = (index: number) => {
    const newItems = [...items];
    newItems[index]._selected = !newItems[index]._selected;
    onItemsChange(newItems);
  };

  const updateItem = (index: number, field: keyof ParsedItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Clear error if name is now provided
    if (field === 'name' && value && newItems[index]._error?.includes('name')) {
      delete newItems[index]._error;
      newItems[index]._selected = true;
    }
    
    onItemsChange(newItems);
  };

  const handleImport = async () => {
    const itemsToImport = items.filter(i => i._selected && !i._error && i.name);
    
    if (itemsToImport.length === 0) {
      toast.error('No valid items selected for import');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Process in batches of 20
      const batchSize = 20;
      for (let i = 0; i < itemsToImport.length; i += batchSize) {
        const batch = itemsToImport.slice(i, i + batchSize);
        
        // Generate product IDs for each item
        const itemsWithIds = await Promise.all(
          batch.map(async (item) => {
            const { data: productId } = await supabase.rpc('generate_product_id');
            
            // Clean up internal fields and ensure name is present
            const { _error, _selected, ...cleanItem } = item;
            
            return {
              ...cleanItem,
              name: item.name!, // We've already filtered for items with names
              product_id: productId,
              quantity: item.quantity || 1,
            };
          })
        );

        const { error } = await supabase
          .from('inventory_items')
          .insert(itemsWithIds);

        if (error) {
          console.error('Batch insert error:', error);
          failCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} item${successCount !== 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} item${failCount !== 1 ? 's' : ''}`);
      }

      if (successCount > 0) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const allSelected = items.filter(i => !i._error).every(i => i._selected);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Summary bar */}
      <div className="flex items-center justify-between py-3 px-1 border-b">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>{validCount} valid</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>{errorCount} with errors</span>
            </div>
          )}
          <div className="text-muted-foreground">
            {selectedCount} selected for import
          </div>
        </div>
      </div>

      {/* Scrollable table */}
      <ScrollArea className="flex-1 min-h-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="min-w-[200px]">Name *</TableHead>
              <TableHead className="min-w-[150px]">Brand/Model</TableHead>
              <TableHead className="min-w-[120px]">Property No.</TableHead>
              <TableHead className="min-w-[120px]">Serial No.</TableHead>
              <TableHead className="min-w-[150px]">Condition</TableHead>
              <TableHead className="min-w-[130px]">Status</TableHead>
              <TableHead className="min-w-[150px]">Category</TableHead>
              <TableHead className="min-w-[150px]">Accountable Person</TableHead>
              <TableHead className="w-20">Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow 
                key={index}
                className={item._error ? 'bg-destructive/5' : item._selected ? '' : 'opacity-50'}
              >
                <TableCell>
                  <Checkbox
                    checked={item._selected || false}
                    onCheckedChange={() => toggleItem(index)}
                    disabled={!!item._error}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {index + 1}
                    {item._error && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={item.name || ''}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className={`h-8 ${!item.name ? 'border-destructive' : ''}`}
                    placeholder="Required"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.brand_model || ''}
                    onChange={(e) => updateItem(index, 'brand_model', e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.property_number || ''}
                    onChange={(e) => updateItem(index, 'property_number', e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.serial_number || ''}
                    onChange={(e) => updateItem(index, 'serial_number', e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={item.condition || ''}
                    onValueChange={(v) => updateItem(index, 'condition', v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt.replace(' Condition', '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.utilization_status || ''}
                    onValueChange={(v) => updateItem(index, 'utilization_status', v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {utilizationOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.category_id || ''}
                    onValueChange={(v) => updateItem(index, 'category_id', v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={item.accountable_person || ''}
                    onChange={(e) => updateItem(index, 'accountable_person', e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity || 1}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="h-8 w-16"
                    min={1}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t mt-auto">
        <Button variant="outline" onClick={onBack} disabled={isImporting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={selectedCount === 0 || isImporting}
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>Import {selectedCount} Item{selectedCount !== 1 ? 's' : ''}</>
          )}
        </Button>
      </div>
    </div>
  );
}
