// URL do Google Apps Script - SUBSTITUA PELA SUA URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx82zfVu54YravUjot_qh8QNofLfoyVDJ-bSczYd_2g0upErfxwX26Dljj6dZ_1gg7X/exec';

// Mostrar seção específica
function mostrarSecao(secao) {
  // Remover classe active de todas as seções e botões
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  // Adicionar classe active à seção e botão selecionados
  document.getElementById(secao).classList.add('active');
  event.target.closest('.nav-btn').classList.add('active');
}

// Mostrar seção específica do admin
function mostrarAdminSecao(secao) {
  // Remover classe active de todas as seções e botões
  document.querySelectorAll('.admin-section').forEach(s => {
    s.classList.remove('active');
  });
  
  document.querySelectorAll('.admin-menu-btn').forEach(b => b.classList.remove('active'));
  
  // Adicionar classe active à seção e botão selecionados
  const secaoElement = document.getElementById(`admin-${secao}`);
  secaoElement.classList.add('active');
  
  event.target.closest('.admin-menu-btn').classList.add('active');
  
  // Carregar dados da seção
  if (secao === 'dashboard') {
    carregarDashboard();
  } else if (secao === 'pedidos') {
    carregarPedidos();
  }
}

// Função para exibir mensagens
function exibirMensagem(elementoId, tipo, mensagem) {
  const elemento = document.getElementById(elementoId);
  const icone = tipo === 'sucesso' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  
  elemento.innerHTML = `
    <div class="mensagem ${tipo}">
      <i class="${icone}"></i>
      ${mensagem}
    </div>
  `;
  
  // Auto-remover após 5 segundos
  setTimeout(() => {
    elemento.innerHTML = '';
  }, 5000);
}

// Enviar pedido
document.getElementById('formPedido').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  formData.append('action', 'novoPedido');
  
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      exibirMensagem('mensagemPedido', 'sucesso', `Pedido realizado com sucesso! Número do pedido: ${data.numPedido}`);
      this.reset();
      
      // Resetar campos de quantidade
      document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.name.includes('infantil_') || input.name.includes('babylook_') || input.name.includes('unissex_')) {
          input.value = 0;
        }
      });
    } else {
      exibirMensagem('mensagemPedido', 'erro', `Erro ao realizar pedido: ${data.error}`);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirMensagem('mensagemPedido', 'erro', 'Erro na comunicação com o servidor');
  });
});

// Consultar pedido por ID
document.getElementById('formConsultar').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  formData.append('action', 'consultarPedidoPorId');
  
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const divResultado = document.getElementById('resultadoConsulta');
    
    if (data.success) {
      const pedido = data.pedido;
      const statusClass = `status-${pedido.status.toLowerCase()}`;
      
      let html = `
        <div class="pedido-item">
          <div class="pedido-header">
            <div class="pedido-numero">#${pedido.numPedido}</div>
            <div class="pedido-status ${statusClass}">${pedido.status}</div>
          </div>
          
          <div class="pedido-info">
            <p><i class="fas fa-calendar"></i> <strong>Data:</strong> ${new Date(pedido.data).toLocaleString()}</p>
            <p><i class="fas fa-user"></i> <strong>Nome:</strong> ${pedido.nome}</p>
            <p><i class="fas fa-map-marker-alt"></i> <strong>Local:</strong> ${pedido.local}</p>
            <p><i class="fas fa-building"></i> <strong>Setor:</strong> ${pedido.setor}</p>
            <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${pedido.email}</p>
          </div>
          
          <div class="pedido-tamanhos">
            <div class="tipo-tamanhos">
              <h4><i class="fas fa-child"></i> Infantis</h4>
              <ul>
                ${Object.entries(pedido.infantil).map(([tamanho, qtd]) => 
                  qtd > 0 ? `<li>${tamanho}: ${qtd}</li>` : ''
                ).join('')}
              </ul>
            </div>
            
            <div class="tipo-tamanhos">
              <h4><i class="fas fa-female"></i> Babylook</h4>
              <ul>
                ${Object.entries(pedido.babylook).map(([tamanho, qtd]) => 
                  qtd > 0 ? `<li>${tamanho}: ${qtd}</li>` : ''
                ).join('')}
              </ul>
            </div>
            
            <div class="tipo-tamanhos">
              <h4><i class="fas fa-tshirt"></i> Unissex</h4>
              <ul>
                ${Object.entries(pedido.unissex).map(([tamanho, qtd]) => 
                  qtd > 0 ? `<li>${tamanho}: ${qtd}</li>` : ''
                ).join('')}
              </ul>
            </div>
          </div>
          
          <div class="admin-actions">
            <button class="btn-editar" onclick="mostrarFormularioEdicao('${pedido.numPedido}')">
              <i class="fas fa-edit"></i> Editar
            </button>
          </div>
        </div>
      `;
      
      html += `<div id="form-edicao-${pedido.numPedido}"></div>`;
      
      divResultado.innerHTML = html;
    } else {
      exibirMensagem('resultadoConsulta', 'erro', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirMensagem('resultadoConsulta', 'erro', 'Erro na comunicação com o servidor');
  });
});

// Mostrar formulário de edição
function mostrarFormularioEdicao(numPedido) {
  const formContainer = document.getElementById(`form-edicao-${numPedido}`);
  
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: new FormData().append('action', 'consultarPedidoPorId').append('numPedido', numPedido)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const pedido = data.pedido;
      
      let html = `
        <div class="edit-form">
          <h3><i class="fas fa-edit"></i
