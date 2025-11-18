// URL do Google Apps Script - SUBSTITUA PELA SUA URL
const SCRIPT_URL = 'https://script.google.com/macros/s/SEU_ID_AQUI/exec';

// Mostrar seção específica
function mostrarSecao(secao) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(secao).style.display = 'block';
}

// Mostrar seção específica do admin
function mostrarAdminSecao(secao) {
  document.querySelectorAll('.admin-section').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  
  document.querySelectorAll('.admin-menu button').forEach(b => b.classList.remove('active'));
  
  const secaoElement = document.getElementById(`admin-${secao}`);
  secaoElement.style.display = 'block';
  secaoElement.classList.add('active');
  
  event.target.classList.add('active');
  
  if (secao === 'dashboard') {
    carregarDashboard();
  } else if (secao === 'pedidos') {
    carregarPedidos();
  }
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
      let html = `
        <div class="pedido-item status-${pedido.status.toLowerCase()}">
          <h3>Pedido #${pedido.numPedido}</h3>
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
            <button class="btn-editar" onclick="mostrarFormularioEdicao('${pedido.numPedido}')">Editar Pedido</button>
          </div>
        </div>
      `;
      
      html += `<div id="form-edicao-${pedido.numPedido}"></div>`;
      
      divResultado.innerHTML = html;
    } else {
      exibirErro('resultadoConsulta', 'Erro ao consultar pedido', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirErro('resultadoConsulta', 'Erro na comunicação com o servidor', error.message);
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
          <h3>Editar Pedido #${numPedido}</h3>
          <form id="formEditarPedido">
            <input type="hidden" name="numPedido" value="${numPedido}">
            
            <div class="form-group">
              <label for="edit-nome">Nome do Líder/Coordenador:</label>
              <input type="text" id="edit-nome" name="nome" value="${pedido.nome}" required>
            </div>
            
            <div class="form-group">
              <label>Você é do interior ou capital?</label>
              <div>
                <input type="radio" id="edit-capital" name="local" value="Capital" ${pedido.local === 'Capital' ? 'checked' : ''} required>
                <label for="edit-capital">Capital</label>
                <input type="radio" id="edit-interior" name="local" value="Interior" ${pedido.local === 'Interior' ? 'checked' : ''} required>
                <label for="edit-interior">Interior</label>
              </div>
            </div>
            
            <div class="form-group">
              <label for="edit-setor">Setor/Cidade:</label>
              <input type="text" id="edit-setor" name="setor" value="${pedido.setor}" required>
            </div>
            
            <div class="form-group">
              <label for="edit-email">E-mail:</label>
              <input type="email" id="edit-email" name="email" value="${pedido.email}" required>
            </div>
            
            <div class="form-group">
              <h3>Pedidos Infantis</h3>
              <div class="tamanho-group">
                ${['1', '2', '4', '6', '8', '10', '12', '14'].map(tamanho => `
                  <div class="tamanho-item">
                    <label for="edit-infantil_${tamanho}">Tamanho ${tamanho}:</label>
                    <input type="number" id="edit-infantil_${tamanho}" name="infantil_${tamanho}" min="0" value="${pedido.infantil[tamanho] || 0}">
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="form-group">
              <h3>Adultos Babylook</h3>
              <div class="tamanho-group">
                ${['PP', 'P', 'M', 'G', 'GG', 'XGG'].map(tamanho => `
                  <div class="tamanho-item">
                    <label for="edit-babylook_${tamanho}">${tamanho}:</label>
                    <input type="number" id="edit-babylook_${tamanho}" name="babylook_${tamanho}" min="0" value="${pedido.babylook[tamanho] || 0}">
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="form-group">
              <h3>Adultos Unissex</h3>
              <div class="tamanho-group">
                ${['PP', 'P', 'M', 'G', 'GG', 'XGG'].map(tamanho => `
                  <div class="tamanho-item">
                    <label for="edit-unissex_${tamanho}">${tamanho}:</label>
                    <input type="number" id="edit-unissex_${tamanho}" name="unissex_${tamanho}" min="0" value="${pedido.unissex[tamanho] || 0}">
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit">Salvar Alterações</button>
              <button type="button" onclick="cancelarEdicao('${numPedido}')">Cancelar</button>
            </div>
          </form>
        </div>
      `;
      
      formContainer.innerHTML = html;
      
      // Adicionar evento de submit ao formulário
      document.getElementById('formEditarPedido').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        formData.append('action', 'editarPedido');
        
        fetch(SCRIPT_URL, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Pedido atualizado com sucesso!');
            // Recarregar a consulta
            document.getElementById('formConsultar').dispatchEvent(new Event('submit'));
          } else {
            alert('Erro ao atualizar pedido: ' + data.error);
          }
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('Erro na comunicação com o servidor: ' + error.message);
        });
      });
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao carregar dados do pedido: ' + error.message);
  });
}

// Cancelar edição
function cancelarEdicao(numPedido) {
  document.getElementById(`form-edicao-${numPedido}`).innerHTML = '';
}

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
      mostrarAdminSecao('dashboard');
    } else {
      exibirErro('mensagemLogin', 'Erro ao fazer login', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirErro('mensagemLogin', 'Erro na comunicação com o servidor', error.message);
  });
});

// Carregar dados do dashboard
function carregarDashboard() {
  const formData = new FormData();
  formData.append('action', 'getDashboardData');
  
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
      const dashboard = data.dashboard;
      
      document.getElementById('totalPedidos').textContent = dashboard.totalPedidos;
      document.getElementById('totalCamisetas').textContent = dashboard.totalCamisetas;
      document.getElementById('pedidosPendentes').textContent = dashboard.pedidosPendentes;
      document.getElementById('pedidosAprovados').textContent = dashboard.pedidosAprovados;
      document.getElementById('totalInfantis').textContent = dashboard.totalInfantis;
      document.getElementById('totalBabylook').textContent = dashboard.totalBabylook;
      document.getElementById('totalUnissex').textContent = dashboard.totalUnissex;
      document.getElementById('pedidosRejeitados').textContent = dashboard.pedidosRejeitados;
    } else {
      exibirErro('listaPedidos', 'Erro ao carregar dashboard', data.error);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    exibirErro('listaPedidos', 'Erro na comunicação com o servidor', error.message);
  });
}

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
        let html = '';
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
                  <button class="btn-aprovar" onclick="atualizarStatus('${pedido.numPedido}', 'Aprovado')">Aprovar</button>
                  <button class="btn-rejeitar" onclick="atualizarStatus('${pedido.numPedido}', 'Rejeitado')">Rejeitar</button>
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
