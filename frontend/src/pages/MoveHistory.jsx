import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function MoveHistory() {
  const { data: moves = [], isLoading } = useQuery({ queryKey: ['stock-moves'], queryFn: stockApi.getMoves });

  const columns = [
    { accessorKey: 'type', header: 'Reference Type' },
    { accessorKey: 'date', header: 'Date', cell: info => new Date(info.getValue()).toLocaleString() },
    { accessorKey: 'products.name', header: 'Product' },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'status', header: 'Status', cell: () => <StatusBadge status="Done" /> },
  ];

  if (isLoading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Move History</h2>
      </div>

      <DataTable columns={columns} data={moves} />
    </div>
  );
}
