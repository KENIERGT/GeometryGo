# GeoCaza — búsqueda de cuerpos geométricos con realidad aumentada

Juego de búsqueda estilo *Pokémon Go* para clase de matemática. El docente esconde marcadores
impresos por el aula o por toda la escuela; los estudiantes los buscan con la cámara del celular,
capturan la figura que aparece y la resuelven calculando su volumen y su área total.

Son **dos aplicaciones**:

| Archivo | Para quién | Qué hace |
|---|---|---|
| `docente.html` | docente | crea las figuras con las medidas que quiera y las previsualiza en 3D, imprime los marcadores, fija las ubicaciones y genera el QR |
| `index.html` | estudiante | el juego: radar, cámara, captura, álbum y retos |

## Por qué marcadores y no solo GPS

El GPS **no funciona dentro de un aula**: bajo techo el error pasa de 20 o 30 metros y no
distingue un rincón de otro. Por eso cada figura es un marcador impreso que se esconde
físicamente, y el GPS se usa solo como **radar de frío/caliente** cuando la cacería es al
aire libre. Así el mismo juego sirve en el aula, en el patio y en toda la escuela.

## 1. El docente prepara la cacería

En `docente.html`:

1. Pone nombre a la cacería y pega la dirección donde publicó el juego.
2. Agrega hasta **12 figuras**, eligiendo el cuerpo y **escribiendo las medidas que quiera**
   (admite decimales, de 0,1 a 500 cm). A la derecha ve el volumen y el área que tendrá que
   calcular el estudiante.
   El botón **Ver figura** abre la figura en 3D, con un control para desplegarla en su red plana
   y las tres fórmulas ya sustituidas: así el docente comprueba que la figura quedó como quería
   antes de imprimirla.
3. Para cada figura:
   - **Bajo techo:** deja la ubicación vacía y escribe una pista ("detrás de la pizarra").
   - **Al aire libre:** enciende el GPS, camina hasta el escondite y pulsa **Fijar aquí**.
4. **Imprimir marcadores**: sale una portada con el QR y la **hoja de control con las respuestas**
   (esa no se reparte), y luego una página por figura con su marcador.
5. Recorta, esconde cada marcador y reparte solo la portada con el QR.

## 2. Los estudiantes juegan

Escanean el QR una vez con la cámara normal del celular. El juego queda guardado en el teléfono
y sigue funcionando sin internet.

- La pantalla principal muestra el progreso, el puntaje, el radar y la lista de pistas.
- **Buscar con la cámara** abre la cámara. Al enfocar un marcador escondido aparece la figura en 3D
  sobre el papel: encontrarla **no basta**.
- Para coleccionarla hay que resolver el reto: la figura gira en pantalla, con un control para
  desplegarla en su **red plana**, y dos preguntas de opción múltiple —volumen y área total—
  con cuatro opciones cada una.
- **Si falla los tres intentos, la figura no se colecciona.** Vuelve a la lista de pendientes
  marcada como fallida y tiene que buscar otra vez el marcador para reintentarla.
- **Puntaje:** 30 puntos si acierta al primer intento, 18 al segundo y 8 al tercero.
- Al completarlas todas: resumen con puntaje y tiempo, un **código QR para mostrarle al docente**
  y descarga de resultados en CSV.

### Las opciones incorrectas no son al azar

Cada distractor corresponde a un error típico y documentado: confundir el volumen con el área
total, olvidar dividir entre 3 en el cono y la pirámide, usar el diámetro en lugar del radio,
usar la altura del cuerpo donde va la apotema o la generatriz, o dejar las bases fuera del área.

La app **registra cuál eligió** el estudiante, así que el CSV no dice solo "falló": dice
*"volumen: olvida dividir entre 3"*. Eso convierte el juego en un instrumento de diagnóstico,
y es probablemente el dato más valioso del proyecto para el capítulo de resultados.

## 3. Publicar

La cámara y el GPS solo funcionan en `https://` o en `localhost`.

```bash
cd geocaza
python3 -m http.server 8000
```

Para el aula: subir la carpeta a GitHub, activar Settings → Pages (rama `main`, carpeta raíz)
y pegar en el generador el enlace de `index.html`.

## Estructura

```
index.html               el juego (estudiante)
docente.html             preparación de la cacería (docente)
js/geometria.js          motor: redes planas, plegado, áreas y volúmenes
js/marcadores.js         glifos y generación de patrones
js/caceria.js            definición de la cacería, radar, puntaje y códigos
data/patrones/p00..p11   los 12 patrones que reconoce el detector
data/camera_para.dat     calibración de cámara
vendor/                  Three.js r164, AR.js 3.4.8 y el generador de QR
sw.js, manifest.json     funcionamiento sin conexión (PWA)
```

## Cómo está construido

- **Un glifo por figura.** Los 12 marcadores son fijos y están elegidos por búsqueda para que la
  distancia de Hamming entre ellos y entre sus rotaciones sea de al menos 6 de 16 celdas. El mismo
  glifo genera la imagen impresa y el archivo de patrón, así que en el QR solo viaja la lista de
  figuras, medidas, coordenadas y pistas: un texto corto.
- **Las figuras se arman plegando su red plana.** Cada cuerpo es un árbol de bisagras cuyo ángulo
  es `π − diedro`; un parámetro entre 0 y 1 interpola entre la red y el cuerpo armado. Por eso el
  juego puede mostrar el desarrollo plano sin modelos adicionales.
- **El progreso se guarda por cacería** en el propio teléfono, de modo que el estudiante puede
  cerrar la app y seguir después.

## Verificación hecha

- Flujo completo probado: figura encontrada, fallo, opciones descartadas, acierto al segundo
  intento (+18 puntos) y caso de tres fallos, donde la figura **no** se colecciona y vuelve a
  pendientes marcada para reintentar.
- Medidas decimales comprobadas de punta a punta: cilindro de r = 3,5 cm y h = 10 cm definido por
  el docente, transportado en el QR y recibido por el estudiante con V = 384,85 cm³, y los
  distractores generados correctamente (1 539,38 cm³ = usar el diámetro).
- Ida y vuelta del QR: el docente fija una coordenada, el estudiante abre el enlace y el radar
  reporta correctamente **22 m** de distancia con la clasificación "muy caliente".
- Cálculos comprobados contra las fórmulas (pirámide de a = 6 y h = 8: V = 96 cm³, A_T = 138,53 cm²).
- Hoja imprimible generada en PDF: portada con QR, hoja de control con respuestas y una página
  por marcador.
- La detección de marcadores usa el mismo mecanismo ya validado en GeoRA: 9 de 9 aciertos con los
  12 patrones cargados, confianza ≈ 0,998 y sin falsos positivos.

## Límites conocidos

- Máximo 12 figuras por cacería (un glifo distinto para cada una).
- El GPS no sirve bajo techo: ahí hay que usar pistas, por diseño.
- Si la cacería tiene muchas pistas largas, el texto puede no caber en un QR; la app avisa y basta
  con acortarlas.
- El seguimiento del marcador es sensible a la iluminación: no esconderlos en rincones muy oscuros.
