// =======================
// INICIALIZAÇÃO DO MAPA
// =======================
var map = L.map('map').setView([-22.75, -43.45], 11);

// Basemap clean
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & Carto'
}).addTo(map);

// =======================
// POPUP COM IMAGEM + DADOS
// =======================
function popupContent(feature, latlng) {
  let props = feature.properties;

  let nomeImagem = "";

  if (props.nome) {
    nomeImagem = props.nome
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");
  }

  let caminhoImagem = `images/${nomeImagem}.jpg`;

  let coords = props.coordenadas
  ? props.coordenadas
  : (latlng
      ? `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`
      : "N/A");

  return `
    <div style="width:240px">
      <h4 style="margin:0">${props.nome || "Ponto"}</h4>

      <img src="${caminhoImagem}" 
           style="width:100%; border-radius:6px; margin:6px 0;"
           onerror="this.style.display='none'">

      <p style="font-size:13px">${props.descricao || ""}</p>

      <hr style="margin:6px 0">

      <p style="font-size:12px">
        <b>📍 Coordenadas:</b><br> ${coords}<br>
        <b>🪨 Geossítio:</b> ${props.geossit || "N/A"}<br>
        <b>📊 Valores:</b> ${props.valores || "N/A"}
      </p>
    </div>
  `;
}

// =======================
// CAMADAS
// =======================
var camadas = {};

// -----------------------
// PNMNI
// -----------------------
fetch('data/pnmni_delimitacao.geojson')
.then(res => res.json())
.then(data => {
  camadas["Parque (PNMNI)"] = L.geoJSON(data, {
    style: {
      color: "#2e7d32",
      weight: 2,
      fillColor: "#66bb6a",
      fillOpacity: 0.3
    },
    interactive: false
  }).addTo(map);

  camadas["Parque (PNMNI)"].bringToBack();

  map.fitBounds(camadas["Parque (PNMNI)"].getBounds());
});

// -----------------------
// APA
// -----------------------
fetch('data/apa.geojson')
.then(res => res.json())
.then(data => {
  camadas["APA"] = L.geoJSON(data, {
    style: {
      color: "#fbc02d",
      weight: 1,
      fillOpacity: 0.02
    },
    interactive: false
  }).addTo(map);

  camadas["APA"].bringToBack();
});

// -----------------------
// Trilhas (Águas)
// -----------------------
fetch('data/trilhas.geojson')
.then(res => res.json())
.then(data => {
  camadas["Trilha das Águas"] = L.geoJSON(data, {
    style: {
      color: "#7b1fa2",
      weight: 5,
      dashArray: "10,6",
      opacity: 0.9
    },
  onEachFeature: (f, l) => {
  l.bindPopup(`
    <div style="width:200px">
      <h4 style="margin:0">Trilha (Caminho das Águas)</h4>
    </div>
  `);
}
  }).addTo(map);

  camadas["Trilha das Águas"].bringToFront();
});

// -----------------------
// Trilha Contenda
// -----------------------
fetch('data/contenda.geojson')
.then(res => res.json())
.then(data => {
  camadas["Trilha Contenda"] = L.geoJSON(data, {
    style: {
      color: "#fdd835",
      weight: 5,
      dashArray: "10,6",
      opacity: 0.9
    },
    onEachFeature: (f, l) => {
  l.bindPopup(`
    <div style="width:200px">
      <h4 style="margin:0">Trilha (Face Norte - Contenda)</h4>
    </div>
  `);
}
  }).addTo(map);

  camadas["Trilha Contenda"].bringToFront();
});

// -----------------------
// Pontos
// -----------------------
fetch('data/pontos.geojson')
.then(res => res.json())
.then(data => {
  camadas["Pontos de Interesse"] = L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 7,
        fillColor: "#d32f2f",
        color: "#000",
        weight: 1,
        fillOpacity: 0.9
      });
    },
    onEachFeature: (f, l) => {
      l.bindPopup(() => popupContent(f, l.getLatLng()));
    }
  }).addTo(map);

  camadas["Pontos de Interesse"].bringToFront();
});

// =======================
// CONTROLE DE CAMADAS (ROBUSTO)
// =======================
setTimeout(() => {
  var control = L.control.layers(null, camadas, {
    collapsed: false
  }).addTo(map);

  document.getElementById("layerControl")
    .appendChild(control.getContainer());
}, 1000);