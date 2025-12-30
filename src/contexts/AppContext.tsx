import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InventoryItem, Loan, Vehicle, Maintenance, User, UserRole } from '@/types/inventory';

interface AppContextType {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Inventory
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity'>) => void;
  updateItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  
  // Loans
  loans: Loan[];
  createLoan: (loan: Omit<Loan, 'id' | 'borrowedAt'>) => void;
  returnLoan: (id: string) => void;
  
  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  // Maintenances
  maintenances: Maintenance[];
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Demo data
const demoItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Refrigerante R-410A',
    category: 'material',
    quantity: 50,
    availableQuantity: 45,
    unit: 'kg',
    minStock: 10,
    location: 'Bodega A',
    description: 'Gas refrigerante ecológico',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Tubo de cobre 1/2"',
    category: 'material',
    quantity: 100,
    availableQuantity: 85,
    unit: 'metros',
    minStock: 20,
    location: 'Bodega A',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Manifold de refrigeración',
    category: 'tool',
    quantity: 5,
    availableQuantity: 3,
    unit: 'unidad',
    minStock: 2,
    location: 'Bodega B',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Bomba de vacío',
    category: 'tool',
    quantity: 3,
    availableQuantity: 2,
    unit: 'unidad',
    minStock: 1,
    location: 'Bodega B',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const demoVehicles: Vehicle[] = [
  {
    id: '1',
    plate: 'ABCD-12',
    brand: 'Chevrolet',
    model: 'N300',
    year: 2022,
    currentKm: 45000,
    status: 'active',
    assignedTo: 'Juan Pérez',
    lastMaintenance: new Date('2024-01-15'),
    nextMaintenanceKm: 50000,
  },
  {
    id: '2',
    plate: 'EFGH-34',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2021,
    currentKm: 78000,
    status: 'maintenance',
    lastMaintenance: new Date('2024-02-20'),
    nextMaintenanceKm: 80000,
  },
];

const demoLoans: Loan[] = [
  {
    id: '1',
    itemId: '3',
    itemName: 'Manifold de refrigeración',
    quantity: 2,
    borrowedBy: 'Carlos Rodríguez',
    borrowedAt: new Date('2024-03-10'),
    expectedReturn: new Date('2024-03-15'),
    notes: 'Proyecto Centro Comercial',
  },
];

const demoUsers: User[] = [
  {
    id: '1',
    email: 'admin@fesa.cl',
    name: 'Administrador FESA',
    role: 'admin',
    active: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'supervisor@fesa.cl',
    name: 'María González',
    role: 'supervisor',
    active: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'tecnico@fesa.cl',
    name: 'Juan Pérez',
    role: 'technician',
    active: true,
    createdAt: new Date(),
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(demoUsers[0]);
  const [items, setItems] = useState<InventoryItem[]>(demoItems);
  const [loans, setLoans] = useState<Loan[]>(demoLoans);
  const [vehicles, setVehicles] = useState<Vehicle[]>(demoVehicles);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [users, setUsers] = useState<User[]>(demoUsers);

  const addItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      availableQuantity: item.quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updatedFields: Partial<InventoryItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updatedFields, updatedAt: new Date() } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const createLoan = (loan: Omit<Loan, 'id' | 'borrowedAt'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString(),
      borrowedAt: new Date(),
    };
    setLoans([...loans, newLoan]);
    
    // Update item availability
    setItems(items.map(item => 
      item.id === loan.itemId 
        ? { ...item, availableQuantity: item.availableQuantity - loan.quantity }
        : item
    ));
  };

  const returnLoan = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (loan && !loan.returnedAt) {
      setLoans(loans.map(l => 
        l.id === id ? { ...l, returnedAt: new Date() } : l
      ));
      
      // Restore item availability
      setItems(items.map(item => 
        item.id === loan.itemId 
          ? { ...item, availableQuantity: item.availableQuantity + loan.quantity }
          : item
      ));
    }
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const updateVehicle = (id: string, updatedFields: Partial<Vehicle>) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updatedFields } : vehicle
    ));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  const addMaintenance = (maintenance: Omit<Maintenance, 'id'>) => {
    const newMaintenance: Maintenance = {
      ...maintenance,
      id: Date.now().toString(),
    };
    setMaintenances([...maintenances, newMaintenance]);
    
    // Update vehicle
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === maintenance.vehicleId 
        ? { 
            ...vehicle, 
            currentKm: maintenance.kmAtMaintenance,
            lastMaintenance: maintenance.date,
          }
        : vehicle
    ));
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updatedFields: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...updatedFields } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      items,
      addItem,
      updateItem,
      deleteItem,
      loans,
      createLoan,
      returnLoan,
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      maintenances,
      addMaintenance,
      users,
      addUser,
      updateUser,
      deleteUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
