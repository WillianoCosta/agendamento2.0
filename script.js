document.addEventListener('DOMContentLoaded', () => {
    const isClientPage = document.getElementById('appointmentForm');
    const isAdminPage = document.getElementById('appointmentsTable');

    if (isClientPage) {
        setupClientPage();
    } else if (isAdminPage) {
        setupAdminPage();
    }
});

// --- Variáveis Globais (para fins de exemplo, em um projeto real, seriam configuradas de forma mais segura) ---
// **IMPORTANTE:** Substitua este URL pelo URL do seu Google Apps Script Publicado como Aplicativo Web
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxcHU_aPRh_qm6jaQJwHcQu6SV17mwnRRBrtDqEApFITbjoYiCkkmTnrit6ANWjZRSdUw/exec'; 

// Preços dos serviços (usado para referência e cálculo)
const servicePrices = {
    "Progressiva": 200.00,
    "Escova": 50.00,
    "Luzes": 30.00,
    "Corte": 20.00
};

// Horários disponíveis para agendamento (exemplo)
const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
];

// --- Funções Comuns (podem ser usadas em ambas as páginas) ---

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`; // Adiciona a classe para styling (success/error)
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
        element.textContent = '';
    }, 5000); // Mensagem some após 5 segundos
}

// --- Lógica da Interface do Cliente (index.html) ---

function setupClientPage() {
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentDateInput = document.getElementById('appointmentDate');
    const appointmentTimeSelect = document.getElementById('appointmentTime');
    const formMessage = document.getElementById('formMessage');

    // Preencher horários disponíveis no select
    function populateTimes() {
        appointmentTimeSelect.innerHTML = '<option value="">Selecione um horário</option>';
        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            appointmentTimeSelect.appendChild(option);
        });
    }
    populateTimes(); // Chama ao carregar a página

    // Definir data mínima como hoje
    const today = new Date();
    const minDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    appointmentDateInput.min = minDate;
    appointmentDateInput.value = minDate; // Pré-seleciona a data de hoje

    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const clientName = document.getElementById('clientName').value;
        const whatsappNumber = document.getElementById('whatsappNumber').value;
        const serviceType = document.getElementById('serviceType').value;
        const appointmentDate = document.getElementById('appointmentDate').value;
        const appointmentTime = document.getElementById('appointmentTime').value;

        if (!clientName || !whatsappNumber || !serviceType || !appointmentDate || !appointmentTime) {
            showMessage('formMessage', 'Por favor, preencha todos os campos.', 'error');
            return;
        }

        const selectedServiceOption = document.querySelector(`#serviceType option[value="${serviceType}"]`);
        const servicePrice = parseFloat(selectedServiceOption.dataset.price);

        const appointmentData = {
            action: 'createAppointment', // Ação para o Apps Script
            clientName,
            whatsappNumber,
            serviceType,
            servicePrice,
            appointmentDate,
            appointmentTime,
            status: 'Pendente' // Status inicial
        };

        try {
            // ** Simulação de envio para Google Apps Script **
            // Em um ambiente real, você faria uma requisição POST para o URL do seu Apps Script
            // Ex: const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(appointmentData) });
            // const result = await response.json();

            // Aqui simulamos a resposta de sucesso
            const result = { success: true, message: 'Agendamento realizado com sucesso!' };

            if (result.success) {
                showMessage('formMessage', result.message, 'success');
                appointmentForm.reset();
                populateTimes(); // Reinicia horários, se necessário
                appointmentDateInput.value = minDate; // Reseta a data para hoje
            } else {
                showMessage('formMessage', result.message || 'Erro ao agendar. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro ao conectar com o serviço:', error);
            showMessage('formMessage', 'Ocorreu um erro na conexão. Tente novamente mais tarde.', 'error');
        }
    });
}

// --- Lógica da Interface do Cabeleireiro (admin.html) ---

