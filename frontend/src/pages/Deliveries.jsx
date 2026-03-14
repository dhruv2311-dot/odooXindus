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
        <Link to={`/deliveries/${info.row.original.id}`} className="p-2 text-accent hover:text-white transition-colors block w-fit">
          <Eye className="w-5 h-5" />
        </Link>
      )
    }
  ];

  if (isLoading) return <div className="text-white p-8">Loading analytics...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Deliveries / Outbound</h2>
          <p className="text-gray-400 text-sm mt-1">Manage outbound logistics and packing</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Delivery
        </button>
      </div>

      <DataTable columns={columns} data={deliveries} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="theme-card w-full max-w-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-white/10 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-white mb-6 font-poppins">New Delivery Operation</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customer}
                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
              </div>

              <div className="border border-white/5 rounded-lg p-5 bg-secondary/50">
                <h4 className="text-md font-medium text-white mb-4">Operations Lines</h4>
                
                <div className="flex gap-3 items-end mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Product</label>
                    <select
                      value={newItem.product_id}
                      onChange={e => setNewItem({ ...newItem, product_id: e.target.value })}
                      className="theme-input w-full text-sm py-2"
                    >
                      <option value="" className="bg-secondary">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} className="bg-secondary">{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Demand</label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="theme-input w-full text-sm py-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!newItem.product_id || !newItem.quantity}
                    className="bg-[#232C63] hover:bg-[#2A3477] text-white p-2.5 rounded-lg border border-white/5 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {formData.items.length > 0 ? (
                  <div className="border border-white/5 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#141B3A] text-gray-400 border-b border-white/5 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Product</th>
                          <th className="px-4 py-3 font-semibold text-right">Quantity</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {formData.items.map((item, index) => {
                          const prod = products.find(p => p.id === item.product_id);
                          return (
                            <tr key={index} className="bg-card hover:bg-[#232C63] transition-colors group">
                              <td className="px-4 py-3 text-white">{prod?.name}</td>
                              <td className="px-4 py-3 text-right text-white font-medium">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">No lines added yet.</p>
                )}
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || formData.items.length === 0}
                  className="btn-primary disabled:opacity-50"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
