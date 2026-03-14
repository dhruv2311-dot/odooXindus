import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Eye } from 'lucide-react';
import { deliveriesApi, productsApi } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Deliveries() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ customer: '', date: '', items: [] });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: '' });

  const { data: deliveries = [], isLoading } = useQuery({ queryKey: ['deliveries'], queryFn: deliveriesApi.getAll });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: productsApi.getAll });

  const createMutation = useMutation({
    mutationFn: deliveriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      setIsModalOpen(false);
      setFormData({ customer: '', date: '', items: [] });
    }
  });

  const generateRef = () => `WH/OUT/${String(deliveries.length + 1).padStart(4, '0')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ 
      reference: generateRef(),
      customer: formData.customer,
      date: formData.date || new Date().toISOString().split('T')[0],
      items: formData.items
    });
  };

  const addItem = () => {
    if (newItem.product_id && newItem.quantity) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { product_id: newItem.product_id, quantity: Number(newItem.quantity) }]
      }));
      setNewItem({ product_id: '', quantity: '' });
    }
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const columns = [
    { accessorKey: 'reference', header: 'Reference' },
    { accessorKey: 'customer', header: 'Customer' },
    { accessorKey: 'date', header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() },
    { accessorKey: 'status', header: 'Status', cell: info => <StatusBadge status={info.getValue()} /> },
    { 
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <Link to={`/deliveries/${info.row.original.id}`} className="text-primary hover:text-blue-400 p-2">
          <Eye className="w-4 h-4" />
        </Link>
      )
    }
  ];

  if (isLoading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Deliveries</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Delivery
        </button>
      </div>

      <DataTable columns={columns} data={deliveries} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-slate-700 p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-white mb-6">New Delivery</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customer}
                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                    className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  />
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
                <h4 className="text-md font-medium text-white mb-3">Products</h4>
                
                <div className="flex gap-2 items-end mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Product</label>
                    <select
                      value={newItem.product_id}
                      onChange={e => setNewItem({ ...newItem, product_id: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white text-sm"
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!newItem.product_id || !newItem.quantity}
                    className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-md border border-slate-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {formData.items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="text-left pb-2">Product</th>
                        <th className="text-right pb-2">Quantity</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const prod = products.find(p => p.id === item.product_id);
                        return (
                          <tr key={index} className="border-b border-slate-800">
                            <td className="py-2 text-white">{prod?.name}</td>
                            <td className="py-2 text-right text-white">{item.quantity}</td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-danger hover:text-red-400"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-slate-500 italic">No products added yet.</p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || formData.items.length === 0}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  Create Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
