import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Tank,
  Sale,
  Expense,
  Staff,
  ShiftView,
  CashCollection,
  PriceUpdate,
  FuelType,
  ExpenseCategory,
  UserProfile,
  StripeConfiguration,
  ShoppingItem,
} from '../backend';
import { StaffRole } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCanManageStaff() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const canManage = userProfile?.staffRole === StaffRole.owner || userProfile?.staffRole === StaffRole.manager;

  return {
    data: canManage,
    isLoading,
  };
}

// Tank Queries
export function useGetTanks() {
  const { actor, isFetching } = useActor();

  return useQuery<Tank[]>({
    queryKey: ['tanks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTanks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTank() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tank: Tank) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTank(tank);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tanks'] });
    },
  });
}

export function useUpdateTankLevel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, volume }: { id: string; volume: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTankLevel(id, volume);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tanks'] });
    },
  });
}

// Sales Queries
export function useGetSales() {
  const { actor, isFetching } = useActor();

  return useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSales();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fuelType,
      quantity,
      rate,
      staffId,
    }: {
      fuelType: FuelType;
      quantity: number;
      rate: number;
      staffId: Principal;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordSale(fuelType, quantity, rate, staffId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['tanks'] });
    },
  });
}

// Expense Queries
export function useGetExpenses() {
  const { actor, isFetching } = useActor();

  return useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      amount,
      description,
    }: {
      category: ExpenseCategory;
      amount: number;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordExpense(category, amount, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// Staff Queries
export function useGetStaff() {
  const { actor, isFetching } = useActor();

  return useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStaff();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staff: Staff) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStaffMember(staff);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, staff }: { staffId: Principal; staff: Staff }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaff(staffId, staff);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useRemoveStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeStaff(staffId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// Shift Queries
export function useGetShifts() {
  const { actor, isFetching } = useActor();

  return useQuery<ShiftView[]>({
    queryKey: ['shifts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShifts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStartShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startShift(staffId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useEndShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shiftId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.endShift(shiftId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

// Cash Collection Queries
export function useGetCashCollections() {
  const { actor, isFetching } = useActor();

  return useQuery<CashCollection[]>({
    queryKey: ['cashCollections'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCashCollections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordCashCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, breakdown }: { amount: number; breakdown: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordCashCollection(amount, breakdown);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashCollections'] });
    },
  });
}

// Price Queries
export function useGetCurrentPrices() {
  const { actor, isFetching } = useActor();

  return useQuery<[FuelType, number][]>({
    queryKey: ['currentPrices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCurrentPrices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPriceHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<PriceUpdate[]>({
    queryKey: ['priceHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPriceHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fuelType, newPrice }: { fuelType: FuelType; newPrice: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePrice(fuelType, newPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPrices'] });
      queryClient.invalidateQueries({ queryKey: ['priceHistory'] });
    },
  });
}

// Financial Queries
export function useGetSalesAndExpenses() {
  const { actor, isFetching } = useActor();

  return useQuery<[Sale[], Expense[]]>({
    queryKey: ['salesAndExpenses'],
    queryFn: async () => {
      if (!actor) return [[], []];
      return actor.getSalesAndExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

// Stripe Queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<{ id: string; url: string }> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}
