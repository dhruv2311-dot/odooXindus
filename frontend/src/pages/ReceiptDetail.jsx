import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptsApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Check, Printer } from 'lucide-react';

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: receipt, isLoading } = useQuery({
    queryKey: ['receipt', id],
    queryFn: () => receiptsApi.getById(id)
  });

  const validateMutation = useMutation({
    mutationFn: () => receiptsApi.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt', id] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    }
  });

  if (isLoading) return <div className="text-white p-8">Analyzing receipt...</div>;
  if (!receipt) return <div className="text-white p-8">Receipt not found</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/receipts')} className="p-2 border border-white/5 rounded-lg bg-secondary text-gray-400 hover:text-white hover:border-accent transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-white tracking-tight flex-1 font-poppins">
          {receipt.reference}
        </h2>
        <StatusBadge status={receipt.status} />
      </div>

      <div className="theme-card">
        
        {receipt.status === 'Draft' && (
          <div className="flex gap-4 mb-8 pb-8 border-b border-white/5">
            <button
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {validateMutation.isPending ? 'Validating...' : 'Validate Operations'}
            </button>
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2 bg-secondary text-gray-300 border border-white/10 hover:bg-white/5"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
          </div>
        )}

        {Object.keys(receipt).length > 0 && (
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Supplier Profile</p>
              <p className="text-white text-lg font-medium">{receipt.supplier}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expected Schedule Date</p>
              <p className="text-white text-lg font-medium">{new Date(receipt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white mb-4 font-poppins">Received Demand</h3>
        <div className="rounded-lg border border-white/10 overflow-hidden bg-secondary/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#141B3A] border-b border-white/10 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">SKU Standard</th>
                <th className="px-6 py-4 font-semibold text-right">Done Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {receipt.receipt_items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#232C63] transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{item.products?.name}</td>
                  <td className="px-6 py-4 text-gray-400">{item.products?.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-white bg-white/5">{item.quantity}</td>
                </tr>
              ))}
              {(!receipt.receipt_items || receipt.receipt_items.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No products registered in this receipt</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
