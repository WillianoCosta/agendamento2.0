document.addEventListener('DOMContentLoaded', () => {
    const isClientPage = document.getElementById('appointmentForm');
    const isAdminPage = document.getElementById('appointmentsTable');

    if (isClientPage) {
        setupClientPage();
    } else if (isAdminPage) {
        setupAdminPage();
    }
});

// --- Variáveis Globais ---
// **IMPORTANTE:** Este URL deve ser o do seu Google Apps Script Publicado como Aplicativo Web
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

// --- Funções Comuns ---
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
        element.textContent = '';
    }, 5000);
}

// --- Lógica da Interface do Cliente (index.html) ---
function setupClientPage() {
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentDateInput = document.getElementById('appointmentDate');
    const appointmentTimeSelect = document.getElementById('appointmentTime');
    const formMessage = document.getElementById('formMessage');

    function populateTimes() {
        appointmentTimeSelect.innerHTML = '<option value="">Selecione um horário</option>';
        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            appointmentTimeSelect.appendChild(option);
        });
    }
    populateTimes();

    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    appointmentDateInput.min = minDate;
    appointmentDateInput.value = minDate;

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
            action: 'createAppointment',
            clientName,
            whatsappNumber,
            serviceType,
            servicePrice,
            appointmentDate,
            appointmentTime,
            status: 'Pendente'
        };

        try {
            // CÓDIGO REAL DE ENVIO PARA O GOOGLE APPS SCRIPT
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(appointmentData) 
            });
            const result = await response.json();

            if (result.success) {
                showMessage('formMessage', result.message, 'success');
                appointmentForm.reset();
                populateTimes();
                appointmentDateInput.value = minDate;
            } else {
                showMessage('formMessage', result.message || 'Erro ao agendar. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro ao conectar com o serviço:', error);
            showMessage('formMessage', 'Ocorreu um erro na conexão. Tente novamente mais tarde. Verifique o console para mais detalhes.', 'error');
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

    const today = new Date();
    const filterDate = today.toISOString().split('T')[0];
    appointmentDateFilter.value = filterDate;

    async function fetchAppointments(date) {
        appointmentsTableBody.innerHTML = '';
        noAppointmentsMessage.style.display = 'none';

        try {
            // CÓDIGO REAL DE BUSCA DE AGENDAMENTOS NO GOOGLE APPS SCRIPT
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getAppointments&date=${date}`);
            const data = await response.json();
            const appointments = data.appointments; 

            if (!appointments || appointments.length === 0) { 
                noAppointmentsMessage.style.display = 'block';
                totalAppointmentsSpan.textContent = 0;
                dailyRevenueSpan.textContent = 'R$ 0,00';
                return;
            }

            let totalRevenue = 0;
            let confirmedAppointments = 0;

            appointments.sort((a, b) => {
                const dateTimeA = `${a.Data} ${a.Hora}`;
                const dateTimeB = `${b.Data} ${b.Hora}`;
                return dateTimeA.localeCompare(dateTimeB);
            });

            appointments.forEach(appt => {
                const row = appointmentsTableBody.insertRow();
                row.setAttribute('data-appointment-id', appt.ID_Agendamento); 
                row.classList.add(`status-${appt.Status.toLowerCase().replace(/\s/g, '-')}`);

                row.innerHTML = `
                    <td>${appt.Hora}</td>
                    <td>${appt.Nome_Cliente}</td>
                    <td><a href="https://wa.me/55${appt.WhatsApp.replace(/\D/g, '')}" target="_blank">${appt.WhatsApp} <i class="fab fa-whatsapp"></i></a></td>
                    <td>${appt.Servico}</td>
                    <td>R$ ${appt.Valor_Servico.toFixed(2).replace('.', ',')}</td>
                    <td><span class="status-tag status-${appt.Status.toLowerCase().replace(/\s/g, '-')}">${appt.Status}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${appt.Status !== 'Em Atendimento' ? `<button class="btn-primary" data-action="inProgress" data-id="${appt.ID_Agendamento}">Em Atendimento</button>` : ''}
                            ${appt.Status !== 'Atendido' ? `<button class="btn-secondary" data-action="complete" data-id="${appt.ID_Agendamento}">Atendido</button>` : ''}
                            ${appt.Status !== 'Cancelado' ? `<button class="btn-secondary cancel-btn" data-action="cancel" data-id="${appt.ID_Agendamento}"><i class="fas fa-times"></i> Cancelar</button>` : ''}
                        </div>
                    </td>
                `;

                if (appt.Status !== 'Cancelado' && appt.Status !== 'Atendido') {
                    confirmedAppointments++;
                    totalRevenue += appt.Valor_Servico;
                }
            });

            totalAppointmentsSpan.textContent = confirmedAppointments;
            dailyRevenueSpan.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;

        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            appointmentsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar agendamentos. Verifique o console (F12).</td></tr>';
            noAppointmentsMessage.style.display = 'none'; 
            totalAppointmentsSpan.textContent = 0;
            dailyRevenueSpan.textContent = 'R$ 0,00';
        }
    }

    fetchAppointments(filterDate);
    
    appointmentDateFilter.addEventListener('change', (e) => {
        fetchAppointments(e.target.value);
    });

    refreshAppointmentsBtn.addEventListener('click', () => {
        fetchAppointments(appointmentDateFilter.value);
    });

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
            // CÓDIGO REAL DE ATUALIZAÇÃO DE STATUS NO GOOGLE APPS SCRIPT
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   action: 'updateAppointmentStatus',
                   id: id,
                   status: newStatus
               })
            });
            const result = await response.json();

            if (result.success) {
                // Se a atualização foi bem-sucedida, recarrega os agendamentos para refletir as mudanças
                fetchAppointments(appointmentDateFilter.value); 
            } else {
                alert(result.message || 'Erro ao atualizar status.');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Ocorreu um erro ao tentar atualizar o status. Verifique o console para mais detalhes.');
        }
    });

    setInterval(() => {
        fetchAppointments(appointmentDateFilter.value);
    }, 60000);
}
