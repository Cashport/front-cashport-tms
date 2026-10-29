# Cashport TMS — DESIGN.md

Guía de diseño para refactorizar **todos los módulos del TMS** (logística: Viajes, Solicitudes de transporte, Proveedores, Contratos, Facturación, Configuración, Mapa). Es la fuente de verdad del TMS: si una pantalla contradice este documento, gana el documento.

Parte de los lineamientos generales de Cashport (`Brain/Desing/DESIGN.md`) y los adapta al TMS. La regla que **no** se hereda es la de los colores: **los colores de los estados del TMS se respetan tal como están** (ver §1.3).

---

## 0. Contexto, punto de partida y objetivo

- El 95% de los usuarios trabaja en **portátiles de 14" (1920×1080 con Windows al 150%)**. El navegador queda en **~1280 × 550 px útiles**.
- Objetivo: ninguna pantalla con scroll horizontal y más información visible arriba del pliegue. En el tablero de Viajes (`/logistics/transfer-orders`), al menos **7 filas** visibles en 14".
- **Pantalla de referencia del TMS:** el tablero de **Viajes** (`/logistics/transfer-orders`, pestañas Solicitudes / En curso / Finalizadas). Es la primera que se refactoriza; las demás se comparan lado a lado con ella. Su aspecto debe coincidir con la pantalla Clientes de Cashport (misma familia visual).

### ⚠ Zoom global (decidido 28/10/2026: el mismo de Cashport)
El TMS adopta el zoom global variable de Cashport, en `src/styles/globals.scss`: `--app-zoom` vale **0.75** entre 1024 y 1440 px, **0.85** entre 1441 y 1700 px y **1** en móvil y monitores grandes. Hoy el TMS no tiene zoom; es el primer paso del refactor, para que los tokens de §2 y los componentes compartidos sean idénticos en las dos apps.

- **Cómo leer las medidas:** son **px visibles en pantalla** (lo que se ve en el viewport de 1280). El valor CSS es **medida ÷ 0.75** (≈ ×1.333); §2 ya trae los valores convertidos, así que usa siempre los tokens en vez de convertir a mano.
- **Alturas por viewport:** se compensan con `calc(100 * var(--vh))` (o `h-screen`, ya compensado), nunca `100vh`.
- **Coordenadas:** popovers, tooltips, dropdowns, mapas (MapLibre), gráficas (`getBoundingClientRect`, `clientX`) y drag & drop se prueban con el zoom. Si alguno se desalinea, se corrige con `getAppZoom()` (`@/utils/utils`), que se trae de Cashport con el zoom.
- **Portales:** los dropdowns y popovers de Ant Design se pintan fuera del `<main>`. Se verifica que queden alineados y con el mismo tamaño de letra que el resto.
- No se agrega `zoom` ni `transform: scale` por componente.

### Estado (28/10/2026)
- **Piloto aplicado (rama `feat/diseno-cashport`):**
  - Zoom global, `getAppZoom()`, tokens de §2 y clases `cp-page`, `cp-card`, `cp-card-row` y `cp-control-fill`.
  - `Header` de 58px con el menú del avatar (proyecto actual, cambiar contraseña y cerrar sesión con confirmación) y `ViewWrapper` sin espacio bajo el header.
  - Buscador único (`SearchField`): `UiSearchInput` y `search-input-provider` pasan a ser sus envoltorios.
  - Tablero de Viajes: Filtrar, buscador, "Generar acción" y "Crear viaje" en el header; pestañas según §4.1 dentro de una `cp-card`.
- **Pendiente:**
  - Menú lateral 6e.
  - Modal Filtros Avanzados: Filtrar sigue siendo el `Cascader`, con estilo de botón del header.
  - Contador en las pestañas.
  - Compactar las tablas (§7).
  - Las demás pantallas, que ya heredan el header y el buscador nuevos.
