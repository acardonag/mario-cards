# Mario Cards - PWA Setup Guide

## 🎯 Generación de Iconos

Para completar la configuración de PWA, necesitas generar los iconos:

### Opción 1: Usando el generador incluido
1. Abre el archivo `generate-icons.html` en tu navegador
2. Descarga los archivos `icon-192.png` y `icon-512.png`
3. Colócalos en la raíz del proyecto

### Opción 2: Crear iconos personalizados
Crea dos imágenes PNG con las siguientes características:
- **icon-192.png**: 192x192 píxeles
- **icon-512.png**: 512x512 píxeles
- Fondo: Rojo Mario (#E52521)
- Logo/diseño de tu preferencia

### Opción 3: Usar herramientas online
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## 📱 Testing PWA

### En Desarrollo Local:
1. Necesitas servir la app con HTTPS (excepto localhost)
2. Usa un servidor local: `python -m http.server 8000` o similar
3. Abre Chrome DevTools > Application > Manifest
4. Verifica que el manifest cargue correctamente

### En Producción (GitHub Pages):
1. Ve a: Settings > Pages
2. Source: Deploy from branch `main`
3. Carpeta: / (root)
4. Guarda y espera unos minutos
5. Tu app estará en: `https://acardonag.github.io/mario-cards/`

## ✅ Funcionalidades PWA Implementadas

- ✅ **Instalable**: Se puede instalar como app en el dispositivo
- ✅ **Offline**: Funciona sin conexión después de la primera carga
- ✅ **Cache**: Todas las imágenes y archivos se guardan en cache
- ✅ **Responsive**: Optimizado para móviles
- ✅ **Manifest**: Configuración completa de la app
- ✅ **Service Worker**: Manejo de cache y offline
- ✅ **Install Prompt**: Notificación para instalar la app

## 🚀 Características

- **Pantalla completa**: Se ejecuta sin la barra del navegador
- **Icono en home**: Aparece como app nativa
- **Colores del sistema**: Usa los colores de Mario
- **Offline first**: Funciona sin internet
- **Auto-update**: Se actualiza automáticamente

## 📋 Checklist Post-Despliegue

- [ ] Generar y agregar iconos (icon-192.png, icon-512.png)
- [ ] Desplegar en GitHub Pages
- [ ] Verificar manifest en DevTools
- [ ] Probar instalación en móvil
- [ ] Verificar funcionamiento offline
- [ ] Actualizar README con URL de la app
