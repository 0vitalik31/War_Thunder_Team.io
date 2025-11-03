// Оптимизированные данные
const initialPlayers = [
    { nickname: "TankMaster", name: "Алексей", type: "земля", vehicles: ["Т-72", "Т-90", "БМП-3"] },
    { nickname: "SkyHunter", name: "Дмитрий", type: "воздух", vehicles: ["МиГ-29", "Су-27", "Ка-52"] },
    { nickname: "UniversalSoldier", name: "Сергей", type: "универсал", vehicles: ["Т-80", "Ми-24", "БТР-80"] },
    { nickname: "GroundPounder", name: "Иван", type: "земля", vehicles: ["Т-14 Армата", "БМП-2", "САУ 2С19"] },
    { nickname: "AirDominator", name: "Михаил", type: "воздух", vehicles: ["Су-35", "МиГ-31", "Ту-160"] },
    { nickname: "AllRounder", name: "Андрей", type: "универсал", vehicles: ["Т-72", "Су-25", "БРДМ-2"] }
];

// Состояние приложения
const state = {
    players: [...initialPlayers],
    teams: [{ name: "Команда Альфа", players: [], commander: null, wins: 0, losses: 0 }],
    editingPlayer: null
};

// Кэш DOM элементов
const elements = {
    teamsContainer: document.getElementById('teamsContainer'),
    playerSelect: document.getElementById('playerSelect'),
    addPlayerToTeamBtn: document.getElementById('addPlayerToTeamBtn'),
    addTeamBtn: document.getElementById('addTeamBtn'),
    addPlayerBtn: document.getElementById('addPlayerBtn'),
    saveDataBtn: document.getElementById('saveDataBtn'),
    loadDataBtn: document.getElementById('loadDataBtn'),
    playerModal: document.getElementById('playerModal'),
    modalTitle: document.getElementById('modalTitle'),
    cancelPlayer: document.getElementById('cancelPlayer'),
    savePlayer: document.getElementById('savePlayer'),
    themeToggle: document.getElementById('themeToggle')
};

// Утилиты
const utils = {
    saveDataToJSON: () => {
        const jsonData = JSON.stringify(state.players, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'players_data.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    loadDataFromJSON: (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                state.players = JSON.parse(e.target.result);
                state.teams.forEach(team => {
                    team.players = [];
                    team.commander = null;
                });
                renderTeams();
                updatePlayerSelect();
            } catch (error) {
                alert('Ошибка при загрузке файла: ' + error.message);
            }
        };
        reader.readAsText(file);
    },

    toggleTheme: () => {
        document.body.classList.toggle('light-theme');
        elements.themeToggle.textContent = document.body.classList.contains('light-theme') ? '🌞' : '🌙';
    }
};