- En §11 está el inventario de lo que había y qué cambia.
- Decidido: el TMS usa el mismo zoom global que Cashport (§0).
- Ya está alineado con Cashport: tipografía Poppins (`_variables_logistics.css` y `layout.tsx`), fondo #f7f7f7, lima #cbe71e como color primario y texto #141414.

### Plan de ejecución
1. **Base compartida:** zoom global (§0), `getAppZoom()`, tokens de §2 en `src/styles/tailwind.css` y las clases `cp-page`, `cp-card` y `cp-card-row`. Los valores sueltos de `_variables_logistics.css` (gaps de 39.5px, 153px, 466px…) se reemplazan por tokens a medida que se tocan las pantallas.
2. **Shell y header** (§3–4) en `ViewWrapper` y `Header`, que ya usan todas las pantallas de logística.
3. **Piloto: tablero de Viajes**, con su header, pestañas, buscador, filtros y tabla.
4. **Módulo por módulo**, un PR por módulo, con capturas antes y después a 1280×550, 1366×620 y 1920×1080 y el número de filas visibles.

---

## 1. Fundamentos

### 1.1 Tipografía
- **Poppins** en todo (400, 500, 600, 700), con `-webkit-font-smoothing: antialiased`. No usar Inter, Roboto, Arial ni Causten Round en pantallas nuevas.

| Uso | Visible | CSS (con zoom 0.75) |
|---|---|---|
| Título de página (header) | 13.5px / 600 | 18px. **No más grande**: hoy es 24px |
| Título de tarjeta / sección | 13.5px / 600 | 18px |
| Pestañas (Solicitudes / En curso / Finalizadas) | 13.5px / 600 | 18px |
| KPI principal | 22px / 600 | 29px |
| KPI secundario | 18px / 600 | 24px |
| Texto de tabla | 12.5px | 17px |
| Encabezado de tabla | 12px / 600 #141414 | 16px |
| Etiqueta / subtítulo | 11.5px #6b6b6b | 15px |
| Meta (sub-línea de fila, leyendas, fechas) | 10.5px #6b6b6b | 14px |
| Mínimo absoluto | 10px | 13px |

### 1.2 Color de interfaz — nunca pasteles
Colores sólidos y saturados para todo lo que **no** es un estado: botones, leyendas, gráficas, barras y chips de filtro.

| Token | Valor | Uso |
|---|---|---|
| `--lime` | #cbe71e | Acción primaria, ítem activo, badges, progreso positivo |
| `--lime-dark` | #9bb514 | Hover de lima, indicador positivo |
| `--lime-tint` | #f4f9d2 | Solo el fondo del ícono del modal de filtros |
| `--blue` | #1677ff | Enlaces (número de TR o TO, nombre de proveedor) |
| `--orange` | #ff6a13 | Alertas medias |
| `--navy` | #2b4a5f | Serie oscura de gráficas |
| `--magenta` | #e0007a | Riesgo alto y "Cerrar sesión" |
| `--red` | #e5262b | Errores y validaciones |
| `--ink` | #141414 | Texto principal |
| `--ink-2` | #4a4a4a | Texto secundario |
| `--ink-3` | #6b6b6b | Etiquetas |
| `--ink-4` | #8a8a8a | Placeholder, texto del botón Filtrar, pestaña inactiva |
| `--line` | #ececec | Bordes de tabla, separadores |
| `--line-2` | #e3e3e3 | Bordes de inputs y botones |
| `--bg` | #f7f7f7 | Fondo de la app y del header |
| `--surface` | #ffffff | Tarjetas |
| `--muted` | #f2f2f2 | Pistas de barras, chips neutros |

Series de gráficas sin significado de estado (proveedores, tipos de servicio, ciudades), en orden fijo: #1677ff · #ff6a13 · #9bb514 · #2b4a5f · #e0007a · #0e9aa7 · #7b3fe4. "Sin dato" va en #8a8a8a. La misma categoría lleva el mismo color en todos los módulos.

