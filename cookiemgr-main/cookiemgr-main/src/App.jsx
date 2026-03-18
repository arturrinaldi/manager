import { LayoutDashboard, ShoppingCart, Package, Receipt, PlusCircle, Trash2, X, Plus, Minus, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Loader2, History, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useStore } from './store/useStore';
import { useState, useMemo } from 'react';
import { formatCurrency, formatDate, formatTime, getLast6Months, getMonthKey, currentMonthKey } from './utils/format';
import { addToast } from './utils/toast';
import ToastContainer from './components/ToastContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ReferenceLine } from 'recharts';

// --- Dashboard View ---
const Dashboard = ({ sales, expenses }) => {
  const currentMonth = currentMonthKey();
  
  const stats = useMemo(() => {
    const monthSales = sales.filter(s => getMonthKey(s.date) === currentMonth);
    const monthExpenses = expenses.filter(e => getMonthKey(e.date) === currentMonth);
    
    const revenue = monthSales.reduce((acc, s) => acc + s.total, 0);
    const otherExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = revenue - otherExpenses;

    return { revenue, netProfit, otherExpenses };
  }, [sales, expenses, currentMonth]);

  const chartData = useMemo(() => {
    const months = getLast6Months();
    return months.map(m => {
      const monthSales = sales.filter(s => getMonthKey(s.date) === m.key);
      const monthExpenses = expenses.filter(e => getMonthKey(e.date) === m.key);
      const revenue = monthSales.reduce((acc, s) => acc + s.total, 0);
      const totalExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
      return { name: m.label, lucro: revenue - totalExpenses };
    });
  }, [sales, expenses]);

  const topProducts = useMemo(() => {
    const productCounts = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.qty;
      });
    });
    return Object.entries(productCounts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold">Olá, Chef! 🍪</h1>
        <p className="text-muted">Veja como seu negócio está crescendo este mês.</p>
      </header>

      <div className="sticky top-[-24px] z-40 bg-bg-primary/80 backdrop-blur-sm -mx-4 px-4 py-4 mb-2 grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <div className="card shadow-md flex flex-col gap-1 py-3 px-4 bg-bg-card/95">
          <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider">
            <DollarSign size={12} className="text-accent-blue" />
            <span>Vendas (Mês)</span>
          </div>
          <span className="text-xl font-bold text-white">{formatCurrency(stats.revenue)}</span>
        </div>
        <div className="card shadow-md flex flex-col gap-1 py-3 px-4 bg-bg-card/95">
          <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider">
            <TrendingUp size={12} className="text-accent-green" />
            <span>Lucro Líquido</span>
          </div>
          <span className="text-xl font-bold" style={{ color: stats.netProfit >= 0 ? '#34d399' : '#f87171' }}>
            {formatCurrency(stats.netProfit)}
          </span>
        </div>
      </div>

      <div className="card" style={{ height: '240px' }}>
        <h3 className="text-sm font-bold mb-4 opacity-70 uppercase tracking-wider">Lucro Histórico (6 Meses)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: '#1e293b', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Bar dataKey="lucro" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.lucro >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ minHeight: '360px' }}>
        <h3 className="text-sm font-bold mb-4 opacity-70 uppercase tracking-wider">Ranking de Vendas (Quantidade)</h3>
        {topProducts.length > 0 ? (
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topProducts}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                  width={100}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value) => [`${value} unidades`, 'Vendido']}
                />
                <Bar dataKey="qty" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} barSize={20}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-primary)' : 'var(--accent-blue)'} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted py-10">Nenhuma venda registrada ainda.</p>
        )}
      </div>
    </div>
  );
};

