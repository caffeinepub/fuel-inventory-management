import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // Old Staff Type without serial number.
  type OldStaff = {
    id : Principal;
    name : Text;
    role : {
      #manager;
      #operator;
      #attendant;
      #owner;
    };
    commissionRate : Float;
  };

  // Old Shift Type with sales as List
  type OldShift = {
    id : Nat;
    staffId : Principal;
    startTime : Int;
    endTime : ?Int;
    sales : List.List<OldSale>; // Make persistent array for compatibility
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

  // Old actor type
  type OldActor = {
    nextSaleId : Nat;
    nextExpenseId : Nat;
    nextShiftId : Nat;
    nextCashCollectionId : Nat;
    nextServiceLogId : Nat;
    userProfiles : Map.Map<Principal, {
      name : Text;
      phoneNumber : Text;
      staffRole : ?{
        #manager;
        #operator;
        #attendant;
        #owner;
      };
    }>;
    tanks : Map.Map<Text, {
      id : Text;
      fuelType : {
        #petrol;
        #diesel;
      };
      capacity : Float;
      currentVolume : Float;
      threshold : Float;
    }>;
    sales : Map.Map<Nat, {
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
    }>;
    expenses : Map.Map<Nat, {
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
    }>;
    staff : Map.Map<Principal, OldStaff>;
    shifts : Map.Map<Nat, OldShift>;
    cashCollections : Map.Map<Nat, {
      id : Nat;
      amount : Float;
      breakdown : Text;
      timestamp : Int;
    }>;
    priceUpdates : Map.Map<{
      #petrol;
      #diesel;
    }, {
      fuelType : {
        #petrol;
        #diesel;
      };
      newPrice : Float;
      effectiveDate : Int;
    }>;
  };

  // New Staff Type with serial number.
  type NewStaff = {
    id : Principal;
    serialNumber : Nat;
    name : Text;
    role : {
      #manager;
      #operator;
      #attendant;
      #owner;
    };
    commissionRate : Float;
  };

  // New Shift Type with sales as List
  type NewShift = {
    id : Nat;
    staffId : Principal;
    startTime : Int;
    endTime : ?Int;
    sales : List.List<OldSale>; // Use List for compatibility
  };

  // New actor type
  type NewActor = {
    nextSaleId : Nat;
    nextExpenseId : Nat;
    nextShiftId : Nat;
    nextCashCollectionId : Nat;
    nextServiceLogId : Nat;
    nextSerialNumber : Nat;
    userProfiles : Map.Map<Principal, {
      name : Text;
      phoneNumber : Text;
      staffRole : ?{
        #manager;
        #operator;
        #attendant;
        #owner;
      };
    }>;
    tanks : Map.Map<Text, {
      id : Text;
      fuelType : {
        #petrol;
        #diesel;
      };
      capacity : Float;
      currentVolume : Float;
      threshold : Float;
    }>;
    sales : Map.Map<Nat, {
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
    }>;
    expenses : Map.Map<Nat, {
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
    }>;
    staff : Map.Map<Principal, NewStaff>;
    shifts : Map.Map<Nat, NewShift>;
    cashCollections : Map.Map<Nat, {
      id : Nat;
      amount : Float;
      breakdown : Text;
      timestamp : Int;
    }>;
    priceUpdates : Map.Map<{
      #petrol;
      #diesel;
    }, {
      fuelType : {
        #petrol;
        #diesel;
      };
      newPrice : Float;
      effectiveDate : Int;
    }>;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newStaff = old.staff.map<Principal, OldStaff, NewStaff>(
      func(_id, oldStaff) {
        {
          oldStaff with
          serialNumber = 0; // Default old data with serial number at 0.
        };
      },
    );
    {
      old with
      staff = newStaff;
      nextSerialNumber = 1;
    };
  };
};
