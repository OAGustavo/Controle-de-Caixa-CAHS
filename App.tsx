import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Bell, 
  Menu, 
  X, 
  Trash2, 
  Edit2,
  Minus,
  Save,
  DollarSign, 
  AlertTriangle,
  RotateCcw,
  Tag,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  LucideIcon
} from 'lucide-react';

// --- Types ---

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  qty: number;
  price: number;
}

interface HistoryEntry {
  id: string;
  date: string;
  itemName: string;
  category: string;
  change: number;
  unitPrice: number;
  total: number;
  type: 'info' | 'entry' | 'exit';
}

// --- Components ---

// Componente Card de Métricas
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-105 duration-200">
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
      <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

// Componente Toast de Desfazer
interface UndoToastProps {
  isOpen: boolean;
  onUndo: () => void;
  onClose: () => void;
  message: string;
}

const UndoToast: React.FC<UndoToastProps> = ({ isOpen, onUndo, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-zinc-900 text-yellow-400 px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 border border-yellow-600/30">
        <span className="text-sm font-medium text-gray-100">{message}</span>
        <div className="h-4 w-px bg-zinc-700"></div>
        <button
          onClick={onUndo}
          className="text-yellow-400 hover:text-yellow-300 font-bold text-sm flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw size={14} />
          Desfazer
        </button>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Componente Modal de Confirmação de Exclusão
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl animate-bounce-in text-center border-t-4 border-red-500">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <Trash2 size={28} />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Item?</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Quer retirar esse item do inventário? isso irá apagá-lo permanentemente.
        </p>
        
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
          >
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Gerenciamento de Categorias
interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAdd: (category: string) => void;
  onDelete: (category: string) => void;
  inventory: InventoryItem[];
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, onAdd, onDelete, inventory }) => {
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCat = newCategory.trim();
    if (!trimmedCat) return;
    
    if (categories.some(c => c.toLowerCase() === trimmedCat.toLowerCase())) {
      setError('Categoria já existe.');
      return;
    }

    onAdd(trimmedCat);
    setNewCategory('');
    setError('');
  };

  const isCategoryInUse = (cat: string) => {
    return inventory.some(item => item.category === cat);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl animate-bounce-in border-t-4 border-yellow-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-900">Gerenciar Categorias</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
            placeholder="Nova categoria..."
            value={newCategory}
            onChange={(e) => { setNewCategory(e.target.value); setError(''); }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!newCategory.trim()}
            className="bg-zinc-900 text-yellow-400 p-2 rounded-lg hover:bg-black transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mb-3 ml-1">{error}</p>}

        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {categories.map(cat => {
            const inUse = isCategoryInUse(cat);
            return (
              <div key={cat} className="flex justify-between items-center p-2.5 bg-gray-50 rounded border border-gray-100 hover:border-yellow-200 transition-colors group">
                <span className="text-sm font-medium text-gray-700">{cat}</span>
                {inUse ? (
                   <span className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-0.5 bg-gray-200 rounded border border-gray-300 cursor-help" title="Em uso">
                     Em uso
                   </span>
                ) : (
                  <button
                    onClick={() => onDelete(cat)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Excluir categoria"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Adicionar Item
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: InventoryItem) => void;
  categories: string[];
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '', 
    qty: '',
    price: ''
  });

  useEffect(() => {
    if (isOpen && categories.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categories[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now(),
      name: formData.name,
      category: formData.category || categories[0],
      qty: parseInt(formData.qty) || 0,
      price: parseFloat(formData.price) || 0,
    });
    setFormData({ name: '', category: categories[0] || '', qty: '', price: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl border-t-4 border-yellow-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-900">Novo Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
            <input 
              required
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Ex: Canetas"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input 
                required
                type="number" 
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 outline-none"
                value={formData.qty}
                onChange={(e) => setFormData({...formData, qty: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário (R$)</label>
            <input 
              required
              type="number" 
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-zinc-900 text-yellow-400 font-bold rounded-lg hover:bg-black transition-colors"
            >
              Salvar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const [lastDeletedItem, setLastDeletedItem] = useState<InventoryItem | null>(null);
  const [lastInventoryState, setLastInventoryState] = useState<InventoryItem[] | null>(null); 
  const [lastHistoryState, setLastHistoryState] = useState<HistoryEntry[] | null>(null);
  const [undoType, setUndoType] = useState<'delete' | 'edit' | null>(null); 
  const [undoMessage, setUndoMessage] = useState(''); 
  const [showUndoToast, setShowUndoToast] = useState(false);

  const [pendingChanges, setPendingChanges] = useState<{ [key: number]: number }>({}); 
  const [pendingPrices, setPendingPrices] = useState<{ [key: number]: number }>({});
  const [categories, setCategories] = useState(['Material', 'Merch', 'Patrimônio', 'Eventos', 'Limpeza']);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: 'Camisetas Gestão 2025', category: 'Merch', qty: 45, price: 35.00 },
    { id: 2, name: 'Canetas Personalizadas', category: 'Material', qty: 12, price: 2.50 },
    { id: 3, name: 'Banner Institucional', category: 'Patrimônio', qty: 2, price: 120.00 },
    { id: 4, name: 'Kit Recepção Calouros', category: 'Eventos', qty: 4, price: 15.00 },
  ]);

  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 'init1', date: new Date().toLocaleDateString('pt-BR'), itemName: 'Inventário Inicial', category: '-', change: 0, unitPrice: 0, total: 0, type: 'info' }
  ]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showUndoToast) {
      timer = setTimeout(() => {
        setShowUndoToast(false);
        if (!showUndoToast) {
            setLastDeletedItem(null);
            setLastInventoryState(null);
            setLastHistoryState(null);
            setUndoType(null);
        }
      }, 5000); 
    }
    return () => clearTimeout(timer);
  }, [showUndoToast]);
  
  const totalItems = inventory.reduce((acc, item) => {
    const qty = pendingChanges[item.id] !== undefined ? pendingChanges[item.id] : item.qty;
    return acc + qty;
  }, 0);

  const totalValue = inventory.reduce((acc, item) => {
    const qty = pendingChanges[item.id] !== undefined ? pendingChanges[item.id] : item.qty;
    const price = pendingPrices[item.id] !== undefined ? pendingPrices[item.id] : item.price;
    return acc + (qty * price);
  }, 0);

  const pendingCount = Object.keys(pendingChanges).length;

  const transactionTotal = Object.keys(pendingChanges).reduce((acc, idStr) => {
    const id = parseInt(idStr);
    const item = inventory.find(i => i.id === id);
    if (!item) return acc;
    
    const newQty = pendingChanges[id];
    const delta = newQty - item.qty;
    const price = pendingPrices[id] !== undefined ? pendingPrices[id] : item.price;
    
    return acc + (delta * price * -1); 
  }, 0);

  const addHistoryEntry = (item: InventoryItem, change: number, priceOverride: number | null = null): HistoryEntry => {
    const price = priceOverride !== null ? priceOverride : item.price;
    const entry: HistoryEntry = {
      id: Date.now() + Math.random().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      itemName: item.name,
      category: item.category,
      change: change,
      unitPrice: price,
      total: Math.abs(change * price),
      type: change >= 0 ? 'entry' : 'exit'
    };
    return entry;
  };

  const handleAddItem = (newItem: InventoryItem) => {
    setLastInventoryState([...inventory]);
    setLastHistoryState([...history]);
    setUndoType('edit');
    setUndoMessage('Item adicionado ao estoque.');
    
    setInventory([...inventory, newItem]);

    const entry = addHistoryEntry(newItem, newItem.qty);
    setHistory(prev => [entry, ...prev]);
    
    setShowUndoToast(true);
  };

  const handleAddCategory = (newCat: string) => {
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (inventory.some(item => item.category === catToDelete)) {
        alert("Não é possível excluir uma categoria em uso.");
        return;
    }
    setCategories(prev => prev.filter(c => c !== catToDelete));
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const itemToRemove = inventory.find(i => i.id === itemToDelete);
      if (itemToRemove) {
        setLastDeletedItem(itemToRemove);
        setLastHistoryState([...history]);
        setUndoType('delete');
        setUndoMessage('Item movido para a lixeira.');
        setShowUndoToast(true);

        const entry = addHistoryEntry(itemToRemove, -itemToRemove.qty);
        setHistory(prev => [entry, ...prev]);
      }

      setInventory(inventory.filter(item => item.id !== itemToDelete));
      
      const newPending = { ...pendingChanges };
      delete newPending[itemToDelete];
      setPendingChanges(newPending);
      
      const newPrices = { ...pendingPrices };
      delete newPrices[itemToDelete];
      setPendingPrices(newPrices);
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleUndo = () => {
    if (undoType === 'delete' && lastDeletedItem) {
      setInventory(prev => [...prev, lastDeletedItem]);
      setLastDeletedItem(null);
      if (lastHistoryState) setHistory(lastHistoryState);
    } else if (undoType === 'edit' && lastInventoryState) {
      setInventory(lastInventoryState);
      setLastInventoryState(null);
      if (lastHistoryState) setHistory(lastHistoryState);
    }
    setShowUndoToast(false);
    setUndoType(null);
    setLastHistoryState(null);
  };

  const handleStageQuantityChange = (id: number, currentQty: number, change: number) => {
    setPendingChanges(prev => {
      const currentVal = prev[id] !== undefined ? prev[id] : currentQty;
      const newVal = Math.max(0, currentVal + change);
      return { ...prev, [id]: newVal };
    });
  };

  const handleStagePriceChange = (id: number, newPrice: string) => {
    setPendingPrices(prev => ({
      ...prev,
      [id]: parseFloat(newPrice) || 0
    }));
  };

  const saveAllChanges = () => {
    setLastInventoryState([...inventory]);
    setLastHistoryState([...history]);
    setUndoType('edit');
    setUndoMessage('Alterações salvas com sucesso.');

    const newHistoryEntries: HistoryEntry[] = [];
    inventory.forEach(item => {
      if (pendingChanges[item.id] !== undefined) {
        const newQty = pendingChanges[item.id];
        const delta = newQty - item.qty;
        
        if (delta !== 0) {
          const price = pendingPrices[item.id] !== undefined ? pendingPrices[item.id] : item.price;
          newHistoryEntries.push(addHistoryEntry(item, delta, price));
        }
      }
    });

    setInventory(prevInventory => prevInventory.map(item => {
      if (pendingChanges[item.id] !== undefined) {
        const newQty = pendingChanges[item.id];
        return { 
          ...item, 
          qty: newQty,
          price: pendingPrices[item.id] !== undefined ? pendingPrices[item.id] : item.price
        };
      }
      return item;
    }));

    setHistory(prev => [...newHistoryEntries, ...prev]);

    setPendingChanges({});
    setPendingPrices({});
    setShowUndoToast(true);
  };

  const cancelAllChanges = () => {
    setPendingChanges({});
    setPendingPrices({});
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - AMARELO */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-yellow-400 text-zinc-900 shadow-xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-yellow-500/50 flex flex-col items-center">
          {/* LOGO - Substitua a URL abaixo pela sua imagem real */}
          <div className="w-24 h-24 mb-4 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-900 shadow-md overflow-hidden relative">
             <img 
               src="https://placehold.co/100x100/ffd700/000000?text=CAHS" 
               alt="Logo CAHS" 
               className="w-full h-full object-cover"
             />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase text-zinc-900 text-center">Gestão CAHS</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-zinc-800">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'inventory' 
                ? 'bg-zinc-900 text-yellow-400 shadow-lg translate-x-1' 
                : 'text-zinc-800 hover:bg-yellow-500/50 hover:text-black'
            }`}
          >
            <Package size={20} /> Inventário
          </button>
          
          <button 
            onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'history' 
                ? 'bg-zinc-900 text-yellow-400 shadow-lg translate-x-1' 
                : 'text-zinc-800 hover:bg-yellow-500/50 hover:text-black'
            }`}
          >
            <History size={20} /> Histórico
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-zinc-600">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-zinc-800 hidden sm:block">
              {activeTab === 'inventory' ? 'Controle de Estoque' : 'Histórico Financeiro'}
            </h2>
            <h2 className="text-xl font-bold text-zinc-800 sm:hidden">
              {activeTab === 'inventory' ? 'Estoque' : 'Histórico'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-zinc-500 hover:bg-yellow-100 hover:text-yellow-700 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 custom-scrollbar bg-gray-50">
          
          {activeTab === 'inventory' ? (
            <>
              {/* Métricas de Topo - AMARELO/PRETO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <MetricCard 
                  title="Quantidade Total de Itens" 
                  value={totalItems} 
                  icon={Package}
                  colorClass="bg-zinc-900 text-yellow-400"
                />
                <MetricCard 
                  title="Valor Estimado do Estoque" 
                  value={`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                  icon={DollarSign}
                  colorClass="bg-yellow-500 text-zinc-900"
                />
              </div>

              {/* Inventory Table Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-800">Itens do Inventário</h3>
                    <p className="text-sm text-gray-500">Gerencie todos os produtos do CAHS</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-yellow-50 hover:border-yellow-300 text-zinc-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
                      title="Gerenciar Categorias"
                    >
                        <Tag size={18} className="text-yellow-600" /> <span className="hidden sm:inline">Categorias</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-yellow-400 px-4 py-2 rounded-lg transition-all font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Plus size={18} /> Novo Item
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Qtd</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider w-36">Valor Unit.</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inventory.length > 0 ? (
                        inventory.map((item) => {
                          const isPending = pendingChanges[item.id] !== undefined;
                          const displayQty = isPending ? pendingChanges[item.id] : item.qty;
                          const displayPrice = pendingPrices[item.id] !== undefined ? pendingPrices[item.id] : item.price;
                          
                          return (
                            <tr key={item.id} className={`transition-colors ${isPending ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                <div className="flex items-center gap-2">
                                  {item.name}
                                  {displayQty < 5 && (
                                    <div className="text-red-500 animate-pulse" title="Estoque Baixo (< 5)">
                                      <AlertTriangle size={16} />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">{item.category}</span>
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                                <div className="flex items-center gap-2">
                                  <div className={`flex items-center gap-1 bg-white rounded-lg border p-1 shadow-sm ${isPending ? 'border-yellow-400 ring-1 ring-yellow-200' : 'border-gray-200'}`}>
                                    <button 
                                      onClick={() => handleStageQuantityChange(item.id, item.qty, -1)}
                                      disabled={displayQty <= 0}
                                      className={`w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 ${displayQty <= 0 ? 'text-gray-300' : 'text-gray-600'}`}
                                    >
                                      <Minus size={14} />
                                    </button>
                                    
                                    <span className={`w-8 text-center font-bold ${isPending ? 'text-yellow-700' : 'text-zinc-700'}`}>
                                      {displayQty}
                                    </span>
                                    
                                    <button 
                                      onClick={() => handleStageQuantityChange(item.id, item.qty, 1)}
                                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 text-xs">R$</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className={`w-24 p-1.5 rounded border text-sm font-medium focus:outline-none focus:ring-1 focus:ring-yellow-500 ${
                                      pendingPrices[item.id] !== undefined 
                                        ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                                        : 'border-transparent bg-transparent hover:border-gray-300 text-zinc-700'
                                    }`}
                                    value={displayPrice}
                                    onChange={(e) => handleStagePriceChange(item.id, e.target.value)}
                                  />
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-zinc-400 hover:text-zinc-900 mr-3 transition-colors p-1 hover:bg-gray-100 rounded">
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(item.id)}
                                  className="text-red-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                               <Package size={48} className="text-gray-200" />
                               <p>Nenhum item encontrado. Adicione o primeiro item!</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            // --- ABA DE HISTÓRICO ---
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-bold text-zinc-800">Registro de Transações</h3>
                <p className="text-sm text-gray-500">Acompanhe todas as entradas e saídas de estoque.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Qtd</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor Unit.</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{entry.itemName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{entry.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {entry.type === 'entry' && entry.change > 0 ? (
                            <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase bg-green-50 px-2 py-1 rounded w-fit">
                              <ArrowUpRight size={14} /> Entrada
                            </span>
                          ) : entry.type === 'exit' || entry.change < 0 ? (
                            <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase bg-red-50 px-2 py-1 rounded w-fit">
                              <ArrowDownLeft size={14} /> Saída
                            </span>
                          ) : (
                             <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${entry.change > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          R$ {entry.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-zinc-800">
                          R$ {entry.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {history.length === 0 && (
                  <div className="p-10 text-center text-gray-400 text-sm">
                    Nenhuma movimentação registrada ainda.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Barra Flutuante de Ações Pendentes */}
        {activeTab === 'inventory' && pendingCount > 0 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-900 rounded-full shadow-2xl border border-yellow-500/30 py-3 px-6 flex items-center gap-6 animate-bounce-in z-40 max-w-2xl w-full justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
                  <span className="text-sm font-bold text-white">
                    {pendingCount} ite{pendingCount > 1 ? 'ns' : 'm'} alterado{pendingCount > 1 ? 's' : ''}
                  </span>
                </div>
                {transactionTotal !== 0 && (
                  <span className={`text-xs font-medium ml-4 ${transactionTotal > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {transactionTotal > 0 ? 'Receita Est.:' : 'Custo Est.:'} R$ {Math.abs(transactionTotal).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={cancelAllChanges}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors text-sm font-medium"
              >
                <X size={16} />
                Cancelar
              </button>
              
              <button 
                onClick={saveAllChanges}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-black hover:bg-yellow-400 rounded-full transition-all shadow-md transform hover:-translate-y-0.5 text-sm font-bold"
              >
                <Save size={16} />
                Salvar
              </button>
            </div>
          </div>
        )}

      </main>

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddItem}
        categories={categories}
      />
      
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAdd={handleAddCategory}
        onDelete={handleDeleteCategory}
        inventory={inventory}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <UndoToast 
        isOpen={showUndoToast} 
        onUndo={handleUndo} 
        onClose={() => setShowUndoToast(false)}
        message={undoMessage}
      />

    </div>
  );
}