// --- PDV View ---
const PDV = ({ products, addSale }) => {
  const [cart, setCart] = useState({});
  const [note, setNote] = useState('');

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = products.find(prod => prod.id === id);
        return p ? { ...p, qty } : null;
      })
      .filter(Boolean);
  }, [cart, products]);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const updateQty = (id, delta) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const handleFinish = async () => {
    if (cartItems.length === 0) return;
    const saleItems = cartItems.map(i => ({
      productId: i.id,
      name: i.name,
      qty: i.qty,
      price: i.price
    }));

    try {
      await addSale(saleItems, note);
      setCart({});
      setNote('');
      addToast('Venda registrada com sucesso! 🍪', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao registrar venda. Confira sua conexão.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <header>
        <h1 className="text-2xl font-bold">Novo Registro 🛒</h1>
        <p className="text-muted">Selecione os produtos vendidos.</p>
      </header>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
        {products.length === 0 ? (
          <div className="card col-span-full border-dashed py-10 flex flex-col items-center gap-4 text-center opacity-70">
            <Package size={48} className="text-muted" />
            <span>Cadastre produtos primeiro para poder vender.</span>
          </div>
        ) : (
          products.map(p => (
            <div key={p.id} className={`card p-4 flex flex-col gap-3 items-center text-center cursor-pointer transition-all ${cart[p.id] ? 'border-accent-primary bg-bg-secondary' : 'bg-bg-secondary'} ${(p.stock || 0) <= 0 ? 'opacity-50 grayscale' : ''}`} 
                 onClick={() => (p.stock || 0) > 0 && updateQty(p.id, 1)}>
              <span className="text-4xl bg-bg-primary p-3 rounded-2xl mb-1">{p.emoji || '🍪'}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold leading-tight">{p.name}</span>
                <span className="text-base font-bold text-accent-primary">{formatCurrency(p.price)}</span>
                <span className={`text-[10px] font-bold ${(p.stock || 0) <= 5 ? 'text-accent-red' : 'text-muted'}`}>
                  {(p.stock || 0) <= 0 ? 'ESGOTADO' : `${p.stock || 0} em estoque`}
                </span>
              </div>
              {cart[p.id] && (
                <div className="flex items-center gap-3 mt-1 bg-bg-primary p-1 rounded-full shadow-inner">
                  <button className="btn btn-icon btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); updateQty(p.id, -1); }}>
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-sm min-w-[20px]">{cart[p.id]}</span>
                  <button className="btn btn-icon btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); updateQty(p.id, 1); }}>
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-[110] animate-slide-up max-w-md mx-auto">
          <div className="card shadow-lg bg-card-hover border-accent-primary p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-muted font-bold uppercase">Total da Venda</span>
                <span className="text-xl font-bold">{formatCurrency(total)}</span>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleFinish}>
                Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Products View ---
const Products = ({ products, sales, addProduct, updateProduct, deleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Cookie', emoji: '🍪', stock: '' });

  // Calcula estoque mínimo recomendado por produto baseado na média semanal de vendas
  const minStockByProduct = useMemo(() => {
    const result = {};
    products.forEach(p => {
      // Pega todas as vendas que contêm esse produto
      const salesWithProduct = sales.filter(s => s.items.some(i => i.productId === p.id || i.name === p.name));
      if (salesWithProduct.length === 0) { result[p.id] = 5; return; }

      // Total vendido
      const totalQty = salesWithProduct.reduce((acc, s) => {
        const item = s.items.find(i => i.productId === p.id || i.name === p.name);
        return acc + (item ? item.qty : 0);
      }, 0);

      // Período em semanas (entre primeira e última venda, mínimo 1 semana)
      const dates = salesWithProduct.map(s => new Date(s.date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const diffMs = maxDate - minDate;
      const weeks = Math.max(1, diffMs / (1000 * 60 * 60 * 24 * 7));

      // Média semanal = estoque mínimo recomendado
      result[p.id] = Math.ceil(totalQty / weeks);
    });
    return result;
  }, [products, sales]);

  // Dados do gráfico com estoque mínimo por produto
  const stockChartData = useMemo(() => {
    return products.map(p => ({
      ...p,
      minStock: minStockByProduct[p.id] || 5,
      isLow: (p.stock || 0) <= (minStockByProduct[p.id] || 5),
    }));
  }, [products, minStockByProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { 
      ...formData, 
      price: parseFloat(formData.price),
      cost: 0,
      stock: parseInt(formData.stock) || 0
    };
    
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        addToast('Produto atualizado!', 'success');
      } else {
        await addProduct(data);
        addToast('Produto cadastrado!', 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'Cookie', emoji: '🍪', stock: '' });
    } catch (err) {
      console.error(err);
      addToast('Erro ao salvar no banco de dados. Verifique sua conexão.', 'error');
    }
  };

  const edit = (p) => {
    setEditingProduct(p);
    setFormData({ name: p.name, price: p.price, category: p.category, emoji: p.emoji, stock: p.stock || 0 });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Produtos 📦</h1>
          <p className="text-muted">Gerencie seu catálogo.</p>
        </div>
        <button className="btn btn-primary btn-icon" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
        </button>
      </header>

      {/* Stock Summary Dashboard */}
      {products.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 bg-bg-card/50 border-l-4 border-accent-blue">
              <span className="text-[10px] font-bold text-muted uppercase">Total em Estoque</span>
              <div className="flex items-center gap-2 mt-1">
                <Package size={16} className="text-accent-blue" />
                <span className="text-2xl font-bold">{products.reduce((acc, p) => acc + (p.stock || 0), 0)}</span>
              </div>
            </div>
            <div className="card p-4 bg-bg-card/50 border-l-4 border-accent-red">
              <span className="text-[10px] font-bold text-muted uppercase">Crítico (abaixo do mín.)</span>
              <div className="flex items-center gap-2 mt-1">
                <AlertTriangle size={16} className="text-accent-red" />
                <span className="text-2xl font-bold">{stockChartData.filter(p => p.isLow).length}</span>
              </div>
            </div>
          </div>

          <div className="card p-4" style={{ height: '240px' }}>
            <h3 className="text-[10px] font-bold mb-4 opacity-70 uppercase tracking-widest">Gráfico de Disponibilidade</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                  formatter={(value, name) => {
                    if (name === 'stock') return [`${value} unid.`, 'Estoque atual'];
                    if (name === 'minStock') return [`${value} unid.`, 'Mínimo recomendado'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]} barSize={25} name="stock">
                  {stockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isLow ? 'var(--accent-red)' : 'var(--accent-blue)'} />
                  ))}
                </Bar>
                {/* Linha de estoque mínimo — usa a média dos mínimos como referência visual */}
                {stockChartData.length > 0 && (
                  <ReferenceLine
                    y={Math.round(stockChartData.reduce((acc, p) => acc + p.minStock, 0) / stockChartData.length)}
                    stroke="var(--accent-primary)"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={{ value: 'Mín. médio', fill: 'var(--accent-primary)', fontSize: 10, position: 'insideTopRight' }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alertas de estoque baixo por produto */}
          {stockChartData.some(p => p.isLow) && (
            <div className="card p-4 border-accent-red/40 bg-accent-red/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-accent-red" />
                <span className="text-[10px] font-bold text-accent-red uppercase tracking-widest">Estoque Baixo — Hora de Produzir</span>
              </div>
              <div className="flex flex-col gap-2">
                {stockChartData.filter(p => p.isLow).map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span>{p.emoji}</span>
                      <span className="font-medium">{p.name}</span>
                    </span>
                    <span className="text-xs text-muted">
                      <span className="text-accent-red font-bold">{p.stock || 0}</span>
                      <span className="opacity-50"> / mín. </span>
                      <span className="text-accent-primary font-bold">{p.minStock}</span>
                      <span className="opacity-50"> unid.</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {products.length === 0 ? (
          <div className="card border-dashed py-10 flex flex-col items-center gap-4 text-center">
            <Package size={48} className="text-muted opacity-30" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">Nenhum produto ainda</span>
              <span className="text-xs text-muted">Clique no + para cadastrar seu primeiro cookie.</span>
            </div>
          </div>
        ) : (
          products.map(p => (
            <div key={p.id} className="card p-4 flex justify-between items-center bg-secondary hover:bg-card-hover" onClick={() => edit(p)}>
              <div className="flex items-center gap-4">
                <span className="text-3xl bg-bg-primary p-2 rounded-xl">{p.emoji}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-base">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-accent-primary font-bold">{formatCurrency(p.price)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(p.stock || 0) <= 5 ? 'bg-accent-red/20 text-accent-red' : 'bg-bg-primary text-muted'}`}>
                      {p.stock || 0} unid.
                    </span>
                  </div>
                </div>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {['🍪', '🍩', '🧁', '🍰', '🥮', '🟫', '🥐', '🥖'].map(e => (
                    <button type="button" key={e} className={`btn btn-icon ${formData.emoji === e ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFormData({...formData, emoji: e})}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nome do Produto</label>
                <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Cookie Triple Choc" />
              </div>
              <div className="form-group">
                <label className="form-label">Preço de Venda</label>
                <input required type="number" step="0.01" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Quantidade Inicial em Estoque</label>
                <input required type="number" className="form-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="Ex: 50" />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Cookie</option>
                  <option>Biscoito</option>
                  <option>Especial</option>
                  <option>Bebida</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full mt-2">
                {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Expenses View ---
const Expenses = ({ expenses, addExpense, deleteExpense }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Ingredientes', date: new Date().toISOString().split('T')[0] });

  const totalThisMonth = useMemo(() => {
    const curMonth = currentMonthKey();
    return expenses
      .filter(e => getMonthKey(e.date) === curMonth)
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date(formData.date).toISOString()
    });
    addToast('Gasto registrado!', 'success');
    setIsModalOpen(false);
    setFormData({ description: '', amount: '', category: 'Ingredientes', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Custos 💸</h1>
          <p className="text-muted">Despesas extras do mês.</p>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
        </button>
      </header>

      <div className="card border-accent-red bg-opacity-10 bg-red-900 border-dashed">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold opacity-70">TOTAL (MÊS ATUAL)</span>
          <span className="text-xl font-bold text-accent-red">{formatCurrency(totalThisMonth)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[...expenses].reverse().map(e => (
          <div key={e.id} className="card p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" style={{ background: 'rgba(248,113,113,0.1)' }}>
                <Receipt size={18} className="text-accent-red" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{e.description}</span>
                <span className="text-[10px] text-muted">{formatDate(e.date)} • {e.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-accent-red">-{formatCurrency(e.amount)}</span>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => deleteExpense(e.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Custo</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">O que foi comprado?</label>
                <input required className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Açúcar, Embalagens..." />
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input required type="number" step="0.01" className="form-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Ingredientes</option>
                  <option>Embalagens</option>
                  <option>Marketing</option>
                  <option>Outros</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input required type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-danger btn-lg btn-full mt-2">
                Salvar Gasto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sales History View ---
const SalesHistory = ({ sales, deleteSale }) => {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold">Histórico de Vendas 📝</h1>
        <p className="text-muted">Veja e gerencie todos os registros.</p>
      </header>

      <div className="flex flex-col gap-3">
        {sales.length === 0 ? (
          <div className="card border-dashed py-10 flex flex-col items-center gap-4 text-center">
            <ShoppingBag size={48} className="text-muted opacity-30" />
            <span className="text-muted">Nenhuma venda registrada ainda.</span>
          </div>
        ) : (
          [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => (
            <div key={s.id} className="card p-4 flex flex-col gap-3 overflow-hidden">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <History size={14} className="text-accent-primary" />
                    <span className="text-[10px] font-extrabold text-accent-primary uppercase tracking-widest">
                      {formatDate(s.date)} • {formatTime(s.date)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {s.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted truncate mr-2">{item.qty}x {item.name}</span>
                        <span className="font-medium whitespace-nowrap">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn btn-icon btn-ghost text-accent-red flex-shrink-0" onClick={() => { if(confirm('Excluir esta venda?')) deleteSale(s.id) }}>
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
                {s.note && (
                  <div className="bg-bg-primary/50 p-2 rounded-lg border border-border/20">
                    <p className="text-[11px] text-muted italic break-words leading-relaxed">
                      "{s.note}"
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted font-bold uppercase tracking-tight">Total Recebido</span>
                  <span className="text-lg font-bold text-accent-green">{formatCurrency(s.total)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState('dashboard');
  const store = useStore();

  const renderView = () => {
    if (store.loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="animate-spin text-accent-primary">
             <Loader2 size={40} />
          </div>
          <p className="text-muted">Conectando ao banco de dados...</p>
        </div>
      );
    }

    switch(view) {
      case 'dashboard': return <Dashboard products={store.products} sales={store.sales} expenses={store.expenses} />;
      case 'pdv': return <PDV products={store.products} addSale={store.addSale} />;
      case 'history': return <SalesHistory sales={store.sales} deleteSale={store.deleteSale} />;
      case 'products': return <Products products={store.products} sales={store.sales} addProduct={store.addProduct} updateProduct={store.updateProduct} deleteProduct={store.deleteProduct} />;
      case 'expenses': return <Expenses expenses={store.expenses} addExpense={store.addExpense} deleteExpense={store.deleteExpense} />;
      default: return <Dashboard products={store.products} sales={store.sales} expenses={store.expenses} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col bg-bg-primary overflow-hidden">
      {/* NAVIGATION BAR - FIXED HEADER */}
      <header className="flex-shrink-0 z-[100] bg-[#0f172a] border-b border-slate-800 shadow-2xl">
        <nav className="flex w-full max-w-md mx-auto h-20 justify-center">
          <button 
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all border-r border-slate-800/50 last:border-r-0 cursor-pointer ${view === 'dashboard' ? 'text-accent-primary bg-slate-800/40 border-b-2 border-b-accent-primary' : 'text-slate-400/70 bg-transparent'}`} 
            onClick={() => setView('dashboard')}
          >
            <LayoutDashboard size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Início</span>
          </button>
          
          <button 
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all border-r border-slate-800/50 last:border-r-0 cursor-pointer ${view === 'pdv' ? 'text-accent-primary bg-slate-800/40 border-b-2 border-b-accent-primary' : 'text-slate-400/70 bg-transparent'}`} 
            onClick={() => setView('pdv')}
          >
            <ShoppingCart size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Vender</span>
          </button>
          
          <button 
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all border-r border-slate-800/50 last:border-r-0 cursor-pointer ${view === 'history' ? 'text-accent-primary bg-slate-800/40 border-b-2 border-b-accent-primary' : 'text-slate-400/70 bg-transparent'}`} 
            onClick={() => setView('history')}
          >
            <History size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Vendas</span>
          </button>
          
          <button 
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all border-r border-slate-800/50 last:border-r-0 cursor-pointer ${view === 'products' ? 'text-accent-primary bg-slate-800/40 border-b-2 border-b-accent-primary' : 'text-slate-400/70 bg-transparent'}`} 
            onClick={() => setView('products')}
          >
            <Package size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Estoque</span>
          </button>
          
          <button 
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all border-r border-slate-800/50 last:border-r-0 cursor-pointer ${view === 'expenses' ? 'text-accent-primary bg-slate-800/40 border-b-2 border-b-accent-primary' : 'text-slate-400/70 bg-transparent'}`} 
            onClick={() => setView('expenses')}
          >
            <Receipt size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Gastos</span>
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT AREA - SCROLLABLE */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {renderView()}
        <div className="h-24" /> {/* Space at bottom */}
      </main>

      <ToastContainer />
    </div>
  );
}
