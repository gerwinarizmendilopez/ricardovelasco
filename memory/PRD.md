# HØME Records - Beats Marketplace

## Original Problem Statement
Usuario quiere importar su página de beats desde GitHub (gerwinarizmendilopez/andreswilhelmrivera.git) y montar la aplicación completa incluyendo:
- Pagos con PayPal (sandbox)
- Pagos con Stripe (test)
- Carga correcta de beats y archivos de audio
- Toda la funcionalidad frontend y backend

## User Personas
1. **Artistas/Productores**: Venden beats a través de la plataforma
2. **Compradores**: Adquieren licencias de beats (Básica, Premium, Exclusiva)
3. **Admin**: Gestiona catálogo de beats y ventas

## Core Requirements
- Sistema de autenticación (email/password + Google OAuth)
- Catálogo de beats con reproductor de audio
- Sistema de carrito de compras
- Pagos con Stripe (tarjeta) y PayPal
- Licencias: Básica ($29.99), Premium ($79.99), Exclusiva ($299.99)
- Panel de administración
- Historial de compras

## Tech Stack
- **Frontend**: React 19 + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe + PayPal SDK v2
- **Audio**: WaveSurfer.js

## What's Been Implemented (Jan 2026)
✅ Repositorio clonado e importado correctamente
✅ 8 beats cargados en MongoDB con portadas y archivos de audio
✅ Integración Stripe configurada (test keys)
✅ Integración PayPal sandbox configurada
✅ Frontend completamente funcional (Home, Catálogo, Carrito, Login)
✅ Sistema de licencias y precios
✅ Reproductor de audio funcionando
✅ EmailJS configurado para contacto

## Credentials Configured
- Stripe: Test keys configuradas
- PayPal: Sandbox credentials
- EmailJS: Service ID, Template ID, Public Key

## API Endpoints
- GET /api/beats - Lista de beats
- GET /api/beats/{beat_id} - Detalle de beat
- GET /api/beats/audio/{filename} - Archivo de audio
- GET /api/beats/cover/{filename} - Imagen de portada
- POST /api/payment/create-payment-intent - Crear pago Stripe
- POST /api/payment/paypal/create-order - Crear orden PayPal
- GET /api/payment/config - Config Stripe
- GET /api/payment/paypal/config - Config PayPal

## Next Tasks / Backlog
- P0: N/A - MVP completado
- P1: Implementar envío de emails de confirmación de compra
- P1: Agregar más beats al catálogo desde admin
- P2: Implementar sistema de descarga de archivos comprados
- P2: Agregar géneros personalizados desde admin
- P3: Analytics de reproducciones y ventas
