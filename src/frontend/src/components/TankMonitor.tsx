import { useState } from 'react';
import { useGetTanks, useUpdateTankLevel, useAddTank } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Fuel, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { FuelType } from '../backend';

export default function TankMonitor() {
  const { data: tanks = [], isLoading } = useGetTanks();
  const updateTankLevel = useUpdateTankLevel();
  const addTank = useAddTank();

  const [selectedTank, setSelectedTank] = useState<string | null>(null);
  const [newVolume, setNewVolume] = useState('');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTankId, setNewTankId] = useState('');
  const [newTankType, setNewTankType] = useState<FuelType>('petrol' as FuelType);
  const [newTankCapacity, setNewTankCapacity] = useState('');
  const [newTankVolume, setNewTankVolume] = useState('');
  const [newTankThreshold, setNewTankThreshold] = useState('');

  const handleUpdateLevel = async () => {
    if (!selectedTank || !newVolume) return;

    try {
      await updateTankLevel.mutateAsync({ id: selectedTank, volume: parseFloat(newVolume) });
      toast.success('Tank level updated successfully');
      setIsUpdateDialogOpen(false);
      setSelectedTank(null);
      setNewVolume('');
    } catch (error) {
      toast.error('Failed to update tank level');
    }
  };

  const handleAddTank = async () => {
    if (!newTankId || !newTankCapacity || !newTankVolume || !newTankThreshold) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await addTank.mutateAsync({
        id: newTankId,
        fuelType: newTankType,
        capacity: parseFloat(newTankCapacity),
        currentVolume: parseFloat(newTankVolume),
        threshold: parseFloat(newTankThreshold),
      });
      toast.success('Tank added successfully');
      setIsAddDialogOpen(false);
      setNewTankId('');
      setNewTankCapacity('');
      setNewTankVolume('');
      setNewTankThreshold('');
    } catch (error) {
      toast.error('Failed to add tank');
    }
  };

  if (isLoading) {
    return <div>Loading tanks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tank Monitor</h1>
          <p className="text-muted-foreground mt-1">Monitor fuel levels across all tanks</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tank
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tank</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tankId">Tank ID</Label>
                <Input
                  id="tankId"
                  value={newTankId}
                  onChange={(e) => setNewTankId(e.target.value)}
                  placeholder="e.g., TANK-001"
                />
              </div>
              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select value={newTankType} onValueChange={(v) => setNewTankType(v as FuelType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (Liters)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newTankCapacity}
                  onChange={(e) => setNewTankCapacity(e.target.value)}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="currentVolume">Current Volume (Liters)</Label>
                <Input
                  id="currentVolume"
                  type="number"
                  value={newTankVolume}
                  onChange={(e) => setNewTankVolume(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="threshold">Threshold (Liters)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newTankThreshold}
                  onChange={(e) => setNewTankThreshold(e.target.value)}
                  placeholder="2000"
                />
              </div>
              <Button onClick={handleAddTank} className="w-full" disabled={addTank.isPending}>
                {addTank.isPending ? 'Adding...' : 'Add Tank'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tanks.map((tank) => {
          const percentage = (tank.currentVolume / tank.capacity) * 100;
          const isLow = tank.currentVolume < tank.threshold;

          return (
            <Card key={tank.id} className={isLow ? 'border-destructive' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="w-5 h-5" />
                  {tank.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">
                      {tank.fuelType === 'petrol' ? 'Petrol' : 'Diesel'}
                    </span>
                    <span className={isLow ? 'text-destructive font-semibold' : ''}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-semibold">{tank.currentVolume.toFixed(0)} L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-semibold">{tank.capacity.toFixed(0)} L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Threshold</p>
                    <p className="font-semibold">{tank.threshold.toFixed(0)} L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-semibold">{(tank.capacity - tank.currentVolume).toFixed(0)} L</p>
                  </div>
                </div>

                {isLow && (
                  <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
                    ⚠️ Low fuel - Refill required
                  </div>
                )}

                <Dialog
                  open={isUpdateDialogOpen && selectedTank === tank.id}
                  onOpenChange={(open) => {
                    setIsUpdateDialogOpen(open);
                    if (!open) setSelectedTank(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedTank(tank.id);
                        setNewVolume(tank.currentVolume.toString());
                      }}
                    >
                      Update Level
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Tank Level - {tank.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="volume">New Volume (Liters)</Label>
                        <Input
                          id="volume"
                          type="number"
                          value={newVolume}
                          onChange={(e) => setNewVolume(e.target.value)}
                          max={tank.capacity}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Max capacity: {tank.capacity} L
                        </p>
                      </div>
                      <Button
                        onClick={handleUpdateLevel}
                        className="w-full"
                        disabled={updateTankLevel.isPending}
                      >
                        {updateTankLevel.isPending ? 'Updating...' : 'Update Level'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tanks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Fuel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tanks configured yet. Add your first tank to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
