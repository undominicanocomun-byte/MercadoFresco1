import React, { useState } from 'react';
import { ChefHat, Clock, Users, PlusCircle, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface RecipeStudioProps {
  products: Product[];
}

interface Recipe {
  id: string;
  title: string;
  tagline: string;
  prepTime: string;
  servings: string;
  difficulty: 'Fácil' | 'Intermedia' | 'Gourmet';
  chefTip: string;
  image: string;
  matchedSkus: string[];
}

export const RecipeStudio: React.FC<RecipeStudioProps> = ({ products }) => {
  const { addItem, openCart } = useCart();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('rec-1');
  const [addedRecipeId, setAddedRecipeId] = useState<string | null>(null);

  const recipes: Recipe[] = [
    {
      id: 'rec-1',
      title: 'Tostada Rústica con Tomate Rosa, AOVE Picual & Queso Curado',
      tagline: 'Sencillez mediterránea en su máxima expresión aromática.',
      prepTime: '10 min',
      servings: '2 personas',
      difficulty: 'Fácil',
      chefTip: 'Corta el Tomate Rosa a temperatura ambiente y deja reposar 3 minutos con el Aceite Picual para emulsionar los jugos naturales antes de servir.',
      image: '/images/mediterranean_culinary_dish_1794232792419.jpg',
      matchedSkus: ['PAN-001', 'FV-003', 'DES-001', 'LH-003'],
    },
    {
      id: 'rec-2',
      title: 'Lomos de Salmón Noruego a la Plancha con Espinacas Baby y Limón',
      tagline: 'Proteína noble cocinada a fuego vivo con cítrico ecológico.',
      prepTime: '15 min',
      servings: '2 personas',
      difficulty: 'Intermedia',
      chefTip: 'Saltea las espinacas baby solo 90 segundos con un toque de aceite picual para mantener su tersura verde y textura crujiente.',
      image: '/images/hero_supermarket_fresh_1794193228971.jpg',
      matchedSkus: ['CP-002', 'FV-004', 'FV-006', 'DES-001'],
    },
    {
      id: 'rec-3',
      title: 'Desayuno Vital: Yogur Griego Cremoso, Manzana Fuji & Café Geisha',
      tagline: 'Energía limpia matutina sin azúcares añadidos ni conservantes.',
      prepTime: '5 min',
      servings: '1 persona',
      difficulty: 'Fácil',
      chefTip: 'Corta la Manzana Fuji en láminas finísimas para apreciar el contraste entre el crujido frutal y la densidad sedosa del yogur artesanal.',
      image: '/images/category_bakery_dairy_1794193229267.jpg',
      matchedSkus: ['LH-004', 'FV-005', 'DES-004'],
    },
  ];

  const currentRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  // Resolve recipe ingredients from live catalog
  const recipeProducts = currentRecipe.matchedSkus
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is Product => p !== undefined);

  const recipeTotal = recipeProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAddAllIngredients = () => {
    recipeProducts.forEach((p) => {
      addItem(p, 1);
    });
    setAddedRecipeId(currentRecipe.id);
    setTimeout(() => {
      setAddedRecipeId(null);
      openCart();
    }, 800);
  };

  return (
    <section className="py-16 sm:py-24 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Inspiración Culinaria de Temporada</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif italic">
            Del Huerto a tu Plato: Recetas con Alimentos Reales
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            Diseñadas por cocineros apasionados por el producto sin disfraces. Añade los ingredientes frescos completos a tu cesta en un solo clic con las cantidades exactas.
          </p>
        </div>

        {/* Recipe Selection Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {recipes.map((rec) => {
            const isSelected = rec.id === selectedRecipeId;
            return (
              <button
                key={rec.id}
                onClick={() => setSelectedRecipeId(rec.id)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-[1.02]'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100/60'
                }`}
              >
                {rec.title.split(':')[0]}
              </button>
            );
          })}
        </div>

        {/* Recipe Feature Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Visual Asset with Gastronomy Tag */}
          <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto min-h-[340px] bg-stone-900 overflow-hidden">
            <img
              src={currentRecipe.image}
              alt={currentRecipe.title}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentRecipe.prepTime}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentRecipe.servings}</span>
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Consejo de Cocina:</p>
              <p className="text-xs text-stone-200 mt-1 italic leading-relaxed bg-stone-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
                "{currentRecipe.chefTip}"
              </p>
            </div>
          </div>

          {/* Right Column: Recipe Details & 1-Click Buy Action */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Dificultad: {currentRecipe.difficulty}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 leading-tight">
                  {currentRecipe.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
                  {currentRecipe.tagline}
                </p>
              </div>

              {/* Ingredients Checklist with live prices */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
                  <span>Ingredientes Frescos en MercadoFresco ({recipeProducts.length})</span>
                </h4>

                <div className="divide-y divide-stone-100 border-y border-stone-100">
                  {recipeProducts.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-stone-900">{p.name}</p>
                          <p className="text-[11px] text-stone-500">{p.origin} · {p.unit}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-stone-900">${p.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total and 1-Click Add Action */}
            <div className="mt-8 pt-5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-500">Total ingredientes para la receta:</span>
                <div className="text-2xl font-black text-stone-900 font-mono">
                  ${recipeTotal.toFixed(2)}
                </div>
              </div>

              <button
                onClick={handleAddAllIngredients}
                disabled={addedRecipeId === currentRecipe.id}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md ${
                  addedRecipeId === currentRecipe.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20'
                }`}
              >
                {addedRecipeId === currentRecipe.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Ingredientes Añadidos a la Cesta!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Añadir Ingredientes de la Receta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
