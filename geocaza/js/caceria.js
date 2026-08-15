/* =====================================================================
   GeoCaza — definición de una cacería
   ---------------------------------------------------------------------
   Una cacería es una lista de figuras escondidas. Cada figura tiene:
     · el cuerpo geométrico y sus medidas (las define el docente)
     · un marcador impreso (glifo 0..11) que se esconde físicamente
     · opcionalmente una coordenada GPS, para el radar al aire libre
     · una pista escrita, para los lugares bajo techo
   Todo eso se codifica en un texto corto que viaja dentro de un QR.
   ===================================================================== */

const MAX_FIGURAS = 12;                 // un glifo distinto por figura
const RADIO_CAPTURA = 15;               // m: a esta distancia el radar dice "aquí es"

/* ---- texto <-> objeto ------------------------------------------------
   v2|Título|cuerpo:medidas:lat,lon:pista|cuerpo:medidas::pista|…
   Los campos vacíos se permiten (una figura puede no tener GPS).        */
function limpiar(t){ return String(t||'').replace(/[|:,]/g, ' ').trim(); }

function codificarCaceria(cfg){
  const p = ['v2', limpiar(cfg.titulo).slice(0,40)];
  for(const f of cfg.figuras){
    const coord = (f.lat != null && f.lon != null)
      ? f.lat.toFixed(6) + ',' + f.lon.toFixed(6) : '';
    p.push([f.cuerpo, f.valores.join('-'), coord, limpiar(f.pista).slice(0,60)].join(':'));
  }
  return p.join('|');
}

function decodificarCaceria(txt){
  if(!txt) return null;
  const p = String(txt).split('|');
  if(p[0] !== 'v2') return null;
  const cfg = { titulo: p[1] || 'Cacería', figuras: [] };
  for(let i = 2; i < p.length && cfg.figuras.length < MAX_FIGURAS; i++){
    const [cuerpo, meds, coord, pista] = p[i].split(':');
    if(!CUERPOS[cuerpo]) continue;
    const valores = (meds||'').split('-').map(Number).filter(n => !isNaN(n) && n > 0);
    if(valores.length !== CUERPOS[cuerpo].dims.length) continue;
    let lat = null, lon = null;
    if(coord && coord.indexOf(',') > 0){
      const [a,b] = coord.split(',').map(Number);
      if(!isNaN(a) && !isNaN(b)){ lat = a; lon = b; }
    }
    cfg.figuras.push({ cuerpo, valores, lat, lon, pista: pista || '' });
  }
  return cfg.figuras.length ? cfg : null;
}

/* medidas -> objeto {a:..,h:..} que espera el motor geométrico */
function dimsFigura(f){
  const def = CUERPOS[f.cuerpo], d = {};
  def.dims.forEach((x,i) => d[x.k] = f.valores[i]);
  return d;
}
function textoMedidas(f){
  const def = CUERPOS[f.cuerpo];
  return def.dims.map((d,i) => d.k + ' = ' + f.valores[i] + ' cm').join(' · ');
}

/* distancia entre dos coordenadas, en metros (haversine) */
function distanciaM(lat1, lon1, lat2, lon2){
  const R = 6371008.8, g = Math.PI/180;
  const dLat = (lat2-lat1)*g, dLon = (lon2-lon1)*g;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*g)*Math.cos(lat2*g)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1, Math.sqrt(a)));
}
/* pista de calor para el radar */
function calor(m){
  if(m <= RADIO_CAPTURA) return {t:'¡Aquí es! Busca el marcador', c:'#4ade80', n:4};
  if(m <= 40)  return {t:'Muy caliente',  c:'#ff8a3d', n:3};
  if(m <= 100) return {t:'Caliente',      c:'#ffc043', n:2};
  if(m <= 250) return {t:'Tibio',         c:'#7fb2e5', n:1};
  return             {t:'Frío',          c:'#5b7fa6', n:0};
}

/* respuesta correcta con tolerancia (el redondeo del estudiante es válido) */
function esCorrecta(respuesta, valor){
  if(isNaN(respuesta)) return false;
  const tol = Math.max(Math.abs(valor) * 0.01, 0.5);
  return Math.abs(respuesta - valor) <= tol;
}

/* cacería de ejemplo, para que la app funcione recién instalada */
const CACERIA_DEFECTO = {
  titulo: 'Cacería de ejemplo',
  figuras: [
    { cuerpo:'cubo',     valores:[6],     lat:null, lon:null, pista:'Bajo el escritorio del docente' },
    { cuerpo:'cilindro', valores:[3,10],  lat:null, lon:null, pista:'Cerca de la puerta del aula' },
    { cuerpo:'piramide', valores:[6,8],   lat:null, lon:null, pista:'En el mural del fondo' },
    { cuerpo:'prisma',   valores:[8,4,5], lat:null, lon:null, pista:'Detrás de la pizarra' },
    { cuerpo:'cono',     valores:[3,9],   lat:null, lon:null, pista:'En el estante de libros' }
  ]
};
