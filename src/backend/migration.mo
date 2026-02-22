import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Old types
  type OldExpense = {
    id : Nat;
    category : {
      #maintenance;
      #electricity;
      #salaries;
      #supplies;
    };
    amount : Float;
    description : Text;
    timestamp : Int;
  };

  type OldSale = {
    id : Nat;
    fuelType : {
      #petrol;
      #diesel;
    };
    quantity : Float;
    rate : Float;
    total : Float;
    staffId : Principal;
    timestamp : Int;
  };

  type OldStaff = {
    id : Principal;
    serialNumber : Nat;
    name : Text;
    role : { #manager; #operator; #attendant; #owner };
    commissionRate : Float;
  };

  type OldShift = {
    id : Nat;
    staffId : Principal;
    startTime : Int;
    endTime : ?Int;
    sales : List.List<OldSale>;
  };

  type OldCashCollection = {
    id : Nat;
    amount : Float;
    breakdown : Text;
    timestamp : Int;
  };

  type OldPriceUpdate = {
    fuelType : { #petrol; #diesel };
    newPrice : Float;
    effectiveDate : Int;
  };

  type OldActor = {
    nextSaleId : Nat;
    nextExpenseId : Nat;
    nextShiftId : Nat;
    nextCashCollectionId : Nat;
    nextServiceLogId : Nat;
    nextSerialNumber : Nat;
    expenses : Map.Map<Nat, OldExpense>;
    sales : Map.Map<Nat, OldSale>;
    staff : Map.Map<Principal, OldStaff>;
    shifts : Map.Map<Nat, OldShift>;
    cashCollections : Map.Map<Nat, OldCashCollection>;
    priceUpdates : Map.Map<{ #petrol; #diesel }, OldPriceUpdate>;
  };

  // New types
  type NewExpense = {
    id : Nat;
    category : {
      #maintenance;
      #electricity;
      #salaries;
      #supplies;
    };
    amount : Float;
    description : Text;
    timestamp : Int;
  };

  type NewSale = {
    id : Nat;
    fuelType : {
      #petrol;
      #diesel;
    };
    quantity : Float;
    rate : Float;
    total : Float;
    openTotalizer : Float;
    endTotalizer : Float;
    staffId : Principal;
    timestamp : Int;
    saleDate : Int;
  };

  type NewStaff = {
    id : Principal;
    serialNumber : Nat;
    name : Text;
    role : { #manager; #operator; #attendant; #owner };
    commissionRate : Float;
  };

  type NewShift = {
    id : Nat;
    staffId : Principal;
    startTime : Int;
    endTime : ?Int;
    sales : List.List<NewSale>;
    shiftDate : Int;
  };

  type NewCashCollection = {
    id : Nat;
    amount : Float;
    breakdown : Text;
    timestamp : Int;
  };

  type NewPriceUpdate = {
    fuelType : { #petrol; #diesel };
    newPrice : Float;
    effectiveDate : Int;
  };

  type NewActor = {
    nextSaleId : Nat;
    nextExpenseId : Nat;
    nextShiftId : Nat;
    nextCashCollectionId : Nat;
    nextServiceLogId : Nat;
    nextSerialNumber : Nat;
    expenses : Map.Map<Nat, NewExpense>;
    sales : Map.Map<Nat, NewSale>;
    staff : Map.Map<Principal, NewStaff>;
    shifts : Map.Map<Nat, NewShift>;
    cashCollections : Map.Map<Nat, NewCashCollection>;
    priceUpdates : Map.Map<{ #petrol; #diesel }, NewPriceUpdate>;
  };

  func convertOldSaleToNew(oldSale : OldSale) : NewSale {
    {
      oldSale with
      openTotalizer = 0.0;
      endTotalizer = 0.0;
      saleDate = oldSale.timestamp;
    };
  };

  func convertOldSalesListToNew(oldSales : List.List<OldSale>) : List.List<NewSale> {
    oldSales.map<OldSale, NewSale>(
      func(oldSale) {
        convertOldSaleToNew(oldSale);
      }
    );
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      expenses = old.expenses;
      sales = old.sales.map<Nat, OldSale, NewSale>(
        func(_id, sale) {
          convertOldSaleToNew(sale);
        }
      );
      staff = old.staff;
      shifts = old.shifts.map<Nat, OldShift, NewShift>(
        func(_id, shift) {
          {
            shift with
            sales = convertOldSalesListToNew(shift.sales);
            shiftDate = shift.startTime;
          };
        }
      );
      cashCollections = old.cashCollections;
      priceUpdates = old.priceUpdates;
    };
  };
};
