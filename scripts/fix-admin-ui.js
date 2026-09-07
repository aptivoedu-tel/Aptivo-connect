const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix corrupted comment markers
content = content.replace(/â• /g, '═');
content = content.replace(/â”€/g, '─');
content = content.replace(/Â·/g, '·');

// 2. Fix Header Student View button
content = content.replace(
  'className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-white text-xs font-bold transition-all"',
  'className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"'
);

// 3. Fix Sidebar hover colors
content = content.replace(
  "text-emerald-100/80 hover:bg-emerald-900/50 hover:text-slate-900",
  "text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white"
);
content = content.replace(
  "text-emerald-100/80 hover:bg-emerald-900/50 hover:text-slate-900",
  "text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white"
);

// 4. Fix table header styles
content = content.replace(
  /className="bg-slate-950\/80[^"]*"/g,
  'className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200"'
);
content = content.replace(
  /className="bg-slate-900\/80[^"]*"/g,
  'className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200"'
);
content = content.replace(
  /className="bg-slate-900[^"]*text-slate-400[^"]*border-b border-slate-200"/g,
  'className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200"'
);

// 5. Fix table cell text colors (white text on white table background)
content = content.replace(/className="p-4 font-semibold text-white"/g, 'className="p-4 font-semibold text-slate-900"');
content = content.replace(/className="p-4 font-bold text-white"/g, 'className="p-4 font-bold text-slate-900"');
content = content.replace(/className="divide-y divide-slate-800\/60"/g, 'className="divide-y divide-slate-100"');
content = content.replace(/className="divide-y divide-slate-800"/g, 'className="divide-y divide-slate-100"');
content = content.replace(/className="hover:bg-slate-100\/40 transition-colors"/g, 'className="hover:bg-slate-50/80 transition-colors"');

// 6. Fix table pill tags
content = content.replace(
  /className="px-2\.5 py-0\.5 rounded-full bg-slate-800 text-slate-600 font-bold text-\[10px\]"/g,
  'className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]"'
);
content = content.replace(
  /className="px-2\.5 py-0\.5 rounded-full bg-slate-800 text-slate-300 font-bold text-\[10px\]"/g,
  'className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]"'
);

// 7. Fix empty state backgrounds (replace bg-slate-900/50 with bg-white)
content = content.replace(
  /className="bg-slate-900\/50 border border-dashed border-slate-200/g,
  'className="bg-white border border-dashed border-slate-200 shadow-soft'
);

// 8. Fix modal overlays and modal dialogs
content = content.replace(
  /className="fixed inset-0 z-50 bg-black\/60 flex items-center justify-center p-4"/g,
  'className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"'
);
content = content.replace(
  /className="bg-white border border-slate-200\/80 shadow-sm p-6 sm:p-8 rounded-3xl max-w-xl w-full/g,
  'className="bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 rounded-3xl max-w-xl w-full'
);

// 9. Fix form label colors and inputs inside modals
content = content.replace(
  /className="block text-xs font-bold text-slate-400 mb-1"/g,
  'className="block text-xs font-bold text-slate-700 mb-1"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Admin UI styling successfully modernized and aligned!');
