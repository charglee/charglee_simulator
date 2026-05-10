# Charglee Simulator - OCPP Fleet Terminal

**Charglee Simulator** es un potente simulador de estaciones de carga de vehículos eléctricos (EV) de grado de producción, diseñado para probar, depurar y realizar demostraciones de Sistemas de Gestión Central (CMS). Proporciona una interfaz de alta fidelidad para simular comportamientos de carga del mundo real en múltiples unidades simultáneamente.

## Características Principales

- **Soporte Multi-protocolo**: Totalmente compatible con los protocolos **OCPP 1.6 J** y **OCPP 2.0.1**.
- **Administración de Flotas**: Gestiona múltiples cargadores virtuales desde un único panel. Añade, elimina y configura unidades al instante.
- **Simulación de Hardware**:
    - **Autorización RFID**: Simula pasadas de tarjetas físicas con etiquetas de identificación personalizables.
    - **Transacciones Interactivas**: Inicia y detén sesiones de carga manualmente o mediante comandos remotos.
    - **Orquestación de Estados**: Alterna entre estados *Available*, *Charging*, *Faulted* y *Unavailable*.
- **Monitoreo en Tiempo Real**: Terminal integrado para la inspección en vivo de mensajes OCPP (Enviados/Recibidos/Errores).
- **Comandos Remotos**: Soporte completo para `RemoteStartTransaction` y `RemoteStopTransaction` (y sus equivalentes en 2.0.1).
- **Endpoints Personalizables**: Vincula cada unidad del simulador a cualquier URL WebSocket de un CMS compatible.

## Cómo se usa

1. **Configuración**: Ve a la pestaña de **Configure** para establecer tu Point ID, la URL del WebSocket del CMS y la versión de OCPP.
2. **Conexión**: Haz clic en **Connect** para establecer el apretón de manos (handshake) del WebSocket.
3. **Autorización**: Introduce un tag RFID y haz clic en **Scan RFID** para simular la autenticación de un usuario.
4. **Carga**: Una vez autorizado, haz clic en **START** para iniciar una sesión. El simulador comenzará automáticamente a reportar valores de medidor y cambios de estado.
5. **Monitoreo**: Observa la **Real-time Terminal** para verificar el intercambio de mensajes.

## Créditos

Esta aplicación fue desarrollada por **Charglee LLC** para proporcionar a la comunidad de infraestructura de movilidad eléctrica una herramienta robusta para probar implementaciones de protocolos.

## Licencia y Uso

Este proyecto es de **libre uso** para la comunidad de desarrolladores y profesionales de la industria de vehículos eléctricos. Siéntete libre de clonar, modificar e integrarlo en tus flujos de trabajo de prueba.

---
*Creado con ❤️ por Charglee LLC.*