Enlaces: `a { color:#1677ff } a:hover { color:#0b5bd3; text-decoration:underline }`. Hoy `globals.scss` pone `a { color: inherit }`; cambiarlo solo en los enlaces de contenido (números de TR o TO y nombres), no en los botones del menú.

### 1.3 Colores de estado del TMS — **se respetan, no se cambian**
Los estados de TR, viajes, facturas, solicitudes a proveedor, novedades e incidentes **conservan sus colores actuales**. La regla "nunca pasteles" de §1.2 **no aplica** a los estados.

- **Fuente única:** la columna `cashportlogistics.status.color`, que el back entrega con cada registro (por ejemplo `trip_status_color`). El front **nunca** escribe a mano el color de un estado ni lo reemplaza por un token.
- **Chip de estado:** se sigue pintando con el `Tag` actual (`src/components/atoms/Tag/Tag.tsx`): texto y borde de 1px en el color del estado, y fondo en el mismo color al 8% (`color + "14"`). Para ganar densidad solo cambian las medidas: 24px de alto, radio 7, 11.5px / 500 y padding 2px 8px. Los colores no cambian.
- **Estados de documentos** (proveedores, vehículos y conductores): se mantiene `src/components/molecules/logistics/utils/documentStatusMap.tsx` tal cual, con sus colores, fondos e íconos.

Colores vigentes en producción (28/10/2026), solo como referencia:

| Tipo | Estado → color |
|---|---|
| Solicitud de transporte (TR) | Esperando proveedor #ED171F · Asignando vehículo #0085FF · Sin iniciar #969696 · Aplazada #969696 · Cargando #0085FF · En curso #A9BA43 · Descargando #FF6B00 · Detenido #ED171F · Stand by #3D3D3D · Por legalizar #FF6B00 · Legalizado #A9BA43 · Renta fija #0085FF · Cancelado #B94A48 |
| Viaje | Sin iniciar #969696 · Cargando #0085FF · En curso #A9BA43 · Descargando #FF6B00 · Detenido #ED171F · Stand by #3D3D3D · Terminado #000000 |
| Facturación | Pendiente soportes #FF6B00 · Por aceptar #969696 · Rechazado proveedor #ED161E · Aceptadas #0085FF · Preautorizado #CBE71E · Facturado #01796F |
| Solicitud a proveedor | Por confirmar #969696 · En aprobaciones #FF9900 · Cotizado #1E5D90 · Aceptado #0085FF · Asignadas #CBE71E · Rechazado #ED171F |
| Novedad / incidente | Pendiente #969696 (incidente #FFFFFF) · Aceptada #E0F07E · Rechazada #ED161E |
| Orden de transferencia (TO) | Sin procesar #cdcdcd · Cancelado #B94A48 · Procesando y Esperando proveedor: **color inválido** (ver nota) |

> **Para revisar (no se cambia en este refactor):** en la base, TO "Procesando" tiene `#fgfgfg` y TO "Esperando proveedor" tiene `#ggffdd`, que no son colores válidos. El navegador los ignora y el chip sale sin color. Corregirlos es un cambio de datos que debe decidir el negocio. Los estados de aprobación de precios (PA) usan #cdcdcd para todo, salvo "No enviado".

### 1.4 Iconografía
- Íconos de trazo (1.7–2.4px), puntas redondeadas y color #141414. Sin emoji.
- Hoy el TMS usa `phosphor-react`: se mantiene, en peso `regular` o `bold`, nunca `fill`, salvo los íconos de estado que ya lo usan.

---

## 2. Densidad (tokens)

Valores CSS **ya divididos por 0.75**; entre paréntesis, lo que se ve en pantalla. Van en `:root` de `src/styles/tailwind.css` y son los mismos de Cashport.

