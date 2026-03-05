import { useEffect, useState } from "react";
import type { Expense, Sale } from "../backend";

const STORAGE_KEYS = {
  SALES: "offline_sales",
  EXPENSES: "offline_expenses",
};

export interface OfflineStorageData {
  sales: Sale[];
  expenses: Expense[];
}

export function useOfflineStorage() {
  const [pendingData, setPendingData] = useState<OfflineStorageData>({
    sales: [],
    expenses: [],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      const salesStr = localStorage.getItem(STORAGE_KEYS.SALES);
      const expensesStr = localStorage.getItem(STORAGE_KEYS.EXPENSES);

      setPendingData({
        sales: salesStr ? JSON.parse(salesStr) : [],
        expenses: expensesStr ? JSON.parse(expensesStr) : [],
      });
    } catch (error) {
      console.error("Failed to load offline data:", error);
    }
  };

  const addSale = (sale: Sale) => {
    try {
      const current = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SALES) || "[]",
      );
      const updated = [...current, sale];
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
      loadFromStorage();
    } catch (error) {
      console.error("Failed to save sale offline:", error);
      throw error;
    }
  };

  const addExpense = (expense: Expense) => {
    try {
      const current = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.EXPENSES) || "[]",
      );
      const updated = [...current, expense];
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
      loadFromStorage();
    } catch (error) {
      console.error("Failed to save expense offline:", error);
      throw error;
    }
  };

  const clearAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SALES);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      setPendingData({ sales: [], expenses: [] });
    } catch (error) {
      console.error("Failed to clear offline data:", error);
    }
  };

  const getPendingCount = () => {
    return pendingData.sales.length + pendingData.expenses.length;
  };

  const hasPendingData = () => {
    return getPendingCount() > 0;
  };

  return {
    pendingData,
    addSale,
    addExpense,
    clearAll,
    getPendingCount,
    hasPendingData,
    reload: loadFromStorage,
  };
}
