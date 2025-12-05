// // src/components/RingGradientLoader.tsx
// import React from 'react';

// const RingGradientLoader = () => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-50 p-8 rounded-lg">
//       <div className="flex space-x-2">
//         <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
//         <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
//         <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
//         <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
//         <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.5s]"></div>
//       </div>
//       <p className="mt-4 text-gray-700 text-sm font-medium">Loading...</p>
//     </div>
//   );
// };


// export default RingGradientLoader;



// // src/components/RingGradientLoader.tsx
// import React from 'react';

// const RingGradientLoader: React.FC = () => {
//   const brandText = 'X - MED';
//   const letters = brandText.split('');

//   return (
// <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-50 text-white">
//       Minimalist Progress Bar with Shine
//       <div className="relative mb-8 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-progress-shine"></div>
//         <div className="absolute inset-0 bg-white opacity-20 animate-shine"></div>
//       </div>

//       {/* Elegant Brand Text with Subtle Glow */}
//       <div className="text-center mb-4">
//         <div className="flex justify-center items-center space-x-1 text-3xl font-light tracking-wide">
//           {letters.map((letter, index) => (
//             <span
//               key={index}
//               className="animate-letter-glow"
//               style={{ animationDelay: `${index * 0.2}s` }}
//             >
//               {letter}
//             </span>
//           ))}
//         </div>
//       </div>

//       <p className="text-gray-400 animate-fade-in">Loading...</p>

//       <style jsx>{`
//         @keyframes progress-shine {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         @keyframes shine {
//           0% { transform: translateX(-100%); opacity: 0; }
//           50% { opacity: 1; }
//           100% { transform: translateX(100%); opacity: 0; }
//         }
//         @keyframes letter-glow {
//           0%, 100% { text-shadow: 0 0 5px rgba(255,255,255,0.3); }
//           50% { text-shadow: 0 0 20px rgba(59,130,246,0.8), 0 0 30px rgba(59,130,246,0.6); }
//         }
//         @keyframes fade-in {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         .animate-progress-shine { animation: progress-shine 2s linear infinite; }
//         .animate-shine { animation: shine 2s linear infinite; }
//         .animate-letter-glow { animation: letter-glow 2s ease-in-out infinite; }
//         .animate-fade-in { animation: fade-in 1s ease-out; }
//       `}</style>
//     </div>
//   );
// };

// export default RingGradientLoader;


import React from "react";

const RingGradientLoader: React.FC = () => {
  const text = "X - MED";
  const colors = ["#ff0080", "#00ffff", "#ffff00", "#ff1493", "#00ff7f"];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0000006b] z-50 text-white">
      <div className="relative flex items-center justify-center mb-6">
