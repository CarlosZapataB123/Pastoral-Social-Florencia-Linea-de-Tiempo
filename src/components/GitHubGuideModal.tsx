import React from 'react';
import { X, Github, Cloud, Smartphone, BookOpen, CheckCircle, Terminal } from 'lucide-react';

interface GitHubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="github-guide-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-800 rounded-lg">
              <Github className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">Guía de Despliegue y Subida a GitHub</h3>
              <p className="text-xs text-stone-300">
                Comparte la aplicación con tus colegas para uso en computadores y celulares
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 text-xs sm:text-sm">
          {/* Section 1: Push to GitHub */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4 text-amber-600" />
              1. Subir el proyecto a tu repositorio de GitHub
            </h4>
            <p className="text-xs text-stone-600">
              Puedes descargar el código en formato ZIP desde el menú de configuración de AI Studio, o clonar y enlazar a GitHub con los siguientes comandos:
            </p>
            <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
              <p className="text-stone-400"># Inicializar repositorio local si aún no está</p>
              <p>git init</p>
              <p>git add .</p>
              <p>git commit -m &quot;Feat: Mapa Interactivo Pastoral Social Florencia Caquetá&quot;</p>
              <p className="text-stone-400 mt-2"># Conectar con tu repositorio en GitHub</p>
              <p>git branch -M main</p>
              <p>git remote add origin https://github.com/TU-USUARIO/pastoral-social-caqueta.git</p>
              <p>git push -u origin main</p>
            </div>
          </div>

          {/* Section 2: Firebase configuration for colleagues */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
              <Cloud className="w-4 h-4 text-amber-600" />
              2. Sincronización en tiempo real con Firebase
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              La base de datos Firestore ya está configurada con reglas de acceso en tiempo real. Para que tus colegas ejecuten el proyecto en local o en su propio servidor:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Credenciales incluidas o variables de entorno:</p>
              <p>
                El archivo <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono">firebase-applet-config.json</code> contiene la configuración requerida. Tus colegas solo necesitan ejecutar:
              </p>
              <div className="bg-white/80 p-2 rounded font-mono text-[11px] text-stone-800">
                npm install<br />
                npm run dev
              </div>
            </div>
          </div>

          {/* Section 3: Free Hosting on Vercel / GitHub Pages / Firebase Hosting */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
              <Smartphone className="w-4 h-4 text-amber-600" />
              3. Despliegue para que el equipo lo use en sus celulares
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Opción A: Vercel (Recomendada y Gratis)
                </div>
                <p className="text-xs text-stone-600">
                  1. Entra a <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com</a> y conecta tu cuenta de GitHub.
                  <br />
                  2. Importa el repositorio <code className="font-mono">pastoral-social-caqueta</code>.
                  <br />
                  3. Haz clic en <strong>Deploy</strong>. Te generará un enlace HTTPS directo accesible desde cualquier celular en segundos.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Opción B: Firebase Hosting
                </div>
                <p className="text-xs text-stone-600">
                  Ejecuta en tu terminal:
                  <br />
                  <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[11px]">npm run build</code>
                  <br />
                  <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-[11px]">npx firebase deploy --only hosting</code>
                  <br />
                  Obtendrás un enlace oficial <code className="font-mono text-[11px]">.web.app</code> para compartir.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Mobile Experience */}
          <div className="bg-stone-100 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block mb-0.5">Uso en Celulares (PWA / Responsive)</span>
              Los miembros de la Pastoral Social pueden abrir el enlace generado en el navegador de su teléfono (Chrome o Safari) y seleccionar <strong>&quot;Agregar a la pantalla de inicio&quot;</strong>. La app funcionará como una aplicación nativa con acceso directo al mapa, creación y edición táctil.
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