```css
:root {
  --rail-w: 64px;             /* (48) menú lateral cerrado */
  --page-pad-x: 16px;         /* (12) */
  --page-pad-bottom: 11px;    /* (8)  */
  --header-h: 77px;           /* (58) */
  --card-gap: 12px;           /* (9)  entre tarjetas o KPIs */
  --section-gap: 12px;        /* (9)  entre bloques */
  --card-radius: 14px;        /* (10.5) */
  --card-pad: 14px 18px;      /* (10.5 13.5) */
  --kpi-h: 112px;             /* (84) */
  --control-h: 36px;          /* botones e inputs del header */
  --search-w: 300px;
  --chip-h: 35px;             /* (26) */
  --avatar: 34px;
  --tabs-h: 43px;             /* (32) pestañas del tablero */
  --table-title-h: 48px;      /* (36) */
  --table-head-h: 43px;       /* (32) */
  --table-row-h: 56px;        /* (42) fila con sub-línea */
  --table-row-h-single: 45px; /* (34) fila de una línea */
  --table-pad-x: 21px;        /* (16) */
  --table-total-h: 48px;      /* (36) */
}
```

Regla general: **compacto pero con aire.** Si algo se ve apretado, primero se gana espacio quitando lo repetido o subiéndolo al header; nunca se baja la tipografía del mínimo.

---

## 3. Shell

```
┌──────┬──────────────────────────────────────────────────────────────────────┐
│ LOGO │ ‹ Título  [● Actualizado 22:06]     [chips][Filtrar▾][🔍][⋯] [+ Crear] (●)▾ │ ← header sticky 58px
│ ──── ├──────────────────────────────────────────────────────────────────────┤
│ ▣    │ Solicitudes   En curso   Finalizadas          ← pestañas, 32px           │
│ ▣    │ [KPI] [KPI] [KPI] [KPI]                       ← opcional, una fila       │
│ ──── │ ┌ Tarjeta principal (tabla / mapa / formulario) — cp-card ──────────┐ │
│ ▣    │ │                                                                      │ │
│ ⚙ ⎋ │ └──────────────────────────────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────────────────────────┘
```

### 3.1 Menú lateral (`SideBar` + `ModulesButtons`)
Mismo diseño "Menu Lateral Cashport" 6e:
- **Riel blanco**, alto completo, borde derecho 1px #ececec y padding 14px 12px. Cerrado mide 64px (`--rail-w`) y muestra solo íconos; abierto mide 240px, con nombres.
- **Comportamiento:** se abre al pasar el mouse, superpuesto al contenido con sombra `0 12px 32px rgba(0,0,0,.14)`. "Fijar menú" lo deja abierto empujando el contenido, y la preferencia se guarda en el navegador.
- **Proyecto arriba:** logo en un cuadro de 48×48, radio 10. Abierto, lleva al lado el nombre del proyecto (14px / 600, hasta dos renglones). Un clic abre "Elegir proyecto". En el TMS esto es crítico: hay varios proyectos (Halliburton Colombia, Halliburton Venezuela, Galderma…) y **el usuario siempre debe ver en qué proyecto está**.
- **Ítems:**
  - Medidas: 34px de alto, radio 10, ícono de 19px, nombre 13.5px.
  - Estados: hover #f4f4f4; activo en lima #cbe71e con texto 600.
  - Grupos del TMS: **Operación** (Viajes, Mapa), **Proveedores** (Proveedores, Contratos, Aceptar viajes), **Facturación** y **Configuración**. Entre grupos va una línea #ececec.
- **Pie:** Configuración, Fijar menú y **Cerrar sesión** (pide confirmación, §4).
- **Cambio de proyecto:** al cambiar, **se descarta todo lo cacheado del proyecto anterior** (SWR). Ninguna pantalla puede seguir mostrando datos del proyecto anterior (bug B-01 de las pruebas multiproyecto).

### 3.2 Selector de proyectos ("Elegir proyecto")
- Modal con una grilla de tarjetas: logo y nombre sobre una franja gris; el proyecto activo lleva la franja en lima.
- Si no caben, se muestra "Ver más proyectos ⌄" con un degradado abajo. El usuario nunca debe adivinar que hay más proyectos.

