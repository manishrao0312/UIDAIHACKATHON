import { motion } from "framer-motion";

export const KpiCard = ({ title, value, subtext, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-slate-900/50 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl mb-4"
  >
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
    <h2 className={`text-3xl font-mono mt-1 ${color}`}>{value}</h2>
    <p className="text-slate-500 text-[10px] mt-1">{subtext}</p>
  </motion.div>
);