# Mapa Interactivo de Caquetá - Pastoral Social Florencia

Aplicación web interactiva para visibilizar, mapear y gestionar los puntos de interés de la labor humanitaria desarrollada por la **Pastoral Social de la Diócesis de Florencia (Caquetá)** desde su fundación oficial en **1986** hasta la fecha.

## Características Principales

- **Mapa interactivo del Departamento de Caquetá**:
  - Centrado en la geografía amazónica del Caquetá y sus 16 municipios (Florencia, San Vicente del Caguán, Belén de los Andaquíes, San José del Fragua, Cartagena del Chairá, etc.).
  - Selector de capas de mapa: Vista Estándar (OpenStreetMap), Vista Satelital de alta resolución (Esri Satellite) y Relieve Topográfico.
- **Categorización Personalizable**:
  - Líneas pastorales: *Derechos Humanos y Paz*, *Seguridad Alimentaria y Agroecología*, *Infancia y Juventud*, *Emergencia y Ayuda Humanitaria*, *Mujeres y Tejido Comunitario*, *Cuidado de la Casa Común y Amazonía*.
  - Gestor para crear nuevas categorías con colores distintivos en el mapa.
- **Filtros por Temporalidad y Población**:
  - Distinción exacta del año de intervención (desde 1986 hasta el año actual).
  - Reconocimiento de tipos de población: Campesinos y colonos, Víctimas del conflicto y desplazados, Pueblos indígenas (Koreguaje, Embera, Inga), Mujeres líderes, Niñez y juventud, Migrantes en tránsito, etc.
- **Sincronización en Tiempo Real con Firebase Firestore**:
  - Cualquier punto marcado, editado o eliminado desde el computador o desde el celular de un colega se actualiza instantáneamente en todos los dispositivos conectados.
- **Diseño Móvil y Escritorio (Mobile-First)**:
  - Optimizado para pantallas táctiles y navegación en celulares.
  - Vistas conmutables: Mapa interactivo y Vista de lista resumida.
- **Exportación de Datos**:
  - Exportación de los puntos en formato JSON para respaldos o análisis en QGIS / ArcGIS.

---

## 🚀 Guía de Despliegue y Subida a GitHub

### 1. Subir a tu propio repositorio en GitHub

1. Crea un repositorio vacío en tu cuenta de GitHub llamado, por ejemplo: `pastoral-social-caqueta`.
2. En tu terminal local, corre los siguientes comandos:

\`\`\`bash
# 1. Inicializar git
git init
git add .
git commit -m "feat: mapa interactivo de labor humanitaria Pastoral Social Caqueta"

# 2. Conectar a tu repo en GitHub
git branch -M main
git remote add origin https://github.com/TU-USUARIO/pastoral-social-caqueta.git

# 3. Subir el código
git push -u origin main
\`\`\`

### 2. Configurar Firebase para tus colegas

El proyecto ya incluye soporte automático con `firebase-applet-config.json`.
Si deseas utilizar tu propio proyecto de Firebase personal:
1. Entra a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2. Activa **Cloud Firestore** en modo de prueba o producción.
3. Copia las credenciales de tu app web y agrégalas en un archivo `.env` o en `src/firebase.ts`:

\`\`\`env
VITE_FIREBASE_API_KEY="tu_api_key"
VITE_FIREBASE_AUTH_DOMAIN="tu_proyecto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tu_proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu_proyecto.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="tu_sender_id"
VITE_FIREBASE_APP_ID="tu_app_id"
\`\`\`

### 3. Despliegue Gratuito para Compartir el Enlace (Vercel / Netlify / Firebase)

#### Opción A: Despliegue con Vercel (Recomendada)
1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New Project"** y selecciona tu repositorio `pastoral-social-caqueta`.
3. En la configuración de Build: Framework Preset: **Vite**, Root Directory: `./`.
4. Haz clic en **Deploy**. En 40 segundos tendrás una URL pública HTTPS (ej. `https://pastoral-social-caqueta.vercel.app`) lista para enviar por WhatsApp a los colegas.

#### Opción B: Despliegue con Firebase Hosting
\`\`\`bash
npm run build
npx firebase login
npx firebase init hosting
npx firebase deploy --only hosting
\`\`\`

### 4. Uso en Teléfonos Móviles
Los agentes pastorales y colegas en terreno pueden abrir la URL en el navegador de su teléfono (Google Chrome en Android o Safari en iPhone) y tocar en **"Agregar a la pantalla de inicio"** para usarla como una aplicación móvil instalada con acceso directo.