### 3.3 Contenido
- **Página:**
  - Fondo #f7f7f7 y padding `0 var(--page-pad-x) var(--page-pad-bottom)`, que pone `ViewWrapper`. Hoy son 1rem y 2rem a la izquierda, con `gapTitle` de 1rem.
  - El contenido **arranca justo debajo del header**, sin gap ni margen extra.
  - Entre bloques va `--section-gap`; entre tarjetas de una fila, `--card-gap`.
- **Tarjetas:**
  - Blancas, radio `--card-radius` y padding `--card-pad`, **sin borde ni sombra**.
  - El `Container` actual (radio 0.5rem, padding 1rem 2rem) se reemplaza por `cp-card`.
- **Clases compartidas obligatorias** (`src/styles/tailwind.css`): `cp-page` en la raíz de la vista, `cp-card` en cualquier tarjeta o panel y `cp-card-row` en las filas de KPIs o resúmenes.
- **Nunca scroll horizontal**, ni en la página ni en las tablas.

---

## 4. Header de página (obligatorio en todas las pantallas)

Una sola línea de **58px** (`--header-h`), sticky, fondo #f7f7f7. Los controles miden **36px** (`--control-h`). De izquierda a derecha:

1. **Volver "‹"**: solo el chevron, sin recuadro. Aparece en detalles y pantallas de segundo nivel: detalle de viaje, de TR, de proveedor o de contrato, crear viaje y crear usuario. Hace `history.back()`; si se entró por URL directa, va al listado padre.
2. **Título** 13.5px / 600, el mismo en todos los módulos.
   - En un detalle, el título lleva el **número visible del proyecto**, por ejemplo "Viaje 1.245" (`COALESCE(id_tr, id)`), **nunca el id interno** (bug B-06).
   - A la derecha del título, en la misma línea: el estado del registro (chip de §1.3) o "● Actualizado 22:06" en vistas que se refrescan.
   - El TMS no usa el corte ni la proyección de Cashport (`HeaderCutoff`).
3. **Espaciador flexible.**
4. **Chips de filtros aplicados:**
   - 26px, fondo blanco, radio 7, 11px.
   - Van pegados a la izquierda de Filtrar y crecen hacia la izquierda.
   - Si no caben, "+N". Nunca saltan de línea.
5. **Filtrar ▾:**
   - Botón sin borde, relleno blanco, radio 8, texto #8a8a8a 13px / 500 y 36px de alto.
   - Badge lima con el conteo de filtros activos.
   - Abre el modal Filtros Avanzados (§6). Reemplaza al `Cascader` actual (`FilterOrders`).
6. **Buscador fijo**, 300px y relleno blanco. Su posición nunca cambia. Reemplaza al `UiSearchInput` que hoy va dentro de la tarjeta del tablero.
7. **"⋯" Acciones**: el actual "Generar acción" del tablero (agrupar TO en TR, cancelar, aplazar…). Botón del header sin borde.
8. **Acción primaria del módulo**, si la hay ("+ Crear viaje", "+ Nuevo proveedor"): botón lima de 32px. Va a la izquierda del avatar y **solo se muestra si el rol tiene permiso de creación** (`ProtectedComponent`).
9. **Avatar** negro de 34px con chevron:
   - Abre el menú del usuario: 300px y radio 14, con nombre y correo, **proyecto actual**, Cambiar contraseña y **Cerrar sesión** en magenta.
   - Cerrar sesión pide confirmación: modal de 400px "¿Cerrar sesión?".
   - Va en **todas** las pantallas. Reemplaza el popover actual, que solo tiene un botón.

En resumen: título a la izquierda. A la derecha, leyendo desde el borde hacia adentro: avatar → acción primaria → ⋯ → buscador → Filtrar (+ chips).

