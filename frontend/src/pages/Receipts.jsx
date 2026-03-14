import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Eye, LayoutGrid, Rows3 } from 'lucide-react';
import { receiptsApi, productsApi } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Receipts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({ supplier: '', date: '', items: [] });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: '' });

  const { data: receipts = [], isLoading } = useQuery({ queryKey: ['receipts'], queryFn: receiptsApi.getAll });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: productsApi.getAll });

  const createMutation = useMutation({
    mutationFn: receiptsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setIsModalOpen(false);
      setFormData({ supplier: '', date: '', items: [] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => receiptsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-moves'] });
    }
  });

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const generateRef = () => `WH/IN/${String(receipts.length + 1).padStart(4, '0')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ 
      reference: generateRef(),
      supplier: formData.supplier,
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

  const kanbanColumns = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
  const groupedReceipts = kanbanColumns.map((status) => ({
    status,
    items: receipts.filter((receipt) => receipt.status === status)
  }));

  const columns = [
    { accessorKey: 'reference', header: 'Reference' },
    { accessorKey: 'supplier', header: 'Supplier' },
    { accessorKey: 'date', header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() },
    { accessorKey: 'status', header: 'Status', cell: info => <StatusBadge status={info.getValue()} /> },
    { 
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/receipts/${info.row.original.id}`} className="p-2 text-accent hover:text-white transition-colors block w-fit">
            <Eye className="w-5 h-5" />
          </Link>

          {info.row.original.status === 'Draft' && (
            <button
              type="button"
              onClick={() => handleStatusChange(info.row.original.id, 'Ready')}
              disabled={statusMutation.isPending}
              className="px-2 py-1 text-xs rounded-md border border-success/40 text-success hover:bg-success/10 transition-colors disabled:opacity-50"
            >
              Mark Ready
            </button>
          )}

          {info.row.original.status === 'Ready' && (
            <button
              type="button"
              onClick={() => handleStatusChange(info.row.original.id, 'Done')}
              disabled={statusMutation.isPending}
              className="px-2 py-1 text-xs rounded-md border border-accent/40 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
            >
              Mark Done
            </button>
          )}

          {(info.row.original.status === 'Draft' || info.row.original.status === 'Ready') && (
            <button
              type="button"
              onClick={() => handleStatusChange(info.row.original.id, 'Canceled')}
              disabled={statusMutation.isPending}
              className="px-2 py-1 text-xs rounded-md border border-danger/40 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) return <div className="text-white p-8">Loading analytics...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Receipts / Inbound</h2>
          <p className="text-gray-400 text-sm mt-1">Manage incoming vendor shipments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-white/10 bg-secondary p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'table' ? 'bg-[#232C63] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Rows3 className="w-4 h-4" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'kanban' ? 'bg-[#232C63] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Receipt
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={receipts} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {groupedReceipts.map((column) => (
            <div key={column.status} className="rounded-xl border border-white/10 bg-card/70 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{column.status}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-gray-300 border border-white/10">
                  {column.items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {column.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-gray-500 text-center">
                    No receipts
                  </div>
                ) : (
                  column.items.map((receipt) => (
                    <Link
                      key={receipt.id}
                      to={`/receipts/${receipt.id}`}
                      className="block rounded-lg border border-white/10 bg-secondary/70 p-3 hover:border-accent/50 hover:bg-[#232C63] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-white truncate">{receipt.reference}</p>
                        <StatusBadge status={receipt.status} />
                      </div>
                      <p className="text-xs text-gray-300 mt-2 truncate">{receipt.supplier}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        <span>{new Date(receipt.date).toLocaleDateString()}</span>
                        <span>{receipt.receipt_items?.length || 0} lines</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="theme-card w-full max-w-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-white/10 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-white mb-6 font-poppins">New Receipt Operation</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    className="theme-input w-full"
                    placeholder="e.g. TechSource Pvt Ltd"
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
                    placeholder="YYYY-MM-DD"
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
                      placeholder="e.g. 10"
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