// Функции рендеринга
function renderTeams() {
    elements.teamsContainer.innerHTML = '';
    
    state.teams.forEach((team, teamIndex) => {
        const teamElement = document.createElement('div');
        teamElement.className = 'team';
        
        const teamHeader = document.createElement('div');
        teamHeader.className = 'team-header';
        
        // Создаем элемент для названия команды
        const teamTitle = document.createElement('div');
        teamTitle.className = 'team-title';
        teamTitle.textContent = team.name;
        teamTitle.title = 'Кликните для изменения названия';
        
        // Обработчик клика для редактирования названия
        teamTitle.addEventListener('click', () => {
            editTeamName(team, teamTitle);
        });
        
        const removeTeamBtn = document.createElement('button');
        removeTeamBtn.className = 'remove-team';
        removeTeamBtn.textContent = 'Удалить команду';
        removeTeamBtn.onclick = () => {
            if (state.teams.length > 1) {
                state.teams.splice(teamIndex, 1);
                renderTeams();
            } else {
                alert('Должна остаться хотя бы одна команда');
            }
        };
        
        teamHeader.appendChild(teamTitle);
        teamHeader.appendChild(removeTeamBtn);
        teamElement.appendChild(teamHeader);
        
        // Статистика команды
        const teamStats = document.createElement('div');
        teamStats.className = 'team-stats';
        
        const winsStat = document.createElement('div');
        winsStat.className = 'stat wins';
        winsStat.innerHTML = `Победы: ${team.wins} `;
        
        const winsPlusBtn = document.createElement('button');
        winsPlusBtn.className = 'stat-btn';
        winsPlusBtn.textContent = '+';
        winsPlusBtn.onclick = () => {
            team.wins++;
            renderTeams();
        };
        
        const winsMinusBtn = document.createElement('button');
        winsMinusBtn.className = 'stat-btn';
        winsMinusBtn.textContent = '-';
        winsMinusBtn.onclick = () => {
            if (team.wins > 0) team.wins--;
            renderTeams();
        };
        
        winsStat.appendChild(winsPlusBtn);
        winsStat.appendChild(winsMinusBtn);
        
        const lossesStat = document.createElement('div');
        lossesStat.className = 'stat losses';
        lossesStat.innerHTML = `Поражения: ${team.losses} `;
        
        const lossesPlusBtn = document.createElement('button');
        lossesPlusBtn.className = 'stat-btn';
        lossesPlusBtn.textContent = '+';
        lossesPlusBtn.onclick = () => {
            team.losses++;
            renderTeams();
        };
        
        const lossesMinusBtn = document.createElement('button');
        lossesMinusBtn.className = 'stat-btn';
        lossesMinusBtn.textContent = '-';
        lossesMinusBtn.onclick = () => {
            if (team.losses > 0) team.losses--;
            renderTeams();
        };
        
        lossesStat.appendChild(lossesPlusBtn);
        lossesStat.appendChild(lossesMinusBtn);
        
        teamStats.appendChild(winsStat);
        teamStats.appendChild(lossesStat);
        teamElement.appendChild(teamStats);
        
        const playerList = document.createElement('ul');
        playerList.className = 'player-list';
        
        // Сортируем игроков: командир всегда первый
        const sortedPlayers = [...team.players].sort((a, b) => b.commander - a.commander);
        
        sortedPlayers.forEach((player, playerIndex) => {
            const originalIndex = team.players.indexOf(player);
            const playerElement = document.createElement('li');
            playerElement.className = `player ${player.commander ? 'player-commander' : ''}`;
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            
            const playerNickname = document.createElement('div');
            playerNickname.className = 'player-nickname';
            playerNickname.textContent = player.nickname;
            
            const playerDetails = document.createElement('div');
            playerDetails.className = 'player-details';
            playerDetails.textContent = `${player.name} | `;
            
            const playerType = document.createElement('span');
            playerType.className = `player-type type-${player.type}`;
            playerType.textContent = player.type;
            
            playerDetails.appendChild(playerType);
            
            const playerVehicles = document.createElement('div');
            playerVehicles.className = 'player-vehicles';
            playerVehicles.textContent = `Техника: ${player.vehicles.join(', ')}`;
            
            playerInfo.appendChild(playerNickname);
            playerInfo.appendChild(playerDetails);
            playerInfo.appendChild(playerVehicles);
            
            const playerActions = document.createElement('div');
            playerActions.className = 'player-actions';
            
            if (!player.commander) {
                const setCommanderBtn = document.createElement('button');
                setCommanderBtn.className = 'set-commander';
                setCommanderBtn.textContent = 'Командир';
                setCommanderBtn.onclick = () => {
                    // Сбрасываем командира у всех игроков команды
                    team.players.forEach(p => p.commander = false);
                    // Устанавливаем нового командира
                    player.commander = true;
                    team.commander = player.nickname;
                    renderTeams();
                };
                playerActions.appendChild(setCommanderBtn);
            }
            
            const editPlayerBtn = document.createElement('button');
            editPlayerBtn.className = 'edit-player';
            editPlayerBtn.textContent = 'Изменить';
            editPlayerBtn.onclick = () => {
                openEditPlayerModal(player);
            };
            playerActions.appendChild(editPlayerBtn);
            
            const removePlayerBtn = document.createElement('button');
            removePlayerBtn.className = 'remove-player';
            removePlayerBtn.textContent = 'Удалить';
            removePlayerBtn.onclick = () => {
                team.players.splice(originalIndex, 1);
                if (player.commander) {
                    team.commander = null;
                }
                renderTeams();
                updatePlayerSelect();
            };
            playerActions.appendChild(removePlayerBtn);
            
            playerElement.appendChild(playerInfo);
            playerElement.appendChild(playerActions);
            playerList.appendChild(playerElement);
        });
        
        teamElement.appendChild(playerList);
        elements.teamsContainer.appendChild(teamElement);
    });
}

// Функция для редактирования названия команды
function editTeamName(team, titleElement) {
    const currentName = team.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'team-title-input';
    input.value = currentName;
    
    // Заменяем текст на поле ввода
    titleElement.parentNode.replaceChild(input, titleElement);
    input.focus();
    
    const saveName = () => {
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
            team.name = newName;
        }
        renderTeams();
    };
    
    input.addEventListener('blur', saveName);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveName();
        }
    });
}

function updatePlayerSelect() {
    elements.playerSelect.innerHTML = '<option value="">Выберите игрока для добавления в команду</option>';
    
    // Получаем список всех игроков, которые уже в командах
    const playersInTeams = state.teams.flatMap(team => team.players.map(player => player.nickname));
    
    state.players.forEach(player => {
        // Показываем только игроков, которых нет в командах
        if (!playersInTeams.includes(player.nickname)) {
            const option = document.createElement('option');
            option.value = player.nickname;
            option.textContent = `${player.nickname} (${player.name}) - ${player.type}`;
            elements.playerSelect.appendChild(option);
        }
    });
}