async function setupAdminPage() {
    const appointmentsTableBody = document.querySelector('#appointmentsTable tbody');
    const totalAppointmentsSpan = document.getElementById('totalAppointments');
    const dailyRevenueSpan = document.getElementById('dailyRevenue');
    const appointmentDateFilter = document.getElementById('appointmentDateFilter');
    const refreshAppointmentsBtn = document.getElementById('refreshAppointments');
    const noAppointmentsMessage = document.getElementById('noAppointmentsMessage');

    // Definir data do filtro para hoje por padrão
    const today = new Date();
    const filterDate = today.toISOString().split('T')[0];
    appointmentDateFilter.value = filterDate;

    async function fetchAppointments(date) {
        appointmentsTableBody.innerHTML = ''; // Limpa a tabela antes de carregar
        noAppointmentsMessage.style.display = 'none';

        try {
            // ** Simulação de busca de agendamentos no Google Apps Script **
            // Em um ambiente real, você faria uma requisição GET para o URL do seu Apps Script
            // Ex: const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getAppointments&date=${date}`);
            // const data = await response.json();
            // const appointments = data.appointments; // Assumindo que o Apps Script retorna um objeto com uma chave 'appointments'

            // Dados simulados para teste
            const simulatedAppointments = [
                { id: '1', date: filterDate, time: '09:00', clientName: 'Ana Silva', whatsapp: '11987654321', service: 'Corte', value: 20.00, status: 'Atendido' },
                { id: '2', date: filterDate, time: '09:30', clientName: 'Bruno Costa', whatsapp: '11987654322', service: 'Escova', value: 50.00, status: 'Em Atendimento' },
                { id: '3', date: filterDate, time: '10:30', clientName: 'Carla Dias', whatsapp: '11987654323', service: 'Progressiva', value: 200.00, status: 'Pendente' },
                { id: '4', date: filterDate, time: '11:00', clientName: 'Daniel Rocha', whatsapp: '11987654324', service: 'Luzes', value: 30.00, status: 'Pendente' },
                { id: '5', date: filterDate, time: '14:00', clientName: 'Elaine Santos', whatsapp: '11987654325', service: 'Corte', value: 20.00, status: 'Cancelado' },
                { id: '6', date: '2025-06-24', time: '10:00', clientName: 'Fernando Lima', whatsapp: '11987654326', service: 'Escova', value: 50.00, status: 'Pendente' } // Exemplo para outro dia
            ].filter(appt => appt.date === date); // Filtra pela data selecionada

            const appointments = simulatedAppointments;

            if (appointments.length === 0) {
                noAppointmentsMessage.style.display = 'block';
                totalAppointmentsSpan.textContent = 0;
                dailyRevenueSpan.textContent = 'R$ 0,00';
                return;
            }

            let totalRevenue = 0;
            let confirmedAppointments = 0;

            appointments.sort((a, b) => a.time.localeCompare(b.time)); // Ordena por hora

            appointments.forEach(appt => {
                const row = appointmentsTableBody.insertRow();
                row.setAttribute('data-appointment-id', appt.id);
                row.classList.add(`status-${appt.status.toLowerCase().replace(/\s/g, '-')}`);

                row.innerHTML = `
                    <td>${appt.time}</td>
                    <td>${appt.clientName}</td>
                    <td><a href="https://wa.me/55${appt.whatsapp.replace(/\D/g, '')}" target="_blank">${appt.whatsapp} <i class="fab fa-whatsapp"></i></a></td>
                    <td>${appt.service}</td>
                    <td>R$ ${appt.value.toFixed(2).replace('.', ',')}</td>
                    <td><span class="status-tag status-${appt.status.toLowerCase().replace(/\s/g, '-')}">${appt.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${appt.status !== 'Em Atendimento' ? `<button class="btn-primary" data-action="inProgress" data-id="${appt.id}">Em Atendimento</button>` : ''}
                            ${appt.status !== 'Atendido' ? `<button class="btn-secondary" data-action="complete" data-id="${appt.id}">Atendido</button>` : ''}
                            ${appt.status !== 'Cancelado' ? `<button class="btn-secondary cancel-btn" data-action="cancel" data-id="${appt.id}"><i class="fas fa-times"></i> Cancelar</button>` : ''}
                        </div>
                    </td>
                `;

                if (appt.status !== 'Cancelado' && appt.status !== 'Atendido') { // Contar apenas agendamentos ativos para o total
                    confirmedAppointments++;
                    totalRevenue += appt.value;
                }
            });

            totalAppointmentsSpan.textContent = confirmedAppointments;
            dailyRevenueSpan.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;

        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            appointmentsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar agendamentos.</td></tr>';
            totalAppointmentsSpan.textContent = 0;
            dailyRevenueSpan.textContent = 'R$ 0,00';
        }
    }

    // Carregar agendamentos ao carregar a página
    fetchAppointments(filterDate);
    
    // Event Listeners para filtro e atualização
    appointmentDateFilter.addEventListener('change', (e) => {
        fetchAppointments(e.target.value);
    });

    refreshAppointmentsBtn.addEventListener('click', () => {
        fetchAppointments(appointmentDateFilter.value);
    });

    // Delegar eventos para botões de ação na tabela
    appointmentsTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;
        let newStatus = '';

        if (action === 'inProgress') {
            newStatus = 'Em Atendimento';
        } else if (action === 'complete') {
            newStatus = 'Atendido';
        } else if (action === 'cancel') {
            newStatus = 'Cancelado';
            if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
                return;
            }
        } else {
            return;
        }

        try {
            // ** Simulação de atualização de status no Google Apps Script **
            // Em um ambiente real, você faria uma requisição POST para o URL do seu Apps Script
            // Ex: const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            //    method: 'POST',
            //    body: JSON.stringify({
            //        action: 'updateAppointmentStatus',
            //        id: id,
            //        status: newStatus
            //    })
            // });
            // const result = await response.json();

            // Simulamos sucesso para teste
            const result = { success: true, message: `Status atualizado para ${newStatus}!` };

            if (result.success) {
                // Atualiza a linha na interface sem recarregar tudo
                const row = appointmentsTableBody.querySelector(`[data-appointment-id="${id}"]`);
                if (row) {
                    // Remove classes de status antigas
                    row.className = row.className.replace(/status-[a-z-]+/g, '');
                    // Adiciona a nova classe de status
                    row.classList.add(`status-${newStatus.toLowerCase().replace(/\s/g, '-')}`);
                    // Atualiza o texto do status na célula
                    row.querySelector('.status-tag').textContent = newStatus;
                    row.querySelector('.status-tag').className = `status-tag status-${newStatus.toLowerCase().replace(/\s/g, '-')}`;

                    // Remove botões de ação se o status for Atendido ou Cancelado, ou se já estiver em atendimento
                    const actionButtonsDiv = row.querySelector('.action-buttons');
                    actionButtonsDiv.innerHTML = '';
                    if (newStatus !== 'Em Atendimento') {
                         actionButtonsDiv.innerHTML += `<button class="btn-primary" data-action="inProgress" data-id="${id}">Em Atendimento</button>`;
                    }
                    if (newStatus !== 'Atendido') {
                        actionButtonsDiv.innerHTML += `<button class="btn-secondary" data-action="complete" data-id="${id}">Atendido</button>`;
                    }
                    if (newStatus !== 'Cancelado') {
                         actionButtonsDiv.innerHTML += `<button class="btn-secondary cancel-btn" data-action="cancel" data-id="${id}"><i class="fas fa-times"></i> Cancelar</button>`;
                    }
                    // Força a atualização do resumo (melhor seria o Apps Script retornar os totais atualizados)
                    fetchAppointments(appointmentDateFilter.value); 
                }
            } else {
                alert(result.message || 'Erro ao atualizar status.');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Ocorreu um erro ao tentar atualizar o status.');
        }
    });

    // Atualiza a lista a cada 60 segundos (para simular tempo real)
    // Em um sistema real, você pode usar WebSockets para atualizações instantâneas.
    setInterval(() => {
        fetchAppointments(appointmentDateFilter.value);
    }, 60000); // 60 segundos
}