- **Siempre el `Header` compartido** (`@/components/organisms/header`, a través de `ViewWrapper`). Nada de headers propios con `<h1>` ni barras sticky armadas en cada pantalla. Hoy el tablero arma su propia barra con `.stickyHeader`.
- **Excepción, tabla principal con búsqueda propia:** si una tabla busca solo sobre sí misma, el buscador va en la línea de título de la tarjeta y el header no lleva buscador.
- **Indicadores de vista** (por ejemplo "● En vivo" del mapa de viajes) van **dentro** del mapa o la tarjeta, en una píldora en la esquina superior derecha. Nunca en una franja propia.

### 4.1 Pestañas (Solicitudes / En curso / Finalizadas y similares)
- Una línea de 32px (`--tabs-h`) **dentro de la tarjeta principal**, arriba de la tabla. Separador inferior 1px #ececec.
- Texto 13.5px / 600: inactiva #8a8a8a (hoy #ddd, sin contraste suficiente), activa #141414 con subrayado de 2px #141414.
- 24px entre pestañas. El contador de registros va al lado, en 11px #8a8a8a, por ejemplo "En curso 37".
- Las pestañas sin permiso no se pintan (`ProtectedComponent`), como hoy.

---

## 5. KPIs

Para módulos con resumen (Facturación, Contratos, Mapa):
- **Todos los KPIs en una fila** en escritorio, con `grid-template-columns: repeat(N, minmax(0,1fr))`. Si un texto no cabe, elipsis con tooltip. En móvil, de a dos.
- Tarjetas `cp-card` con gap `--card-gap`.
- Estructura: etiqueta (11.5px #6b6b6b) → valor (22px / 600) → valor de contraste con chip de % → barra de 5px → leyenda de una línea en 10px.
- Chip de %: 10.5px / 600, radio 5. Neutro #f2f2f2, positivo #cbe71e y riesgo #e0007a con texto blanco.
- **Montos de contrato:** "usado / total" con barra de progreso, y la marca de alerta en magenta cuando el saldo no cubre la tarifa.

---

## 6. Filtros — siempre con el modal "Filtros Avanzados"

Nunca filtros sueltos en la vista: solo el botón Filtrar del header y los chips.

- **Modal:** overlay suave, ~900px (`max-width:100%`), radio 16.
- **Header del modal:** embudo lima en un cuadro de 36px con fondo #f4f9d2 · "Filtros Avanzados" (17px / 600) · subtítulo en 12px #6b6b6b · X.
- **Cuerpo en dos columnas:**
  - A la izquierda, categorías en filas de 44px. La activa va en negrita, con fondo #f7f7f7 y barra lima de 3px.
  - A la derecha: buscador de la categoría, "N RESULTADOS" con "Seleccionar todos" y opciones en dos columnas con multi-selección.
- **Categorías del TMS** (en el tablero de Viajes): Estado · Fecha de inicio · Origen · Destino · Vicepresidencia · PSL · Centro de costo · Proveedor · Tipo de servicio · Tipo de vehículo.
  - Las opciones **siempre son las del proyecto activo**: nunca se listan ubicaciones, proveedores ni PSL de otro proyecto.
- **Fecha:** periodos predefinidos (Hoy, Esta semana, Mes actual, Último mes, Último trimestre, YTD, Últimos 12 meses) y un rango personalizado Desde / Hasta.
- **Footer:** "Limpiar todo" a la izquierda; "Cancelar" y **"Aplicar Filtros"** (lima, radio 10, 40px) a la derecha.
- Se edita en borrador y solo se aplica con "Aplicar Filtros"; Cancelar o la X descartan los cambios.

---

## 7. Tablas

- **No se cambia la UX de las tablas** al compactar: se conservan las columnas, los checkboxes de selección, la agrupación TR → TO y la información de cada celda.
- **Tarjeta de tabla:** título 13.5px / 600 y contador ("1.245 viajes", 11px #8a8a8a), todo en una línea de 36px. La ayuda va en un tooltip.
- **Encabezado:** 32px, blanco, 12px / 600 #141414, flechas de orden grises (la activa negra), borde inferior #ececec. **Sticky.**
- **Filas:**
  - Con sub-línea, 42px: número visible de la TR en **enlace azul #1677ff** y, debajo, `Origen → Destino` o `Proveedor · Tipo de servicio` en 10.5px #6b6b6b.
  - De una línea, 34px.
  - Borde inferior #f2f2f2 y padding horizontal 16px.
  - Números y montos alineados a la derecha. Fechas como `28/10 14:30`.
  - El estado es el chip de §1.3, con el color de la base.
- **Fila total sticky abajo** (36px, fondo #fafafa), cuando la vista muestra totales (valor de viajes, facturación).
- **Paginación:** la tabla de Ant Design (`Table`) se mantiene, pero en tamaño `small`, con paginación compacta abajo a la derecha y el cuerpo con scroll interno. **Prohibido `scroll={{ x: ... }}`.**
- **Responsive:** se ocultan columnas secundarias por prioridad y, en angosto, la tabla pasa a filas-tarjeta. Nunca scroll horizontal.
- **Montos:** siempre en la **moneda del proyecto activo**. Halliburton Venezuela trabaja en USD y Colombia en COP: nunca asumir COP ni formatear con `es-CO` fijo. La moneda sale de la configuración del proyecto.

---

## 8. Botones y controles

| Tipo | Estilo |
|---|---|
| Primario (`PrincipalButton type="primary"`) | Lima #cbe71e, texto #141414 600, radio 10, 40px (32px en el header). Hover #9bb514 |
| Secundario | Blanco, borde 1px #e3e3e3, radio 8, texto #141414 |
| Texto | Sin fondo, 600, #141414 o #4a4a4a |
| Peligro (cancelar viaje, rechazar) | Texto o borde #e5262b; relleno solo en la confirmación final |
| Input | 36px, radio 8, fondo blanco (o #fafafa con borde #e3e3e3 dentro de modales) |
| **Buscador** | **Uno solo en toda la app** (`SearchField`): 36px, radio 8, sin borde, lupa 15px, texto 13px / 500, "×" para limpiar. Gris sobre tarjetas blancas y blanco sobre el fondo gris. `UiSearchInput` y `search-input` pasan a ser envoltorios de este componente |
| Filtrar / ⋯ / botones del header | Sin borde, relleno blanco sobre gris, radio 8, 36px |
| Chip removible | 26px, fondo blanco, radio 7, 11px, "×" #8a8a8a |
| Chip de estado | `Tag` con el color de la base (§1.3) |

- **Hit targets** de 28px o más en desktop.
- **Selects de Ant Design** (`Select`, `Cascader`): 36px y radio 8, y el dropdown blanco que ya fuerza `globals.scss`.
- **Modales:**
  - Radio 16, título 17px / 600, footer con Cancelar (texto) y la acción primaria en lima.
  - Ancho máximo 100%.
  - Las acciones irreversibles (cancelar viaje, rechazar factura) piden confirmación con el número visible del registro.

### Modo oscuro
El TMS no tiene modo oscuro. Si se agrega, aplican las reglas de Cashport: el tema se elige en el menú del avatar y los colores salen de los tokens `cp-*`. Los chips de estado conservan sus colores.

---

## 9. Responsive — reglas duras

- Nunca scroll horizontal: ni en la página, ni en tablas, ni en modales.
- `min-width:0` en hijos flex y grid; grids con `minmax(0,…)`.
- Modales con `max-width:100%`.
- El único zoom permitido es el global (§0). Nada de `zoom` ni `transform: scale` por componente.
- Alturas con `100%` o flex, no `100vh` en contenedores internos. Hoy `ViewWrapper` y `globals.scss` (`html, body { height: 100vh }`) usan `100vh`: pasan a `calc(100 * var(--vh))`.
- **Mapas** (MapLibre): ocupan el alto disponible de la tarjeta. Sus popovers y marcadores se prueban con el zoom.

---

## 10. Checklist por pantalla

- [ ] Respeta el zoom global y usa los tokens de §2, sin px sueltos.
- [ ] Popovers, dropdowns, mapas y drag & drop alineados con el zoom.
- [ ] Shell con menú lateral 6e y el proyecto activo visible arriba.
- [ ] Raíz `cp-page` y tarjetas `cp-card`, sin espacio extra bajo el header.
- [ ] `Header` compartido de 58px en el orden de §4: buscador fijo y chips a la izquierda de Filtrar.
- [ ] Avatar con "Cerrar sesión" (con confirmación) en todas las pantallas, incluidos detalles.
- [ ] "‹" sin recuadro en los detalles; título con el **número visible**, nunca el id interno.
- [ ] Filtros solo en el modal Filtros Avanzados, con opciones del proyecto activo.
- [ ] Un único buscador (`SearchField`).
- [ ] Pestañas de 32px dentro de la tarjeta, con contador.
- [ ] Tabla con encabezado sticky, filas de 42 / 34px, UX intacta, números en azul y sin `scroll.x`.
- [ ] **Estados con su color de la base**, sin recolorear ni escribir colores a mano.
- [ ] Montos en la moneda del proyecto.
- [ ] Sin colores pastel fuera de los chips de estado.
- [ ] Al cambiar de proyecto no queda ningún dato del proyecto anterior.
- [ ] Sin scroll horizontal en 1280×550, 1366×620 y 1920×1080, con capturas antes y después y número de filas visibles en el PR.

---

## 11. Inventario del TMS hoy (28/10/2026) y qué cambia

| Pieza | Hoy | Cambia a |
|---|---|---|
| Zoom | Ninguno (`globals.scss`) | Zoom global variable de Cashport (§0, decidido) |
| Tokens | `_variables_logistics.css` con ~60 gaps y paddings ad hoc (39.5px, 153px, 466px…), `_variables.scss` y `tailwind.css` (`--cashport-*`) | Tokens de §2 en `tailwind.css`; los ad hoc se eliminan al tocar cada pantalla |
| Shell | `ViewWrapper`: `100vh`, padding 1rem / 2rem a la izquierda, `gapTitle` 1rem | Padding `--page-pad-x`, sin gap bajo el header, altura compensada |
| Header | `Header`: título 24px / 600, avatar con popover de un solo botón | §4: 58px, título 13.5px, controles a la derecha, menú del avatar completo |
| Tarjeta | `Container`: radio 0.5rem, padding 1rem 2rem | `cp-card` |
| Tablero de Viajes | `TransferOrders.tsx`: barra sticky propia (buscador, Cascader, "Generar acción", "Crear nuevo viaje") y pestañas 16px en #ddd / #141414 | Esos controles suben al header; pestañas según §4.1 |
| Filtros | `FilterOrders` (`Cascader` de Ant Design) | Modal Filtros Avanzados (§6) |
| Buscador | `UiSearchInput` (`search-input-provider`), `search-input` | `SearchField` único |
| Chip de estado | `Tag`: color de la base, fondo al 8% y borde 1px; 16px / 300, padding 4px 8px | **Mismos colores**; solo más compacto (§1.3) |
| Colores de estado | `status.color` en la base y `documentStatusMap.tsx` | **Sin cambios** |
| Tablas | `Table` de Ant Design con estilos por pantalla | §7 |
| Moneda | `preferences.currency: 'COP'` fijo en el back (`rol.controller.ts`) | Moneda por proyecto (necesita cambio de back) |

Referencias visuales: las de Cashport (`Cashport 14 pulgadas.dc.html`, `Menu Lateral Cashport.html`) y, en el TMS, el tablero de Viajes una vez refactorizado.
