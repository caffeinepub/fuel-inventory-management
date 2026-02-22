import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Tank {
    id: string;
    threshold: number;
    currentVolume: number;
    fuelType: FuelType;
    capacity: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PriceUpdate {
    fuelType: FuelType;
    newPrice: number;
    effectiveDate: bigint;
}
export interface Sale {
    id: bigint;
    total: number;
    staffId: Principal;
    rate: number;
    endTotalizer: number;
    openTotalizer: number;
    fuelType: FuelType;
    timestamp: bigint;
    quantity: number;
    saleDate: bigint;
}
export interface Expense {
    id: bigint;
    description: string;
    timestamp: bigint;
    category: ExpenseCategory;
    amount: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OfflineData {
    expenses: Array<Expense>;
    sales: Array<Sale>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface CashCollection {
    id: bigint;
    breakdown: string;
    timestamp: bigint;
    amount: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Staff {
    id: Principal;
    name: string;
    role: StaffRole;
    serialNumber: bigint;
    commissionRate: number;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface ShiftView {
    id: bigint;
    startTime: bigint;
    staffId: Principal;
    endTime?: bigint;
    sales: Array<Sale>;
    shiftDate: bigint;
}
export interface UserProfile {
    staffRole?: StaffRole;
    name: string;
    phoneNumber: string;
}
export enum ExpenseCategory {
    supplies = "supplies",
    electricity = "electricity",
    maintenance = "maintenance",
    salaries = "salaries"
}
export enum FuelType {
    petrol = "petrol",
    diesel = "diesel"
}
export enum StaffRole {
    manager = "manager",
    owner = "owner",
    operator = "operator",
    attendant = "attendant"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStaffMember(name: string, id: Principal, role: StaffRole, commissionRate: number): Promise<void>;
    addTank(tank: Tank): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    endShift(shiftId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCashCollections(): Promise<Array<CashCollection>>;
    getCurrentPrices(): Promise<Array<[FuelType, number]>>;
    getExpenses(): Promise<Array<Expense>>;
    getPriceHistory(): Promise<Array<PriceUpdate>>;
    getSales(): Promise<Array<Sale>>;
    getSalesAndExpenses(): Promise<[Array<Sale>, Array<Expense>]>;
    getShifts(): Promise<Array<ShiftView>>;
    getStaff(): Promise<Array<Staff>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTanks(): Promise<Array<Tank>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    recordCashCollection(amount: number, breakdown: string): Promise<void>;
    recordExpense(category: ExpenseCategory, amount: number, description: string): Promise<void>;
    recordSale(fuelType: FuelType, quantity: number, rate: number, openTotalizer: number, endTotalizer: number, saleDate: bigint, staffId: Principal): Promise<void>;
    removeStaff(staffId: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    startShift(staffId: Principal, shiftDate: bigint): Promise<bigint>;
    syncOfflineData(offlineData: OfflineData): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePrice(fuelType: FuelType, newPrice: number): Promise<void>;
    updateStaff(staffId: Principal, updatedStaff: Staff): Promise<void>;
    updateTankLevel(id: string, volume: number): Promise<void>;
}
