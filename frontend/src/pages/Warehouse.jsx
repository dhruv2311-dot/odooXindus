import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { warehouseApi } from '../services/api';
import DataTable from '../components/DataTable';

export default function Warehouse() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', address: '' });

  const { data: warehouses = [], isLoading } = useQuery({ 
    queryKey: ['warehouses'], 
    queryFn: warehouseApi.getAll 
  });

  const createMutation = useMutation({
    mutationFn: warehouseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsModalOpen(false);
      setFormData({ name: '', code: '', address: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const columns = [
    { accessorKey: 'name', header: 'Warehouse Name' },
    { accessorKey: 'code', header: 'Short Code' },
    { accessorKey: 'address', header: 'Location Area' },
  ];

  if (isLoading) return <div className="text-white p-8">Loading warehouses...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Warehouse Nodes</h2>
          <p className="text-gray-400 text-sm mt-1">Manage corporate physical sites</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </button>
      </div>

      <DataTable columns={columns} data={warehouses} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="theme-card w-full max-w-md relative border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-6 font-poppins">Register New Warehouse</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="theme-input w-full"
                  placeholder="e.g. Ahmedabad Central Warehouse"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Short Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="theme-input w-full uppercase"
                  placeholder="e.g. WH-AHD-01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Address / Region</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="theme-input w-full"
                  placeholder="e.g. SG Highway, Ahmedabad"
                />
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
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
