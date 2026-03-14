import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

function AnimatedNumber({ end, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutExpo
      const easing = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(Math.floor(end * easing));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
}

export default function KPICard({ title, value, previousValue, icon: Icon, isPositive, percentageString }) {
  return (
    <div className="theme-card relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-400 font-poppins">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-white/90 group-hover:text-accent transition-colors duration-200">
            <AnimatedNumber end={value || 0} />
          </h3>
        </div>
        <div className="p-3 bg-secondary rounded-lg border border-white/5 shadow-inner">
          <Icon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 text-xs font-medium">
        {isPositive ? (
          <span className="flex items-center text-success bg-success/10 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            {percentageString}
          </span>
        ) : (
          <span className="flex items-center text-danger bg-danger/10 px-2 py-1 rounded-full">
            <ArrowDownRight className="w-3 h-3 mr-1" />
            {percentageString}
          </span>
        )}
        <span className="text-gray-500 font-inter">since last month</span>
      </div>
      
      {/* Decorative background glow */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors duration-500"></div>
    </div>
  );
}
