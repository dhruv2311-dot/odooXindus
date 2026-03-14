export default function Locations() {
  const locations = [
    { id: 1, name: 'Rack A1', code: 'RA1', warehouse: 'Central Warehouse' },
    { id: 2, name: 'Main Hall', code: 'MH1', warehouse: 'Central Warehouse' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Locations</h2>
      </div>

      <div className="bg-card border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Location Name</th>
              <th className="px-6 py-4 font-semibold">Short Code</th>
              <th className="px-6 py-4 font-semibold">Warehouse</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 text-slate-300">
                <td className="px-6 py-4">{l.name}</td>
                <td className="px-6 py-4">{l.code}</td>
                <td className="px-6 py-4">{l.warehouse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