function openAddPlayerModal() {
    state.editingPlayer = null;
    elements.modalTitle.textContent = 'Добавить нового игрока';
    clearPlayerForm();
    elements.playerModal.style.display = 'flex';
}

function openEditPlayerModal(player) {
    state.editingPlayer = player;
    elements.modalTitle.textContent = 'Редактировать игрока';
    fillPlayerForm(player);
    elements.playerModal.style.display = 'flex';
}

function closePlayerModal() {
    elements.playerModal.style.display = 'none';
    state.editingPlayer = null;
}

function clearPlayerForm() {
    document.getElementById('playerNickname').value = '';
    document.getElementById('playerName').value = '';
    document.getElementById('playerType').value = 'земля';
    document.getElementById('playerVehicles').value = '';
}

function fillPlayerForm(player) {
    document.getElementById('playerNickname').value = player.nickname;
    document.getElementById('playerName').value = player.name;
    document.getElementById('playerType').value = player.type;
    document.getElementById('playerVehicles').value = player.vehicles.join(', ');
}

function savePlayerData() {
    const nickname = document.getElementById('playerNickname').value.trim();
    const name = document.getElementById('playerName').value.trim();
    const type = document.getElementById('playerType').value;
    const vehicles = document.getElementById('playerVehicles').value.split(',').map(v => v.trim()).filter(v => v);
    
    if (!nickname || !name) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    if (state.editingPlayer) {
        // Редактирование существующего игрока
        state.editingPlayer.nickname = nickname;
        state.editingPlayer.name = name;
        state.editingPlayer.type = type;
        state.editingPlayer.vehicles = vehicles;
        
        // Обновляем игрока во всех командах
        state.teams.forEach(team => {
            team.players.forEach(player => {
                if (player.nickname === state.editingPlayer.nickname) {
                    player.name = name;
                    player.type = type;
                    player.vehicles = vehicles;
                }
            });
        });
    } else {
        // Добавление нового игрока
        // Проверяем, нет ли уже игрока с таким никнеймом
        if (state.players.some(player => player.nickname === nickname)) {
            alert('Игрок с таким никнеймом уже существует');
            return;
        }
        
        state.players.push({
            nickname,
            name,
            type,
            vehicles
        });
    }
    
    // Закрываем модальное окно и обновляем интерфейс
    closePlayerModal();
    renderTeams();
    updatePlayerSelect();
}

function addTeam() {
    const teamName = `Команда ${String.fromCharCode(65 + state.teams.length)}`;
    state.teams.push({
        name: teamName,
        players: [],
        commander: null,
        wins: 0,
        losses: 0
    });
    renderTeams();
}

function addPlayerToTeam() {
    const selectedPlayerNickname = elements.playerSelect.value;
    if (!selectedPlayerNickname) {
        alert('Пожалуйста, выберите игрока');
        return;
    }
    
    // Находим выбранного игрока в данных
    const playerToAdd = state.players.find(player => player.nickname === selectedPlayerNickname);
    if (!playerToAdd) {
        alert('Игрок не найден');
        return;
    }
    
    // Находим команду с наименьшим количеством игроков
    let teamWithLeastPlayers = state.teams[0];
    for (const team of state.teams) {
        if (team.players.length < teamWithLeastPlayers.players.length) {
            teamWithLeastPlayers = team;
        }
    }
    
    // Проверяем, не превышает ли команда лимит в 8 игроков
    if (teamWithLeastPlayers.players.length >= 8) {
        alert('Все команды уже заполнены (максимум 8 игроков в команде)');
        return;
    }
    
    // Добавляем игрока в команду
    teamWithLeastPlayers.players.push({
        ...playerToAdd,
        commander: false
    });
    
    // Если это первый игрок в команде, делаем его командиром
    if (teamWithLeastPlayers.players.length === 1) {
        teamWithLeastPlayers.players[0].commander = true;
        teamWithLeastPlayers.commander = teamWithLeastPlayers.players[0].nickname;
    }
    
    // Обновляем интерфейс
    renderTeams();
    updatePlayerSelect();
}

// Инициализация событий
function initEvents() {
    elements.addTeamBtn.addEventListener('click', addTeam);
    elements.addPlayerBtn.addEventListener('click', openAddPlayerModal);
    elements.cancelPlayer.addEventListener('click', closePlayerModal);
    elements.savePlayer.addEventListener('click', savePlayerData);
    elements.addPlayerToTeamBtn.addEventListener('click', addPlayerToTeam);
    elements.saveDataBtn.addEventListener('click', utils.saveDataToJSON);
    elements.loadDataBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = utils.loadDataFromJSON;
        input.click();
    });
    elements.themeToggle.addEventListener('click', utils.toggleTheme);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    renderTeams();
    updatePlayerSelect();
});
