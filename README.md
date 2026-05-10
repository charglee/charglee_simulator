<h1 align="center">Charglee Simulator - OCPP Fleet Terminal</h1>

<table width="100%">
<tr>
<td width="50%" valign="top">

<p><b>Charglee Simulator</b> is a powerful, production-grade Electric Vehicle (EV) charging station simulator designed for testing, debugging, and demonstrating Central Management Systems (CMS). It provides a high-fidelity interface to simulate real-world charging behaviors across multiple units simultaneously.</p>

<h3>Key Features</h3>
<ul>
  <li><b>Multi-protocol Support</b>: Fully compatible with both <b>OCPP 1.6 J</b> and <b>OCPP 2.0.1</b> protocols.</li>
  <li><b>Fleet Management</b>: Manage multiple virtual chargers from a single dashboard. Add, remove, and configure units on the fly.</li>
  <li><b>Hardware Simulation</b>:
    <ul>
      <li><b>RFID Authorization</b>: Simulate physical card swipes with customizable ID tags.</li>
      <li><b>Interactive Transactions</b>: Start and stop charging sessions manually or via remote commands.</li>
      <li><b>State Orchestration</b>: Toggle between <i>Available</i>, <i>Charging</i>, <i>Faulted</i>, and <i>Unavailable</i> states.</li>
    </ul>
  </li>
  <li><b>Real-time Monitoring</b>: Built-in terminal for live inspection of OCPP messages (Sent/Received/Errors).</li>
  <li><b>Remote Commands</b>: Full support for <code>RemoteStartTransaction</code> and <code>RemoteStopTransaction</code> (and their 2.0.1 equivalents).</li>
  <li><b>Customizable Endpoints</b>: Bind each simulator unit to any compatible CMS WebSocket URL.</li>
</ul>

<h3>How to Use</h3>
<ol>
  <li><b>Configuration</b>: Go to the <b>Configure</b> tab to set your Point ID, CMS WebSocket URL, and OCPP version.</li>
  <li><b>Connection</b>: Click <b>Connect</b> to establish the WebSocket handshake.</li>
  <li><b>Authorization</b>: Enter an RFID tag and click <b>Scan RFID</b> to simulate user authentication.</li>
  <li><b>Charging</b>: Once authorized, click <b>START</b> to initiate a session. The simulator will automatically begin reporting meter values and state changes.</li>
  <li><b>Monitoring</b>: Watch the <b>Real-time Terminal</b> to verify message exchanges.</li>
</ol>

<h3>Credits</h3>
<p>This application was developed by <b>Charglee LLC</b> to provide the e-mobility infrastructure community with a robust tool for testing protocol implementations.</p>

<h3>License & Usage</h3>
<p>This project is <b>free to use</b> for the developer community and EV industry professionals. Feel free to clone, modify, and integrate it into your testing workflows.</p>

<p align="center"><i>Built with ❤️ by Charglee LLC.</i></p>

</td>
<td width="50%" valign="top">

<p><b>Charglee Simulator</b> es un potente simulador de estaciones de carga de vehículos eléctricos (EV) de grado de producción, diseñado para probar, depurar y realizar demostraciones de Sistemas de Gestión Central (CMS). Proporciona una interfaz de alta fidelidad para simular comportamientos de carga del mundo real en múltiples unidades simultáneamente.</p>

<h3>Características Principales</h3>
<ul>
  <li><b>Soporte Multi-protocolo</b>: Totalmente compatible con los protocolos <b>OCPP 1.6 J</b> y <b>OCPP 2.0.1</b>.</li>
  <li><b>Administración de Flotas</b>: Gestiona múltiples cargadores virtuales desde un único panel. Añade, elimina y configura unidades al instante.</li>
  <li><b>Simulación de Hardware</b>:
    <ul>
      <li><b>Autorización RFID</b>: Simula pasadas de tarjetas físicas con etiquetas de identificación personalizables.</li>
      <li><b>Transacciones Interactivas</b>: Inicia y detén sesiones de carga manualmente o mediante comandos remotos.</li>
      <li><b>Orquestación de Estados</b>: Alterna entre estados <i>Available</i>, <i>Charging</i>, <i>Faulted</i> y <i>Unavailable</i>.</li>
    </ul>
  </li>
  <li><b>Monitoreo en Tiempo Real</b>: Terminal integrado para la inspección en vivo de mensajes OCPP (Enviados/Recibidos/Errores).</li>
  <li><b>Comandos Remotos</b>: Soporte completo para <code>RemoteStartTransaction</code> y <code>RemoteStopTransaction</code> (y sus equivalentes en 2.0.1).</li>
  <li><b>Endpoints Personalizables</b>: Vincula cada unidad del simulador a cualquier URL WebSocket de un CMS compatible.</li>
</ul>

<h3>Cómo se usa</h3>
<ol>
  <li><b>Configuración</b>: Ve a la pestaña de <b>Configure</b> para establecer tu Point ID, la URL del WebSocket del CMS y la versión de OCPP.</li>
  <li><b>Conexión</b>: Haz clic en <b>Connect</b> para establecer el apretón de manos (handshake) del WebSocket.</li>
  <li><b>Autorización</b>: Introduce un tag RFID y haz clic en <b>Scan RFID</b> para simular la autenticación de un usuario.</li>
  <li><b>Carga</b>: Una vez autorizado, haz clic en <b>START</b> para iniciar una sesión. El simulador comenzará automáticamente a reportar valores de medidor y cambios de estado.</li>
  <li><b>Monitoreo</b>: Observa la <b>Real-time Terminal</b> para verificar el intercambio de mensajes.</li>
</ol>

<h3>Créditos</h3>
<p>Esta aplicación fue desarrollada por <b>Charglee LLC</b> para proporcionar a la comunidad de infraestructura de movilidad eléctrica una herramienta robusta para probar implementaciones de protocolos.</p>

<h3>Licencia y Uso</h3>
<p>Este proyecto es de <b>libre uso</b> para la comunidad de desarrolladores y profesionales de la industria de vehículos eléctricos. Siéntete libre de clonar, modificar e integrarlo en tus flujos de trabajo de prueba.</p>

<p align="center"><i>Creado con ❤️ por Charglee LLC.</i></p>

</td>
</tr>
</table>