"use client";

import { motion } from 'framer-motion';
import { Play, Star, Clock, Filter } from 'lucide-react';

const games = [
  { title: 'Super Mario Bros', system: 'NES', rating: '4.8', played: '2h ago', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800' },
  { title: 'The Legend of Zelda', system: 'NES', rating: '4.9', played: '5h ago', image: 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?auto=format&fit=crop&q=80&w=800' },
  { title: 'Pokemon Emerald', system: 'GBA', rating: '4.9', played: '1d ago', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
  { title: 'Metroid Fusion', system: 'GBA', rating: '4.7', played: '3d ago', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800' },
  { title: 'Chrono Trigger', system: 'SNES', rating: '5.0', played: '1w ago', image: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&q=80&w=800' },
  { title: 'Final Fantasy VI', system: 'SNES', rating: '4.9', played: '2w ago', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800' },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Game Library</h1>
          <p className="text-neutral-500">Your collection of classic titles.</p>
        </div>
        
        <button className="bg-[#0a0a0a] border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={game.title}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all cursor-pointer"
          >
            {/* Placeholder Image Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity duration-500"
              style={{ backgroundImage: `url(${game.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded bg-white/10 text-white/80 backdrop-blur-md">
                  {game.system}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">{game.title}</h3>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {game.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {game.played}
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <Play className="w-5 h-5 ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

