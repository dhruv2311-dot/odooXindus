import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { productsApi } from '../services/api';
import DataTable from '../components/DataTable';

export default function Products() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', unit: '', price: '' });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', category: '', unit: '', price: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, price: Number(formData.price) });
  };

  const columns = [
    { accessorKey: 'sku', header: 'SKU' },
    { accessorKey: 'name', header: 'Product Name' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'unit', header: 'Unit' },
    { accessorKey: 'price', header: 'Price' },
  ];

  if (isLoading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <DataTable columns={columns} data={products} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-slate-700 p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-6">Add New Product</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Unit of Measure</label>
                  <select
                    required
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  >
                    <option value="">Select unit</option>
                    <option value="Units">Units</option>
                    <option value="KG">KG</option>
                    <option value="Liters">Liters</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Pallets">Pallets</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
