import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { Dumbbell, CheckCircle2, Circle, Coffee, Calendar, ChevronRight, Activity, Plus, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

// Generador de IDs únicos simple
const generateId = () => Math.random().toString(36).substr(2, 9);

// Datos iniciales vacíos para agregar rutinas manualmente
const emptyRoutine = {
  lunes: [],
  martes: [],
  miercoles: [],
  jueves: [],
  viernes: [],
  sabado: [],
  domingo: []
};

const diasSemana = [
  { key: 'lunes', label: 'Lunes', focus: 'Tracción' },
  { key: 'martes', label: 'Martes', focus: 'Empuje' },
  { key: 'miercoles', label: 'Miércoles', focus: 'Piernas y Core' },
  { key: 'jueves', label: 'Jueves', focus: 'Descanso' },
  { key: 'viernes', label: 'Viernes', focus: 'Torso' },
  { key: 'sabado', label: 'Sábado', focus: 'Piernas + Brazos' },
  { key: 'domingo', label: 'Domingo', focus: 'Descanso' }
];

// Componente para la Tarjeta de Ejercicio
const ExerciseCard = ({ exercise, onUpdate, onToggleComplete, onDelete }) => {
  const isCompleted = exercise.completado;

  const handleCardImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es muy pesada. Máximo 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate(exercise.id, 'imagen', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCardImageDelete = () => {
    onUpdate(exercise.id, 'imagen', '');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 overflow-hidden flex flex-col relative group ${isCompleted ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent hover:border-indigo-100 hover:shadow-md'}`}>

      {/* Botón de eliminar (Mantenimiento) */}
      <button
        onClick={() => onDelete(exercise.id)}
        className="absolute top-3 left-3 z-30 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm transition-opacity opacity-0 group-hover:opacity-100 md:opacity-100"
        title="Eliminar ejercicio"
      >
        <Trash2 size={16} />
      </button>

      {/* Imagen de Referencia / Cabecera */}
      <div className={`h-40 w-full relative bg-gray-200 overflow-hidden`}>

        {/* Eliminar imagen de este ejercicio */}
        {exercise.imagen && !isCompleted && (
          <button
            onClick={handleCardImageDelete}
            className="absolute top-3 left-12 z-30 bg-slate-800/70 hover:bg-red-500 text-white p-1.5 rounded-lg shadow-sm transition-opacity opacity-0 group-hover:opacity-100"
            title="Eliminar foto"
          >
            <X size={16} />
          </button>
        )}

        {/* Cambiar Imagen Overlay */}
        {!isCompleted && (
          <label className="absolute inset-x-0 bottom-0 z-30 bg-black/60 hover:bg-black/80 text-white p-2 cursor-pointer transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-sm font-medium" title={exercise.imagen ? "Cambiar foto" : "Agregar foto"}>
            <Upload size={16} />
            <span>{exercise.imagen ? "Cambiar foto" : "Agregar foto"}</span>
            <input type="file" accept="image/*" onChange={handleCardImageUpload} className="hidden" />
          </label>
        )}

        {exercise.imagen ? (
          <img
            src={exercise.imagen}
            alt={exercise.nombre}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isCompleted ? 'grayscale opacity-60' : 'opacity-90'}`}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isCompleted ? 'from-emerald-400 to-emerald-600' : 'from-indigo-500 to-purple-600'}`}>
            <Dumbbell size={48} className="text-white drop-shadow-md" />
          </div>
        )}

        {/* Overlay degradado para que el badge destaque */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />

        {/* Badge de estado */}
        <div className="absolute top-3 right-3 z-30">
          {isCompleted && (
            <span className="bg-white text-emerald-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <CheckCircle2 size={12} /> Completado
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <h3 className={`font-bold text-lg leading-tight ${isCompleted ? 'text-emerald-900 line-through opacity-70' : 'text-gray-800'}`}>
          {exercise.nombre}
        </h3>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          {/* Input Series */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Series</label>
            <input
              type="text"
              value={exercise.series}
              onChange={(e) => onUpdate(exercise.id, 'series', e.target.value)}
              disabled={isCompleted}
              className={`w-full px-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${isCompleted ? 'bg-transparent border-transparent text-emerald-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            />
          </div>

          {/* Input Reps */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Repeticiones</label>
            <input
              type="text"
              value={exercise.reps}
              onChange={(e) => onUpdate(exercise.id, 'reps', e.target.value)}
              disabled={isCompleted}
              className={`w-full px-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${isCompleted ? 'bg-transparent border-transparent text-emerald-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            />
          </div>
        </div>

        {/* Botón Completar */}
        <button
          onClick={() => onToggleComplete(exercise.id)}
          className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all active:scale-[0.98] ${isCompleted
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
            }`}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          {isCompleted ? 'Desmarcar' : 'Marcar completado'}
        </button>
      </div>
    </div>
  );
};

export default function App() {
  // Estado principal de la rutina
  const [routine, setRoutine] = useState({});
  const [activeDay, setActiveDay] = useState('lunes');
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Estados para el Modal de Mantenimiento ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({ nombre: '', series: '3', reps: '10', imagen: '' });
  const [imagePreview, setImagePreview] = useState('');

  // Cargar datos de localforage al inicio
  useEffect(() => {
    const loadRoutine = async () => {
      try {
        const savedRoutine = await localforage.getItem('fitRoutineDataV3');
        if (savedRoutine) {
          setRoutine(savedRoutine);
        } else {
          setRoutine(emptyRoutine);
        }
      } catch (e) {
        console.error("Error cargando rutina:", e);
        setRoutine(emptyRoutine);
      }

      // Auto-seleccionar el día actual de la semana
      const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const today = new Date().getDay();
      setActiveDay(daysMap[today]);
      setIsLoaded(true);
    };
    
    loadRoutine();
  }, []);

  // Guardar en localforage cada vez que cambia la rutina
  useEffect(() => {
    if (isLoaded) {
      localforage.setItem('fitRoutineDataV3', routine).catch(err => console.error("Error guardando datos", err));
    }
  }, [routine, isLoaded]);

  // Funciones de actualización
  const updateExercise = (exerciseId, field, value) => {
    setRoutine(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].map(ex =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const toggleComplete = (exerciseId) => {
    setRoutine(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].map(ex =>
        ex.id === exerciseId ? { ...ex, completado: !ex.completado } : ex
      )
    }));
  };

  // --- Funciones de Mantenimiento ---
  const handleDeleteExercise = (exerciseId) => {
    if (window.confirm('¿Estás seguro de eliminar este ejercicio?')) {
      setRoutine(prev => ({
        ...prev,
        [activeDay]: prev[activeDay].filter(ex => ex.id !== exerciseId)
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // Limitar a 2MB
      alert('La imagen es muy pesada. Por favor, elige una imagen de menos de 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewExercise(prev => ({ ...prev, imagen: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setNewExercise({ ...newExercise, imagen: '' });
    setImagePreview('');
    // Limpiar el campo del archivo para permitir seleccionar la misma imagen de nuevo
    const fileInput = document.getElementById('image-upload-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExercise.nombre.trim()) return;

    const exerciseToAdd = {
      id: generateId(),
      nombre: newExercise.nombre,
      series: newExercise.series,
      reps: newExercise.reps,
      imagen: newExercise.imagen,
      completado: false
    };

    setRoutine(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), exerciseToAdd]
    }));

    setNewExercise({ nombre: '', series: '3', reps: '10', imagen: '' });
    setImagePreview('');
    setIsModalOpen(false);
  };
  // ----------------------------------

  const resetProgress = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todo el progreso semanal?')) {
      const resetRoutine = { ...routine };
      Object.keys(resetRoutine).forEach(day => {
        resetRoutine[day] = resetRoutine[day].map(ex => ({ ...ex, completado: false }));
      });
      setRoutine(resetRoutine);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Activity className="animate-spin text-indigo-500" size={40} /></div>;

  const currentExercises = routine[activeDay] || [];
  const activeDayInfo = diasSemana.find(d => d.key === activeDay);
  const completedCount = currentExercises.filter(ex => ex.completado).length;
  const progressPercentage = currentExercises.length > 0 ? Math.round((completedCount / currentExercises.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Dumbbell className="w-8 h-8 p-1.5 bg-indigo-100 rounded-lg" />
            <h1 className="font-bold text-xl tracking-tight text-slate-800">Fit<span className="text-indigo-600">Plan</span></h1>
          </div>
          <button
            onClick={resetProgress}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Reiniciar semana
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-6 flex flex-col md:flex-row gap-8">

        {/* Sidebar / Nav Tabs */}
        <nav className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 md:sticky md:top-24 flex md:flex-col overflow-x-auto no-scrollbar snap-x">
            {diasSemana.map((dia) => {
              const dayExercises = routine[dia.key] || [];
              const dayCompleted = dayExercises.filter(ex => ex.completado).length;
              const allDone = dayExercises.length > 0 && dayCompleted === dayExercises.length;

              return (
                <button
                  key={dia.key}
                  onClick={() => setActiveDay(dia.key)}
                  className={`flex-shrink-0 snap-center md:w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-1 min-w-[140px] md:min-w-0 ${activeDay === dia.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{dia.label}</span>
                    {allDone && <CheckCircle2 size={16} className={activeDay === dia.key ? 'text-indigo-200' : 'text-emerald-500'} />}
                  </div>
                  <span className={`text-xs ${activeDay === dia.key ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {dia.focus}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
              {activeDayInfo.label}
            </h2>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Activity size={18} /> Enfoque: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{activeDayInfo.focus}</span>
            </p>

            {/* Barra de progreso */}
            {currentExercises.length > 0 && (
              <div className="mt-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-600">Progreso del día</span>
                  <span className="text-indigo-600">{completedCount} de {currentExercises.length} completados</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {currentExercises.length === 0 ? (
            /* Estado: Día de Descanso */
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                <Coffee size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Día de Descanso</h3>
              <p className="text-slate-500 max-w-sm mb-6">
                Tus músculos necesitan tiempo para recuperarse y crecer. Aprovecha para estirar, caminar o simplemente relajarte.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-50 text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Añadir un ejercicio a este día
              </button>
            </div>
          ) : (
            /* Grid de Ejercicios */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onUpdate={updateExercise}
                  onToggleComplete={toggleComplete}
                  onDelete={handleDeleteExercise}
                />
              ))}

              {/* Botón Card para añadir nuevo ejercicio */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all min-h-[350px] gap-3"
              >
                <div className="bg-white p-4 rounded-full shadow-sm">
                  <Plus size={32} />
                </div>
                <span className="font-bold text-lg">Añadir Ejercicio</span>
              </button>
            </div>
          )}

          {/* Mensaje de completado total */}
          {currentExercises.length > 0 && completedCount === currentExercises.length && (
            <div className="mt-8 bg-emerald-500 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white/20 p-3 rounded-full">
                <CheckCircle2 size={32} />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-xl">¡Día completado!</h4>
                <p className="text-emerald-50">Has terminado todos tus ejercicios de hoy. ¡Excelente trabajo!</p>
              </div>
            </div>
          )}
        </main>

      </div>

      {/* Modal de Mantenimiento para Añadir Ejercicio */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Dumbbell className="text-indigo-600" /> Nuevo Ejercicio
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white rounded-full p-1 shadow-sm transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del Ejercicio</label>
                <input
                  type="text"
                  required
                  value={newExercise.nombre}
                  onChange={e => setNewExercise({ ...newExercise, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  placeholder="Ej. Sentadilla Búlgara"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Series</label>
                  <input
                    type="text"
                    required
                    value={newExercise.series}
                    onChange={e => setNewExercise({ ...newExercise, series: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Repeticiones</label>
                  <input
                    type="text"
                    required
                    value={newExercise.reps}
                    onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Imagen (Opcional)</label>

                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newExercise.imagen.startsWith('data:') ? '' : newExercise.imagen}
                      onChange={e => {
                        setNewExercise({ ...newExercise, imagen: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-4 py-2 pl-9 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-shadow"
                      placeholder="URL de la imagen..."
                    />
                    <ImageIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                  <span className="text-slate-400 self-center text-sm font-medium">o</span>
                  <label className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 cursor-pointer flex items-center gap-2 transition-colors border border-indigo-100">
                    <Upload size={16} /> Subir
                    <input id="image-upload-input" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-3 h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 backdrop-blur-sm transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">* Para fotos locales, elige imágenes menores a 2MB.</p>
              </div>

              <button type="submit" className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                Añadir a la Rutina
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}