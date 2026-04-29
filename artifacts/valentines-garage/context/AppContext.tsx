import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Role = "mechanic" | "manager";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type TruckCondition = "excellent" | "good" | "fair" | "poor";

export interface TruckCheckIn {
  id: string;
  truckNumber: string;
  driverName: string;
  kilometers: number;
  condition: TruckCondition;
  conditionNotes: string;
  photos: string[];
  checkedInBy: string;
  checkedInAt: string;
  status: "in-service" | "completed";
}

export interface ServiceTask {
  id: string;
  truckId: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  notes: string;
  category: string;
}

export const DEFAULT_TASKS = [
  { title: "Engine oil change", category: "Engine" },
  { title: "Oil filter replacement", category: "Engine" },
  { title: "Air filter inspection", category: "Engine" },
  { title: "Coolant level check", category: "Engine" },
  { title: "Brake inspection (front)", category: "Brakes" },
  { title: "Brake inspection (rear)", category: "Brakes" },
  { title: "Brake fluid check", category: "Brakes" },
  { title: "Tyre pressure check", category: "Tyres" },
  { title: "Tyre tread inspection", category: "Tyres" },
  { title: "Wheel alignment check", category: "Tyres" },
  { title: "Battery voltage test", category: "Electrical" },
  { title: "Headlights and indicators", category: "Electrical" },
  { title: "Gearbox fluid check", category: "Transmission" },
  { title: "Drive shaft inspection", category: "Transmission" },
  { title: "Suspension inspection", category: "Chassis" },
  { title: "Steering system check", category: "Chassis" },
  { title: "Exhaust system inspection", category: "Chassis" },
  { title: "Fuel system check", category: "Fuel" },
];

export const MECHANICS: User[] = [
  { id: "m1", name: "David Shikongo", role: "mechanic" },
  { id: "m2", name: "Thomas Amunyela", role: "mechanic" },
  { id: "m3", name: "Pauline Nghifindaka", role: "mechanic" },
  { id: "m4", name: "Joseph Hamutenya", role: "mechanic" },
];

export const MANAGER: User = { id: "manager", name: "Valentine", role: "manager" };

interface AppContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  trucks: TruckCheckIn[];
  tasks: ServiceTask[];
  checkInTruck: (truck: Omit<TruckCheckIn, "id" | "checkedInAt" | "status">) => string;
  updateTaskCompletion: (taskId: string, completed: boolean, notes: string) => void;
  markTruckComplete: (truckId: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const TRUCKS_KEY = "garage_trucks";
const TASKS_KEY = "garage_tasks";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trucks, setTrucks] = useState<TruckCheckIn[]>([]);
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trucksData, tasksData] = await Promise.all([
          AsyncStorage.getItem(TRUCKS_KEY),
          AsyncStorage.getItem(TASKS_KEY),
        ]);
        if (trucksData) setTrucks(JSON.parse(trucksData));
        if (tasksData) setTasks(JSON.parse(tasksData));
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveTrucks = useCallback(async (updated: TruckCheckIn[]) => {
    setTrucks(updated);
    await AsyncStorage.setItem(TRUCKS_KEY, JSON.stringify(updated));
  }, []);

  const saveTasks = useCallback(async (updated: ServiceTask[]) => {
    setTasks(updated);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  }, []);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const checkInTruck = useCallback(
    (truck: Omit<TruckCheckIn, "id" | "checkedInAt" | "status">) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newTruck: TruckCheckIn = {
        ...truck,
        id,
        checkedInAt: new Date().toISOString(),
        status: "in-service",
      };
      const newTasks: ServiceTask[] = DEFAULT_TASKS.map((t) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + t.title,
        truckId: id,
        title: t.title,
        category: t.category,
        completed: false,
        notes: "",
      }));
      const updatedTrucks = [newTruck, ...trucks];
      const updatedTasks = [...tasks, ...newTasks];
      saveTrucks(updatedTrucks);
      saveTasks(updatedTasks);
      return id;
    },
    [trucks, tasks, saveTrucks, saveTasks]
  );

  const updateTaskCompletion = useCallback(
    (taskId: string, completed: boolean, notes: string) => {
      const updated = tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed,
              notes,
              completedBy: completed ? currentUser?.name : undefined,
              completedAt: completed ? new Date().toISOString() : undefined,
            }
          : t
      );
      saveTasks(updated);
    },
    [tasks, saveTasks, currentUser]
  );

  const markTruckComplete = useCallback(
    (truckId: string) => {
      const updated = trucks.map((t) =>
        t.id === truckId ? { ...t, status: "completed" as const } : t
      );
      saveTrucks(updated);
    },
    [trucks, saveTrucks]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        trucks,
        tasks,
        checkInTruck,
        updateTaskCompletion,
        markTruckComplete,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
