
# 📱 S2Market

El marketplace inteligente para estudiantes universitarios, optimizado con IA.


## 🧠 Descripción

**S2Market** es una aplicación móvil diseñada para estudiantes que desean vender o comprar productos dentro del entorno universitario. Impulsada por inteligencia artificial, permite realizar búsquedas optimizadas por texto, facilitando el descubrimiento de productos de manera rápida y precisa.

Esta app fue desarrollada y validada inicialmente con estudiantes de la **Universidad de La Sabana**.



## 🚀 Características principales

- 🔍 **Búsqueda por texto con IA**
- 💡 **Recomendaciones de publicación** para vendedores según demanda
- 💰 **Consulta en tiempo real de cambio de moneda** (vía API externa)
- ❤️ **Favoritos accesibles sin conexión**
- 📸 **Publicación rápida** con cámara o selección de galería
- 📍 **Ubicaciones estratégicas** predefinidas para entrega dentro del campus
- 🔔 **Notificaciones** sobre cambios de estado, nuevas órdenes y más



## 🛠️ Tecnologías usadas

- **Frontend:** React Native con Expo (TypeScript)
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **IA:** Gemini API para procesamiento de texto
- **APIs externas:** API de tipo de cambio (ExchangeRate API)
- **Notificaciones:** Expo Notifications



## 📦 Instalación

```bash
git clone https://github.com/rafaelsava/S2Market.git
cd S2Market
npm install
npx expo start
````

*Asegúrate de tener Expo CLI instalado y las variables necesarias en el archivo `.env`.*



## 📁 Estructura del Proyecto

```bash
.
├── app/            # Navegación y rutas (Expo Router)
├── assets/         # Recursos estáticos
├── components/     # Componentes reutilizables
├── context/        # Contextos globales (Auth, Productos, Órdenes, etc.)
├── hooks/          # Custom Hooks
├── images/         # Imágenes organizadas
├── utils/          # Utilidades y configuraciones comunes
├── .env            # Variables de entorno (ignorado por git)
├── app.json        # Configuración Expo
├── README.md       # Este archivo
```



## 🧩 Modelo de Negocio

S2Market ofrece un entorno seguro y ordenado para estudiantes que desean comercializar productos. Su monetización futura puede incluir:

* Comisiones por transacción
* Destacar productos dentro del feed
* Servicios premium para vendedores



## 📖 Wiki del Proyecto

Consulta la sección **Wiki** del repositorio para más información detallada sobre:

* ✏️ **Definición del proyecto**
* ✅ **Criterios de éxito**
* 👤 **Historias de Usuario**: Vendedor / Comprador
* 📋 **Requerimientos funcionales y no funcionales**
* 🚧 **Limitaciones**
* ⚠️ **Riesgos del Proyecto y Estrategias de Mitigación**

🔗 [Ir a la Wiki del Proyecto](https://github.com/rafaelsava/S2Market/wiki)



## 👨‍💻 Autores

* Rafael Salcedo
  [GitHub](https://github.com/rafaelsava)
* Fermin Escalona
  [GitHub](https://github.com/ferminescalona)

