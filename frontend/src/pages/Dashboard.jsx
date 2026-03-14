import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { stockApi, receiptsApi, deliveriesApi } from '../services/api';
import KPICard from '../components/KPICard';

export default function Dashboard() {
  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: stockApi.getAll });
  const { data: stockMoves = [] } = useQuery({ queryKey: ['stock-moves'], queryFn: stockApi.getMoves });
  const { data: receipts = [] } = useQuery({ queryKey: ['receipts'], queryFn: receiptsApi.getAll });
  const { data: deliveries = [] } = useQuery({ queryKey: ['deliveries'], queryFn: deliveriesApi.getAll });

  const totalProducts = stock.length;
  const lowStockItems = stock.filter(s => s.quantity < 10).length;
  const pendingReceipts = receipts.filter(r => r.status !== 'Done').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'Done').length;

  const chartData = useMemo(() => {
    const monthsToShow = 6;
    const now = new Date();
    const monthBuckets = [];

    for (let i = monthsToShow - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: d.toLocaleString(undefined, { month: 'short' }),
        inbound: 0,
        outbound: 0,
      });
    }

    const bucketMap = Object.fromEntries(monthBuckets.map((b) => [b.key, b]));

    stockMoves.forEach((move) => {
      if (!move?.date) return;
      const moveDate = new Date(move.date);
      if (Number.isNaN(moveDate.getTime())) return;

      const key = `${moveDate.getFullYear()}-${String(moveDate.getMonth() + 1).padStart(2, '0')}`;
      const bucket = bucketMap[key];
      if (!bucket) return;

      const qty = Number(move.quantity) || 0;
      const type = String(move.type || '').toLowerCase();

      const isInbound = type.includes('receipt') || type.includes('adjustment (in)');
      const isOutbound = type.includes('delivery') || type.includes('adjustment (out)');

      if (isInbound) {
        bucket.inbound += qty;
      } else if (isOutbound) {
        bucket.outbound += qty;
      } else {
        // Internal transfer and unknown types still count as movement volume.
        bucket.outbound += qty;
        bucket.inbound += qty;
      }
    });

    return monthBuckets.map((bucket) => ({
      name: bucket.name,
      inbound: bucket.inbound,
      outbound: bucket.outbound,
      movement: bucket.inbound + bucket.outbound,
    }));
  }, [stockMoves]);

  const displayChartData = useMemo(() => {
    const hasRealMovement = chartData.some((item) => (item.movement || 0) > 0);

    if (hasRealMovement) {
      return { isDemo: false, data: chartData };
    }

    // Fallback sample keeps dashboard visually informative before live operations start.
    const demoData = chartData.map((item, idx) => {
      const seed = [18, 26, 22, 31, 28, 36][idx] || 20;
      return {
        ...item,
        inbound: Math.round(seed * 0.58),
        outbound: Math.round(seed * 0.42),
        movement: seed,
      };
    });

    return { isDemo: true, data: demoData };
  }, [chartData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white font-poppins tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time metrics and analytical insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Products" 
          value={totalProducts} 
          icon={Package} 
          isPositive={true}
          percentageString="14%"
        />
        <KPICard 
          title="Low Stock Alerts" 
          value={lowStockItems} 
          icon={AlertTriangle} 
          isPositive={false}
          percentageString="2%"
        />
        <KPICard 
          title="Pending Receipts" 
          value={pendingReceipts} 
          icon={ArrowDownToLine} 
          isPositive={true}
          percentageString="8%"
        />
        <KPICard 
          title="Pending Deliveries" 
          value={pendingDeliveries} 
          icon={ArrowUpFromLine} 
          isPositive={false}
          percentageString="5%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8">
        <div className="theme-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white font-poppins">Inventory Movement Trend</h3>
            {displayChartData.isDemo && (
              <span className="text-xs px-2 py-1 rounded-md border border-warning/30 text-warning bg-warning/10">
                Sample data
              </span>
            )}
          </div>
          <div className="h-80 w-full mt-4 min-h-[320px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
              <LineChart data={displayChartData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C2452', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#E8C77B' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="movement" 
                  stroke="#E8C77B" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#141B3A', stroke: '#E8C77B', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#E8C77B' }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
