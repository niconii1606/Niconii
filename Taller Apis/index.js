// app.js — lógica para consumir API y renderizar tarjetas
const API_URL = 'https://jsonplaceholder.typicode.com/users';

const state = {
  users: [],
  filtered: [],
};

const els = {
  grid: document.getElementById('usersGrid'),
  status: document.getElementById('status'),
  search: document.getElementById('searchInput'),
};

document.addEventListener('DOMContentLoaded', async () => {
  setStatus('Cargando usuarios…');
  try {
    const data = await fetchUsers();
    state.users = data;
    state.filtered = data;
    renderAll(state.filtered);
    setStatus(`Mostrando ${state.filtered.length} usuarios.`);
  } catch (err) {
    console.error(err);
    setStatus('Error al cargar datos. Reintenta más tarde.');
  }
});

els.search.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  state.filtered = state.users.filter(u => {
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });
  renderAll(state.filtered);
  setStatus(state.filtered.length ? `Resultados: ${state.filtered.length}` : 'Sin coincidencias.');
});

async function fetchUsers(){
  const res = await fetch(API_URL, { headers: { 'Accept': 'application/json' } });
  if(!res.ok){
    throw new Error('HTTP ' + res.status);
  }
  await sleep(350); // pequeña pausa para ver el estado de carga
  return res.json();
}

function renderAll(users){
  els.grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  users.forEach(user => frag.appendChild(userCard(user)));
  els.grid.appendChild(frag);
}

function userCard(user){
  const { name, email, address = {}, company = {}, phone, website } = user;
  const city = address.city || '—';
  const companyName = company.name || '';

  const card = el('article', { class: 'card', role: 'listitem', tabindex: '0' });

  const title = el('h3', {}, text(name));
  const link = el('a', { class: 'email', href: `mailto:${email}` }, text(email));
  const meta = el('div', { class: 'meta' });
  meta.append(
    row('Ciudad', city),
    companyName ? row('Empresa', companyName) : null,
    phone ? row('Teléfono', phone) : null,
    website ? row('Sitio', website) : null,
  );

  card.append(title, link, meta);
  return card;
}

function row(label, value){
  if(value == null) return null;
  const wrap = el('div');
  const strong = el('strong', {}, text(label + ': '));
  wrap.append(strong, text(String(value)));
  return wrap;
}

function setStatus(msg){
  els.status.textContent = msg;
}

// Helpers
function el(tag, attrs = {}, ...children){
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if(v == null) return;
    if(k in node){ node[k] = v; }
    else{ node.setAttribute(k, v); }
  });
  children.filter(Boolean).forEach(ch => node.append(ch));
  return node;
}
function text(str){ return document.createTextNode(str); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
