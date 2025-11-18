// URL do Google Apps Script - SUBSTITUA PELA SUA URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaT2lycz8adBUA5thX9oN7XPTtP8qDqQJ31YYVMIIeJamdo6gu4VhC40npAGrMMz375g/exec';

// Mostrar seção específica
function mostrarSecao(secao) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(secao).style.display = 'block';
}

// Função para exibir mensagens de erro detalhadas
function exibirErro(elementoId, mensagem, detalhes) {
  const elemento = document.getElementById(elementoId);
  let html = `<div class="mensagem erro">${mensagem}</div>`;
  
  if (detalhes) {
    html += `<div class="detalhes-erro">Detalhes: ${detalhes}</div>`;
  }
  
  elemento.innerHTML = html;
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
    const divMensagem = document.getElementById('mensagemPedido');
    if (data.success) {
      divMensagem.innerHTML = `<div class="mensagem sucesso">Pedido realizado com sucesso! Número do pedido: ${data.numPedido}</div>`;
      this.reset();
    } else {
      exibirErro('mensagemPedido', 'Erro ao realizar pedido', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirErro('mensagemPedido', 'Erro na comunicação com o servidor', error.message);
  });
});

// Consultar pedido
document.getElementById('formConsultar').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  formData.append('action', 'consultarPedido');
  
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
      if (data.pedidos.length > 0) {
        let html = '<h3>Seus Pedidos:</h3>';
        data.pedidos.forEach(pedido => {
          html += `
            <div class="pedido-item">
              <p><strong>Número do Pedido:</strong> ${pedido.numPedido}</p>
              <p><strong>Data:</strong> ${new Date(pedido.data).toLocaleString()}</p>
              <p><strong>Nome:</strong> ${pedido.nome}</p>
              <p><strong>Local:</strong> ${pedido.local}</p>
              <p><strong>Setor/Cidade:</strong> ${pedido.setor}</p>
              <p><strong>Status:</strong> ${pedido.status}</p>
            </div>
          `;
        });
        divResultado.innerHTML = html;
      } else {
        divResultado.innerHTML = '<div class="mensagem erro">Nenhum pedido encontrado para este e-mail.</div>';
      }
    } else {
      exibirErro('resultadoConsulta', 'Erro ao consultar pedidos', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirErro('resultadoConsulta', 'Erro na comunicação com o servidor', error.message);
  });
});

// Login admin
document.getElementById('formLogin').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  formData.append('action', 'loginAdmin');
  
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
    const divMensagem = document.getElementById('mensagemLogin');
    if (data.success) {
      document.getElementById('loginAdmin').style.display = 'none';
      document.getElementById('painelAdmin').style.display = 'block';
      carregarPedidos();
    } else {
      exibirErro('mensagemLogin', 'Erro ao fazer login', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirErro('mensagemLogin', 'Erro na comunicação com o servidor', error.message);
  });
});

// Carregar pedidos no painel admin
function carregarPedidos() {
  const formData = new FormData();
  formData.append('action', 'listarPedidos');
  
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
    const divLista = document.getElementById('listaPedidos');
    if (data.success) {
      if (data.pedidos.length > 0) {
        let html = '<h3>Lista de Pedidos:</h3>';
        data.pedidos.forEach(pedido => {
          const statusClass = `status-${pedido.status.toLowerCase()}`;
          html += `
            <div class="pedido-item ${statusClass}">
              <p><strong>Número do Pedido:</strong> ${pedido.numPedido}</p>
              <p><strong>Data:</strong> ${new Date(pedido.data).toLocaleString()}</p>
              <p><strong>Nome:</strong> ${pedido.nome}</p>
              <p><strong>Local:</strong> ${pedido.local}</p>
              <p><strong>Setor/Cidade:</strong> ${pedido.setor}</p>
              <p><strong>E-mail:</strong> ${pedido.email}</p>
              <p><strong>Status:</strong> ${pedido.status}</p>
              
              <h4>Infantis:</h4>
              <ul>
                ${Object.entries(pedido.infantil).map(([tamanho, qtd]) => 
                  `<li>${tamanho}: ${qtd}</li>`
                ).join('')}
              </ul>
              
              <h4>Babylook:</h4>
              <ul>
                ${Object.entries(pedido.babylook).map(([tamanho, qtd]) => 
                  `<li>${tamanho}: ${qtd}</li>`
                ).join('')}
              </ul>
              
              <h4>Unissex:</h4>
              <ul>
                ${Object.entries(pedido.unissex).map(([tamanho, qtd]) => 
                  `<li>${tamanho}: ${qtd}</li>`
                ).join('')}
              </ul>
              
              <div class="admin-actions">
                ${pedido.status === 'Pendente' ? `
                  <button class="btn-aprovar" onclick="atualizarStatus(${pedido.numPedido}, 'Aprovado')">Aprovar</button>
                  <button class="btn-rejeitar" onclick="atualizarStatus(${pedido.numPedido}, 'Rejeitado')">Rejeitar</button>
                ` : ''}
              </div>
            </div>
          `;
        });
        divLista.innerHTML = html;
      } else {
        divLista.innerHTML = '<div class="mensagem erro">Nenhum pedido encontrado.</div>';
      }
    } else {
      exibirErro('listaPedidos', 'Erro ao carregar pedidos', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirErro('listaPedidos', 'Erro na comunicação com o servidor', error.message);
  });
}

// Atualizar status do pedido
function atualizarStatus(numPedido, status) {
  const formData = new FormData();
  formData.append('action', 'atualizarStatus');
  formData.append('numPedido', numPedido);
  formData.append('status', status);
  
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
      carregarPedidos();
    } else {
      alert('Erro ao atualizar status: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro na comunicação com o servidor: ' + error.message);
  });
}
