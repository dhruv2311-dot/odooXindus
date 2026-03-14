export default function StatusBadge({ status }) {
  const getColors = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'Waiting': return 'bg-warning/20 text-warning border-warning/30';
      case 'Ready': return 'bg-success/20 text-success border-success/30';
      case 'Done': return 'bg-accentblue/20 text-accentblue border-accentblue/30';
      case 'Canceled': return 'bg-danger/20 text-danger border-danger/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors(status)}`}>
      {status}
    </span>
  );
}
