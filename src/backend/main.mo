import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";

import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    phoneNumber : Text;
    staffRole : ?StaffRole;
  };

  // Core Types
  public type FuelType = { #petrol; #diesel };
  public type StaffRole = { #manager; #operator; #attendant; #owner };

  module FuelType {
    public func compare(l : FuelType, r : FuelType) : Order.Order {
      switch (l, r) {
        case (#petrol, #petrol) { #equal };
        case (#diesel, #diesel) { #equal };
        case (#petrol, #diesel) { #less };
        case (#diesel, #petrol) { #greater };
      };
    };
  };

  public type Tank = {
    id : Text;
    fuelType : FuelType;
    capacity : Float;
    currentVolume : Float;
    threshold : Float;
  };

  public type Sale = {
    id : Nat;
    fuelType : FuelType;
    quantity : Float;
    rate : Float;
    total : Float;
    staffId : Principal;
    timestamp : Int;
  };

  public type ExpenseCategory = {
    #maintenance;
    #electricity;
    #salaries;
    #supplies;
  };

  public type Expense = {
    id : Nat;
    category : ExpenseCategory;
    amount : Float;
    description : Text;
    timestamp : Int;
  };

  public type Staff = {
    id : Principal;
    name : Text;
    role : StaffRole;
    commissionRate : Float;
  };

  public type Shift = {
    id : Nat;
    staffId : Principal;
    startTime : Int;
    endTime : ?Int;
    sales : List.List<Sale>;
  };

  public type ShiftView = {
    id : Nat;
    staffId : Principal;
    startTime : Int;
    endTime : ?Int;
    sales : [Sale];
  };

  public type CashCollection = {
    id : Nat;
    amount : Float;
    breakdown : Text;
    timestamp : Int;
  };

  public type PriceUpdate = {
    fuelType : FuelType;
    newPrice : Float;
    effectiveDate : Int;
  };

  // State Variables
  var nextSaleId = 0;
  var nextExpenseId = 0;
  var nextShiftId = 0;
  var nextCashCollectionId = 0;
  var nextServiceLogId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let tanks = Map.empty<Text, Tank>();
  let sales = Map.empty<Nat, Sale>();
  let expenses = Map.empty<Nat, Expense>();
  let staff = Map.empty<Principal, Staff>();
  let shifts = Map.empty<Nat, Shift>();
  let cashCollections = Map.empty<Nat, CashCollection>();
  let priceUpdates = Map.empty<FuelType, PriceUpdate>();

  // Stripe Integration
  var configuration : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to get fuel price
  func getFuelPrice(fuelType : FuelType) : Float {
    switch (priceUpdates.get(fuelType)) {
      case (null) { switch (fuelType) { case (#petrol) { 100.0 }; case (#diesel) { 90.0 } } };
      case (?update) { update.newPrice };
    };
  };

  // Financial reporting - requires user permission
  public query ({ caller }) func getSalesAndExpenses() : async ([Sale], [Expense]) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view financial data");
    };
    let salesArray = sales.values().toArray();
    let expensesArray = expenses.values().toArray();
    (salesArray, expensesArray);
  };

  // Tank Management
  public query ({ caller }) func getTanks() : async [Tank] {
    // Public read access - anyone can view tank levels
    tanks.values().toArray();
  };

  public shared ({ caller }) func addTank(tank : Tank) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add tanks");
    };
    tanks.add(tank.id, tank);
  };

  public shared ({ caller }) func updateTankLevel(id : Text, volume : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tank levels");
    };
    switch (tanks.get(id)) {
      case (null) { Runtime.trap("Tank not found") };
      case (?tank) {
        let updatedTank = { tank with currentVolume = volume };
        tanks.add(id, updatedTank);
      };
    };
  };

  // Sales Management
  public shared ({ caller }) func recordSale(fuelType : FuelType, quantity : Float, rate : Float, staffId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record sales");
    };

    // Verify caller can record sales for this staff member
    if (caller != staffId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only record sales for yourself unless admin");
    };

    // Verify the staff member exists
    switch (staff.get(staffId)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?_) {};
    };

    let total = quantity * rate;
    let sale = {
      id = nextSaleId;
      fuelType;
      quantity;
      rate;
      total;
      staffId;
      timestamp = Time.now();
    };
    sales.add(nextSaleId, sale);
    nextSaleId += 1;
  };

  public query ({ caller }) func getSales() : async [Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };
    sales.values().toArray();
  };

  // Expense Management
  public shared ({ caller }) func recordExpense(category : ExpenseCategory, amount : Float, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record expenses");
    };
    let expense = {
      id = nextExpenseId;
      category;
      amount;
      description;
      timestamp = Time.now();
    };
    expenses.add(nextExpenseId, expense);
    nextExpenseId += 1;
  };

  public query ({ caller }) func getExpenses() : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    expenses.values().toArray();
  };

  // Staff Management
  public shared ({ caller }) func addStaffMember(staffMember : Staff) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add staff members");
    };

    // Validate that the Principal is not anonymous
    if (staffMember.id.isAnonymous()) {
      Runtime.trap("Invalid: Cannot add anonymous principal as staff member");
    };

    // Check if staff member already exists
    switch (staff.get(staffMember.id)) {
      case (?existing) {
        Runtime.trap("Staff member with this Principal ID already exists");
      };
      case (null) {};
    };

    // Add staff member to staff map
    staff.add(staffMember.id, staffMember);

    // Assign appropriate access control role based on staff role
    let accessRole : AccessControl.UserRole = switch (staffMember.role) {
      case (#owner) { #admin };
      case (#manager) { #admin };
      case (#operator) { #user };
      case (#attendant) { #user };
    };

    // Assign the role in the access control system
    AccessControl.assignRole(accessControlState, caller, staffMember.id, accessRole);
  };

  public query ({ caller }) func getStaff() : async [Staff] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view staff");
    };
    staff.values().toArray();
  };

  public shared ({ caller }) func updateStaff(staffId : Principal, staffMember : Staff) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update staff");
    };

    // Verify staff member exists
    switch (staff.get(staffId)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?_) {};
    };

    // Validate that the new Principal ID matches the staffId being updated
    if (staffMember.id != staffId) {
      Runtime.trap("Invalid: Cannot change staff member Principal ID");
    };

    // Update staff member
    staff.add(staffId, staffMember);

    // Update access control role if staff role changed
    let accessRole : AccessControl.UserRole = switch (staffMember.role) {
      case (#owner) { #admin };
      case (#manager) { #admin };
      case (#operator) { #user };
      case (#attendant) { #user };
    };

    AccessControl.assignRole(accessControlState, caller, staffMember.id, accessRole);
  };

  public shared ({ caller }) func removeStaff(staffId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove staff");
    };

    // Verify staff member exists before removing
    switch (staff.get(staffId)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?_) {
        staff.remove(staffId);
        // Note: We don't remove the access control role as the user may still need access
        // Admins can manually revoke roles if needed using assignRole with #guest
      };
    };
  };

  // Shift Management
  public shared ({ caller }) func startShift(staffId : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start shifts");
    };

    // Verify caller can start shift for this staff member
    if (caller != staffId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only start shifts for yourself unless admin");
    };

    // Verify the staff member exists
    switch (staff.get(staffId)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?_) {};
    };

    let shift = {
      id = nextShiftId;
      staffId;
      startTime = Time.now();
      endTime = null;
      sales = List.empty<Sale>();
    };
    shifts.add(nextShiftId, shift);
    let shiftId = nextShiftId;
    nextShiftId += 1;
    shiftId;
  };

  public shared ({ caller }) func endShift(shiftId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end shifts");
    };
    switch (shifts.get(shiftId)) {
      case (null) { Runtime.trap("Shift not found") };
      case (?shift) {
        // Verify caller can end this shift
        if (caller != shift.staffId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only end your own shifts unless admin");
        };
        let updatedShift = { shift with endTime = ?Time.now() };
        shifts.add(shiftId, updatedShift);
      };
    };
  };

  public query ({ caller }) func getShifts() : async [ShiftView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view shifts");
    };
    let shiftViews : List.List<ShiftView> = List.empty<ShiftView>();
    for (shift in shifts.values()) {
      let shiftView : ShiftView = {
        id = shift.id;
        staffId = shift.staffId;
        startTime = shift.startTime;
        endTime = shift.endTime;
        sales = shift.sales.toArray();
      };
      shiftViews.add(shiftView);
    };
    shiftViews.toArray();
  };

  // Cash Collection Management
  public shared ({ caller }) func recordCashCollection(amount : Float, breakdown : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record cash collections");
    };
    let collection = {
      id = nextCashCollectionId;
      amount;
      breakdown;
      timestamp = Time.now();
    };
    cashCollections.add(nextCashCollectionId, collection);
    nextCashCollectionId += 1;
  };

  public query ({ caller }) func getCashCollections() : async [CashCollection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cash collections");
    };
    cashCollections.values().toArray();
  };

  // Price Update Management - Admin only
  public shared ({ caller }) func updatePrice(fuelType : FuelType, newPrice : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update prices");
    };
    let priceUpdate = { fuelType; newPrice; effectiveDate = Time.now() };
    priceUpdates.add(fuelType, priceUpdate);
  };

  public query ({ caller }) func getCurrentPrices() : async [(FuelType, Float)] {
    [
      (#petrol, getFuelPrice(#petrol)),
      (#diesel, getFuelPrice(#diesel)),
    ];
  };

  public query ({ caller }) func getPriceHistory() : async [PriceUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view price history");
    };
    priceUpdates.values().toArray();
  };

  //--------------
  // Offline Sync (call from frontend when connection is restored)
  //--------------
  public shared ({ caller }) func syncOfflineData(offlineData : OfflineData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can sync data");
    };

    // Verify ownership of all sales records
    for (sale in offlineData.sales.values()) {
      if (sale.staffId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
        Runtime.trap("Unauthorized: Cannot sync sales records for other staff members");
      };
      // Verify the staff member exists
      switch (staff.get(sale.staffId)) {
        case (null) { Runtime.trap("Staff member not found for sale record") };
        case (?_) {};
      };
    };

    syncExpenses(offlineData.expenses);
    syncSales(offlineData.sales);
  };

  public type OfflineData = {
    expenses : [Expense];
    sales : [Sale];
  };

  // Helper function to sync expenses
  func syncExpenses(entries : [Expense]) {
    for (entry in entries.values()) {
      expenses.add(entry.id, entry);
      let maxId = Nat.max(nextExpenseId, entry.id + 1);
      nextExpenseId := maxId;
    };
  };

  // Helper function to sync sales
  func syncSales(entries : [Sale]) {
    for (entry in entries.values()) {
      sales.add(entry.id, entry);
      let maxId = Nat.max(nextSaleId, entry.id + 1);
      nextSaleId := maxId;
    };
  };
};