<div className="absolute w-38 h-38 rounded-full border border-white animate-spin-smooth opacity-50"></div>

        {/* Orbiting dots */}
        <div className="absolute w-3 h-3 bg-pink-500 rounded-full animate-orbit"></div>
        <div className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-orbit-delay"></div>

        <div className="relative text-4xl font-extrabold tracking-tight">
          {text.split("").map((ch, i) => (
            <span
              key={i}
              className="animate-jumble-bounce"
              style={{
                color: colors[i % colors.length],
                animationDelay: `${i * 0.1}s`,
                ['--j-x' as any]: `${(Math.random() * 10 - 5).toFixed(2)}px`,
                ['--j-y' as any]: `${(Math.random() * 10 - 5).toFixed(2)}px`,
                ['--j-r' as any]: `${(Math.random() * 10 - 5).toFixed(2)}deg`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* <p className="text-gray-400 animate-pulse">Initializing...</p> */}

      <style>{`
        @keyframes spin-smooth { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-smooth { animation: spin-smooth 6s linear infinite; }

        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
        .animate-orbit { animation: orbit 3s linear infinite; }
        .animate-orbit-delay { animation: orbit 3s linear infinite 1.5s; }

        @keyframes jumble-bounce {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(var(--j-x), var(--j-y)) rotate(var(--j-r)); }
        }
        .animate-jumble-bounce { animation: jumble-bounce 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default RingGradientLoader;









// // src/components/RingGradientLoader.tsx
// import React from 'react';

// const RingGradientLoader: React.FC = () => {
//   const text = 'X - MED';
//   const characters = text.split('');
//   const colors = ['#FFA500', '#FF4500', '#FFD700', '#32CD32', '#1E90FF', '#9932CC'];

//   return (
//     <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 z-50 text-black backdrop-blur-sm">
//       {/* Circular Progress Indicator */}
//       <div className="relative mb-8">
//         <div className="w-16 h-16 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin-smooth"></div>
//         <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-indeterminate"></div>
//       </div>

//       {/* Animated Brand Text */}
//       <div className="text-center mb-4">
//         <div className="flex justify-center items-center space-x-0.5 text-4xl font-bold tracking-tight">
//           {characters.map((char, index) => {
//             const jX = (Math.random() * 25 - 12.5).toFixed(2);
//             const jY = (Math.random() * 25 - 12.5).toFixed(2);
//             const jR = (Math.random() * 40 - 20).toFixed(2);
//             return (
//               <span
//                 key={index}
//                 className="animate-jumble-bounce"
//                 style={{
//                   color: colors[index % colors.length],
//                   animationDelay: `${index * 0.12}s`,
//                   ['--j-x' as any]: `${jX}px`,
//                   ['--j-y' as any]: `${jY}px`,
//                   ['--j-r' as any]: `${jR}deg`,
//                 }}
//               >
//                 {char}
//               </span>
//             );
//           })}
//         </div>
//       </div>

//       {/* Loading Text */}
//       <p className="text-gray-700 animate-pulse">Fetching data...</p>

//       {/* Inline Animations */}
//       <style>{`
//         @keyframes spin-smooth {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes indeterminate {
//           0% { transform: rotate(0deg); }
//           12.5% { transform: rotate(180deg); }
//           25% { transform: rotate(180deg); }
//           37.5% { transform: rotate(540deg); }
//           50% { transform: rotate(540deg); }
//           62.5% { transform: rotate(900deg); }
//           75% { transform: rotate(900deg); }
//           87.5% { transform: rotate(1260deg); }
//           100% { transform: rotate(1260deg); }
//         }
//         @keyframes jumble-bounce {
//           0% { transform: translate(0, 0) rotate(0deg); }
//           10% { transform: translate(var(--j-x), var(--j-y)) rotate(var(--j-r)); }
//           20% { transform: translate(calc(-1 * var(--j-x)), calc(-1 * var(--j-y))) rotate(calc(-1 * var(--j-r))); }
//           30% { transform: translate(0, 0) rotate(0deg); }
//           40% { transform: translate(calc(var(--j-x) * 0.5), calc(var(--j-y) * 0.5)) rotate(calc(var(--j-r) * 0.5)); }
//           50% { transform: translate(0, 0) rotate(0deg); }
//           60% { transform: translate(calc(-1 * var(--j-x) * 0.5), calc(-1 * var(--j-y) * 0.5)) rotate(calc(-1 * var(--j-r) * 0.5)); }
//           70% { transform: translate(0, 0) rotate(0deg); }
//           80% { transform: translate(calc(var(--j-x) * 0.3), calc(var(--j-y) * 0.3)) rotate(calc(var(--j-r) * 0.3)); }
//           90% { transform: translate(0, 0) rotate(0deg); }
//           100% { transform: translate(0, 0) rotate(0deg); }
//         }
//         .animate-spin-smooth {
//           animation: spin-smooth 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
//         }
//         .animate-indeterminate {
//           animation: indeterminate 2s linear infinite;
//         }
//         .animate-jumble-bounce {
//           animation: jumble-bounce 3s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RingGradientLoader;
