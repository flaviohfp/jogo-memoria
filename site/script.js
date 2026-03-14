// ----------- Firebase Compat -----------
const firebaseConfig = {
  apiKey: "AIzaSyCEnl_d-er570l6vlK_9vYF2tnmsb7b0DI",
  authDomain: "jogodamemoria-e9a84.firebaseapp.com",
  databaseURL: "https://jogodamemoria-e9a84-default-rtdb.firebaseio.com",
  projectId: "jogodamemoria-e9a84",
  storageBucket: "jogodamemoria-e9a84.firebasestorage.app",
  messagingSenderId: "440698503353",
  appId: "1:440698503353:web:bd3fcdb1929a7321e49b68",
  measurementId: "G-BP0WGBLP8H"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ----------- OS 6 PARES DE HISTÓRIA (12 Cartas) -----------
const pares = [
  { p: "Guerra do Paraguai", d: "Revolta militar e participação política" },
  { p: "Fim da escravidão", d: "Revolta da elite agrária" },
  { p: "Desafios na sucessão", d: "Dom Pedro II não teve filhos homens" },
  { p: "Pressão externa", d: "Inglaterra querendo a libertação de escravos" },
  { p: "Deodoro da Fonseca", d: "Líder do golpe militar de 15 de novembro" },
  { p: "Questão Religiosa", d: "Conflito entre a Igreja e Dom Pedro II" }
];

const tabuleiro = document.getElementById("tabuleiro");
const pontosSpan = document.getElementById("pontos");
const tempoSpan = document.getElementById("tempo");
const vitoriaDiv = document.getElementById("vitoria");
const mensagemVitoria = document.getElementById("mensagemVitoria");
const btnIniciar = document.getElementById("btnIniciar");
const btnReiniciar = document.getElementById("btnReiniciar");
const painel = document.getElementById("painel");
const entradaNome = document.getElementById("nomeJogador");
const btnConfirmarNome = document.getElementById("btnConfirmarNome");
const listaPlacar = document.getElementById("listaPlacar");
const placarDiv = document.getElementById("placar");
const orientacaoDiv = document.getElementById("orientacao");

let primeiraCarta = null;
let bloqueio = false;
let pontos = 0;
let tempo = 0;
let timer = null;
let jogoFinalizado = false;
let jogadorAtual = "";
const tempoLimite = 300; // 5 min

// ----------- Eventos Iniciais -----------
btnConfirmarNome.addEventListener("click", () => {
  const nome = entradaNome.value.trim();
  if (!nome) { alert("Escreva seu nome!"); return; }
  jogadorAtual = nome;
  document.querySelector(".entrada-nome").classList.add("hidden");
  painel.classList.remove("hidden");
});

btnIniciar.addEventListener("click", iniciarJogo);
btnReiniciar.addEventListener("click", iniciarJogo);

function iniciarJogo() {
  verificarOrientacao();
  
  btnIniciar.disabled = true;
  btnReiniciar.classList.add("hidden");
  tabuleiro.innerHTML = "";
  pontos = 0; tempo = 0; jogoFinalizado = false;
  pontosSpan.textContent = "0"; tempoSpan.textContent = "00:00";
  clearInterval(timer);
  vitoriaDiv.classList.add("hidden");
  placarDiv.classList.add("hidden");

  let cartas = [];
  pares.forEach(par => {
    cartas.push({ texto: par.p, id: par.p });
    cartas.push({ texto: par.d, id: par.p });
  });
  cartas.sort(() => 0.5 - Math.random()); // Embaralha

  cartas.forEach(carta => {
    const div = document.createElement("div");
    div.classList.add("carta");
    div.dataset.id = carta.id;

    const frente = document.createElement("span");
    frente.classList.add("frente");
    frente.textContent = carta.texto;

    const verso = document.createElement("span");
    verso.classList.add("verso");

    div.appendChild(frente);
    div.appendChild(verso);

    div.addEventListener("click", () => virarCarta(div));
    tabuleiro.appendChild(div);
  });

  // Mostra as cartas no começo por 3.5 segundos para memorização
  bloqueio = true;
  document.querySelectorAll(".carta").forEach(c => c.classList.add("virada"));
  
  setTimeout(() => {
    document.querySelectorAll(".carta").forEach(c => c.classList.remove("virada"));
    bloqueio = false;

    timer = setInterval(() => {
      tempo++; atualizarTempo();
      if (tempo >= tempoLimite) finalizarJogo(false);
    }, 1000);
  }, 3500); 
}

function virarCarta(div) {
  // Se está bloqueado ou já foi virada, ignora o clique
  if (bloqueio || div.classList.contains("virada") || div.classList.contains("par-encontrado")) return;

  div.classList.add("virada");

  if (!primeiraCarta) {
    primeiraCarta = div;
  } else {
    const segundaCarta = div;
    
    // Verificando se formou o par
    if (primeiraCarta.dataset.id === segundaCarta.dataset.id && primeiraCarta !== segundaCarta) {
      bloqueio = true; // Trava o tabuleiro para o jogador poder LER o texto
      
      primeiraCarta.classList.add("par-encontrado");
      segundaCarta.classList.add("par-encontrado");
      
      pontos++;
      pontosSpan.textContent = pontos;

      // O "tempinho virado pra conseguir ler" (3,5 segundos)
      setTimeout(() => {
        bloqueio = false; // Destrava o tabuleiro
        primeiraCarta = null;
        if (pontos === pares.length) finalizarJogo(true);
      }, 3500); 

    } else {
      // Errou, vira de volta rápido
      bloqueio = true;
      setTimeout(() => {
        primeiraCarta.classList.remove("virada");
        segundaCarta.classList.remove("virada");
        primeiraCarta = null;
        bloqueio = false;
      }, 1000);
    }
  }
}

function atualizarTempo() {
  let min = Math.floor(tempo / 60);
  let seg = tempo % 60;
  tempoSpan.textContent = (min < 10 ? "0" : "") + min + ":" + (seg < 10 ? "0" : "") + seg;
}

function finalizarJogo(venceu) {
  clearInterval(timer);
  jogoFinalizado = true;
  btnIniciar.disabled = false;
  btnReiniciar.classList.remove("hidden");
  vitoriaDiv.classList.remove("hidden");

  if (venceu) {
    mensagemVitoria.textContent = `🎉 Vitória histórica! Tempo: ${tempoSpan.textContent}`;
    salvarPlacarOnline(jogadorAtual, tempo);
  } else {
    mensagemVitoria.textContent = `⏰ O tempo acabou! A história não espera.`;
  }
  placarDiv.classList.remove("hidden");
  carregarPlacarOnline();
}

// Lógica de Banco de Dados mantida
function salvarPlacarOnline(nome, tempo) { db.ref("placar").push({ nome, tempo }); }

function carregarPlacarOnline() {
  db.ref("placar").once("value", snapshot => {
    const placar = snapshot.val() || {};
    const arrayPlacar = Object.values(placar).sort((a, b) => a.tempo - b.tempo);
    listaPlacar.innerHTML = "";
    
    arrayPlacar.slice(0, 5).forEach((p, i) => { // Mostra só os 5 melhores
      let li = document.createElement("li");
      let min = Math.floor(p.tempo / 60); let seg = p.tempo % 60;
      li.innerHTML = `<span>${i + 1}º ${p.nome}</span> <span>${(min < 10 ? "0" : "") + min}:${(seg < 10 ? "0" : "") + seg}</span>`;
      if (i === 0) li.classList.add("top1");
      listaPlacar.appendChild(li);
    });
  });
}

function verificarOrientacao() {
  if (window.innerHeight > window.innerWidth && window.innerWidth <= 768) {
    orientacaoDiv.style.display = "block";
  } else { orientacaoDiv.style.display = "none"; }
}
window.addEventListener("resize", verificarOrientacao);