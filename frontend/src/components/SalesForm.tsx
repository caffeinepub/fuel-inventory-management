import { useState, useEffect } from 'react';
import { useRecordSale, useGetCurrentPrices, useGetStaff } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useConnectionMonitor } from '../hooks/useConnectionMonitor';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import type { FuelType, Sale } from '../backend';
import { Principal } from '@dfinity/principal';
import { WifiOff, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesForm() {
  const { identity } = useInternetIdentity();
  const recordSale = useRecordSale();
  const { data: prices = [] } = useGetCurrentPrices();
  const { data: staff = [] } = useGetStaff();
  const { isConnected } = useConnectionMonitor();
  const { addSale } = useOfflineStorage();

  const [fuelType, setFuelType] = useState<FuelType>('petrol' as FuelType);
  const [quantity, setQuantity] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [saleTime, setSaleTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [openTotalizer, setOpenTotalizer] = useState('');
  const [endTotalizer, setEndTotalizer] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const currentPrice = prices.find((p) => p[0] === fuelType)?.[1] || 0;
  const total = parseFloat(quantity || '0') * currentPrice;

  // Calculate volume from totalizers
  const calculatedVolume = parseFloat(endTotalizer || '0') - parseFloat(openTotalizer || '0');
  const isValidTotalizer = !!(endTotalizer && openTotalizer && calculatedVolume >= 0);
  const hasInvalidTotalizer = !!(endTotalizer && openTotalizer && calculatedVolume < 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!selectedStaffId) {
      toast.error('Please select a staff member');
      return;
    }

    if (!openTotalizer || !endTotalizer) {
      toast.error('Please enter both open and end totalizer readings');
      return;
    }

    if (hasInvalidTotalizer) {
      toast.error('End totalizer must be greater than or equal to open totalizer');
      return;
    }

    const staffId = Principal.fromText(selectedStaffId);

    // Combine date and time
    const [hours, minutes] = saleTime.split(':').map(Number);
    const combinedDateTime = new Date(saleDate);
    combinedDateTime.setHours(hours, minutes, 0, 0);
    const saleDateNanos = BigInt(combinedDateTime.getTime() * 1_000_000);

    if (!isConnected) {
      try {
        const offlineSale: Sale = {
          id: BigInt(Date.now()),
          fuelType,
          quantity: parseFloat(quantity),
          rate: currentPrice,
          total,
          openTotalizer: parseFloat(openTotalizer),
          endTotalizer: parseFloat(endTotalizer),
          staffId,
          timestamp: BigInt(Date.now() * 1_000_000),
          saleDate: saleDateNanos,
        };
        addSale(offlineSale);
        toast.success('Sale saved offline - will sync when online');
        setQuantity('');
        setOpenTotalizer('');
        setEndTotalizer('');
      } catch (error) {
        toast.error('Failed to save sale offline');
      }
      return;
    }

    try {
      await recordSale.mutateAsync({
        fuelType,
        quantity: parseFloat(quantity),
        rate: currentPrice,
        openTotalizer: parseFloat(openTotalizer),
        endTotalizer: parseFloat(endTotalizer),
        saleDate: saleDateNanos,
        staffId,
      });
      toast.success('Sale recorded successfully');
      setQuantity('');
      setOpenTotalizer('');
      setEndTotalizer('');
    } catch (error) {
      toast.error('Failed to record sale');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Sale</h1>
        <p className="text-muted-foreground mt-1">Record a new fuel sale transaction</p>
      </div>

      {!isConnected && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Offline Mode</p>
            <p className="text-sm text-muted-foreground">Sales will be saved locally and synced when connection is restored</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sale Details</span>
              {!isConnected && <Badge variant="destructive">Offline</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="saleDate">Sale Date & Time</Label>
                <div className="flex gap-2">
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(saleDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={saleDate}
                        onSelect={(date) => {
                          if (date) {
                            setSaleDate(date);
                            setIsCalendarOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={saleTime}
                    onChange={(e) => setSaleTime(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="openTotalizer">Open Totalizer</Label>
                  <Input
                    id="openTotalizer"
                    type="number"
                    step="0.01"
                    value={openTotalizer}
                    onChange={(e) => setOpenTotalizer(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="endTotalizer">End Totalizer</Label>
                  <Input
                    id="endTotalizer"
                    type="number"
                    step="0.01"
                    value={endTotalizer}
                    onChange={(e) => setEndTotalizer(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {isValidTotalizer && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Calculated Volume:</span>
                    <span className="text-lg font-bold">{calculatedVolume.toFixed(2)} liters</span>
                  </div>
                </div>
              )}

              {hasInvalidTotalizer && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">End totalizer must be greater than or equal to open totalizer</span>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity (Liters)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id.toString()} value={s.id.toString()}>
                        {s.name} - {String(s.role).charAt(0).toUpperCase() + String(s.role).slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Rate per Liter:</span>
                  <span className="font-medium">₹{currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={recordSale.isPending || hasInvalidTotalizer}
              >
                {recordSale.isPending ? 'Recording...' : isConnected ? 'Record Sale' : 'Save Offline'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prices.map(([type, price]) => (
                <div key={type} className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="font-medium">
                    {type === 'petrol' ? 'Petrol' : 'Diesel'}
                  </span>
                  <span className="text-lg font-bold">₹{price.toFixed(2)}/L</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
