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

// ----------- Variáveis do jogo -----------
const pares = [
  { palavra: "eu", tipo: "Pronome pessoal - 1ª pessoa singular" },
  { palavra: "ele", tipo: "Pronome pessoal - 3ª pessoa singular" },
  { palavra: "nós", tipo: "Pronome pessoal - 1ª pessoa plural" },
  { palavra: "meu", tipo: "Pronome possessivo - 1ª pessoa singular" },
  { palavra: "seu", tipo: "Pronome possessivo - 3ª pessoa singular" },
  { palavra: "este", tipo: "Pronome demonstrativo - proximidade" },
  { palavra: "aquele", tipo: "Pronome demonstrativo - longe" },
  { palavra: "quem", tipo: "Pronome interrogativo" },
  { palavra: "que", tipo: "Pronome relativo" }
];

const tabuleiro = document.getElementById("tabuleiro");
const pontosSpan = document.getElementById("pontos");
const tempoSpan = document.getElementById("tempo");
const vitoriaDiv = document.getElementById("vitoria");
const mensagemVitoria = document.getElementById("mensagemVitoria");
const btnIniciar = document.getElementById("btnIniciar");
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

btnConfirmarNome.addEventListener("click", () => {
  const nome = entradaNome.value.trim();
  if (!nome) { alert("Digite seu nome para jogar!"); return; }
  jogadorAtual = nome;
  document.querySelector(".entrada-nome").classList.add("hidden");
  painel.classList.remove("hidden");
});

btnIniciar.addEventListener("click", () => {
  if (!jogoFinalizado && !btnIniciar.disabled) iniciarJogo();
});

function iniciarJogo() {
  if (window.innerHeight > window.innerWidth) {
    orientacaoDiv.textContent = "📱 Por favor, vire seu celular para horizontal para jogar!";
    orientacaoDiv.classList.add("show");
    return;
  } else { orientacaoDiv.classList.remove("show"); }

  btnIniciar.disabled = true;
  tabuleiro.innerHTML = "";
  pontos = 0;
  tempo = 0;
  pontosSpan.textContent = "0";
  tempoSpan.textContent = "00:00";
  clearInterval(timer);
  vitoriaDiv.classList.remove("show");
  placarDiv.classList.add("hidden");

  let cartas = [];
  pares.forEach(par => {
    cartas.push({ texto: par.palavra, id: par.palavra });
    cartas.push({ texto: par.tipo, id: par.palavra });
  });
  cartas.sort(() => 0.5 - Math.random());

  cartas.forEach(carta => {
    const div = document.createElement("div");
    div.classList.add("carta");
    div.dataset.id = carta.id;

    const frente = document.createElement("span");
    frente.classList.add("frente");
    frente.textContent = carta.texto;

    const verso = document.createElement("span");
    verso.classList.add("verso");
    verso.textContent = "?";

    div.appendChild(frente);
    div.appendChild(verso);

    div.addEventListener("click", () => virarCarta(div));
    tabuleiro.appendChild(div);
  });

  bloqueio = true;
  document.querySelectorAll(".carta").forEach(c => c.classList.add("virada"));
  setTimeout(() => {
    document.querySelectorAll(".carta").forEach(c => c.classList.remove("virada"));
    bloqueio = false;

    timer = setInterval(() => {
      tempo++;
      atualizarTempo();
      if (tempo >= tempoLimite) finalizarJogo(false);
    }, 1000);
  }, 4000);
}

function virarCarta(div) {
  if (bloqueio || div.classList.contains("virada") || div.classList.contains("acertou")) return;

  div.classList.add("virada");

  if (!primeiraCarta) {
    primeiraCarta = div;
  } else {
    const segundaCarta = div;
    if (primeiraCarta.dataset.id === segundaCarta.dataset.id && primeiraCarta !== segundaCarta) {
      primeiraCarta.classList.add("acertou", "animar-acerto");
      segundaCarta.classList.add("acertou", "animar-acerto");
      pontos++;
      pontosSpan.textContent = pontos;

      if (pontos === pares.length) finalizarJogo(true);
      primeiraCarta = null;
    } else {
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
  let minutos = Math.floor(tempo / 60);
  let segundos = tempo % 60;
  tempoSpan.textContent =
    (minutos < 10 ? "0" : "") + minutos + ":" + (segundos < 10 ? "0" : "") + segundos;
}

function finalizarJogo(venceu) {
  clearInterval(timer);
  jogoFinalizado = true;
  btnIniciar.disabled = true;

  if (venceu) {
    mensagemVitoria.textContent = `🎉 Parabéns, ${jogadorAtual}! Você fez ${pontos} pontos em ${tempoSpan.textContent}`;
    salvarPlacarOnline(jogadorAtual, tempo);
  } else {
    mensagemVitoria.textContent = `⏰ Tempo esgotado, ${jogadorAtual}!`;
  }
  vitoriaDiv.classList.add("show");
  placarDiv.classList.remove("hidden");
  carregarPlacarOnline();
}

function salvarPlacarOnline(nome, tempo) {
  db.ref("placar").push({ nome, tempo });
}

function carregarPlacarOnline() {
  db.ref("placar").on("value", snapshot => {
    const placar = snapshot.val() || {};
    const arrayPlacar = Object.values(placar).sort((a, b) => a.tempo - b.tempo);
    listaPlacar.innerHTML = "";
    arrayPlacar.forEach((p, i) => {
      let li = document.createElement("li");
      let minutos = Math.floor(p.tempo / 60);
      let segundos = p.tempo % 60;
      li.textContent = `${p.nome} - ${(minutos < 10 ? "0" : "") + minutos}:${(segundos < 10 ? "0" : "") + segundos}`;
      if (i === 0) li.classList.add("top1");
      if (i === 1) li.classList.add("top2");
      if (i === 2) li.classList.add("top3");
      listaPlacar.appendChild(li);
    });
  });
}

window.addEventListener("resize", () => {
  if (window.innerHeight > window.innerWidth && !jogoFinalizado) {
    orientacaoDiv.textContent = "📱 Por favor, vire seu celular para horizontal para jogar!";
    orientacaoDiv.classList.add("show");
  } else { orientacaoDiv.classList.remove("show"); }
});
