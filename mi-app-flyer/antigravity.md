# Proyecto Antigravity: Flyer Printing App

## Descripción General
Aplicación web moderna diseñada para la preparación de imágenes destinadas a la impresión de flyers y documentos de papelería. Funciona como una **Mesa de Trabajo Digital (Artboard)** profesional. Su objetivo es procesar las imágenes, aprovechar al máximo el uso del papel (mosaicos) y proveer una experiencia fluida bajo un tema oscuro nativo que destaca en la zona de impresión. 

## Tech Stack
- **Framework:** React
- **Build Tool:** Vite
- **Procesamiento de imagen:** HTML5 Canvas API (Nativo, sin dependencias pesadas en renderizado)
- **Generación de Archivos:** `jspdf` (Integración dinámica para empaquetado PDF)

## Requisitos y Funcionalidades Actuales
### 1. Interfaz y Experiencia (UX/UI)
- **Dark Mode Global y Definitivo:** Interfaz construida en paletas de escala de grises y oscuros (`#121212`, `#1e1e1e`, `#2a2a2a`) para reducir fatiga visual y asemejarse al entorno de herramientas de diseño profesionales.
- **Mesa de Trabajo Realista (Artboard):** El editor renderiza la hoja física pura en blanco sobre un fondo oscuro interactivo (con bordes desplazados `offset`), al que se le aplicó una intensa sombra paralela 3D para separarlo estéticamente.
- **Controles Responsivos Universal:** Cajas flexibles creadas con CSS `flex-wrap` optimizadas tanto para monitores UltraWide como para móviles o Tabletas, adaptándose y expandiéndose.

### 2. Configuración del Impreso
- **Tamaños Dinámicos Completos (300 DPI):** Cuenta con equivalencias exactas por píxel a máxima resolución estándar para impresión en plotter/hogareña en formatos: A3, A4, A5, A6, Carta, Media Carta, Oficio y Tabloide.
- **Orientación en Tiempo Real:** Intercambio matemático exacto entre layout *Vertical* y *Horizontal*.
- **Mosaico (Tiling) Personalizado:** Posibilidad de crear grillas exactas para ubicar cientos de copias en la msma página usando *Filas* (Rows) y *Columnas* (Cols).
- **Ajustes Geométricos (Fill Modes):**
   - *Ajustar (Contain):* Encaje matemático centrado sin recortes.
   - *Estirar (Stretch):* Llenado forzado deformando al tamaño total de la celda.
   - *Cubrir (Cover):* Magnificación proporcional y recorte del sobrante en los bordes.

### 3. Herramientas Especiales de Medición
- **Reglas (cm) Independientes:** Reglas numéricas calibradas exactamente en centímetros en el cuadrante virtual (vía algoritmo) y ubicadas *fuera* de la zona de papel; nunca invaden la imagen ni molestan la visión del documento principal.
- **Guías de Corte Coloreables:** Líneas divisorias punteadas en caso de usar *Mosaico* ideales para guía visual en recorte o guillotina, complementado con un "Color Picker" dinámico HTML5.

### 4. Gestor de Exportación y Salida
- **Multiformato:** El lienzo actual soporta la escritura simultánea y sin pérdida en extensiones **JPG, PNG y PDF**.
- **Medición de Impacto en Vivo:** Cálculo y rastreo silencioso de la compresión (Calidad) que resulta en estimaciones proyectadas de peso en **KB**, evitando sorpresas.
- **Nombramiento Libre:** Un campo de texto directo junto al botón de descarga para decidir el `placeholder` del documento final.
- **Exportaciones Limpias e Inmaculadas:** Como la App usa instancias duales de Canvas (`offCanvas`), las reglas o marcas dibujadas artificialmente sobre la previsualización no afectan de origen al documento que obtienes, por ende se entrega limpio para llevar a tu impresora.

## Instalación y Desarrollo
Para abrir y correr el creador de Flyers a futuro:

1. **Instalación de Dependencias base:**
   ```bash
   npm install
   ```
2. **Iniciar Servidor Local:**
   ```bash
   npm run dev
   ```

## Próximos pasos / Backlog (Sugerencias a futuro)
- Permitir multialmacenamiento de imágenes subidas para celdas independientes (drag & drop).
- Botón local 'Flush' o reinicio de todas las variables, devolviendo todo a 'A4 / 1x1'.