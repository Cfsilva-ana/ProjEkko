// Unity Dashboard JavaScript - Modular
const UnityDashboard = {
    baseUrl: "http://127.0.0.1:8002",
    currentUnityId: null,
    currentUserData: null,

    // Inicialização
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuthentication();
        });
    },

    // Autenticação Unity
    checkAuthentication() {
        const urlParams = new URLSearchParams(window.location.search);
        const unityIdParam = urlParams.get('unityId');
        const storedUnityId = localStorage.getItem('unityId');
        
        if (unityIdParam) {
            this.currentUnityId = unityIdParam;
            localStorage.setItem('unityId', unityIdParam);
            setTimeout(() => this.loadUnityProfile(unityIdParam), 500);
        } else if (storedUnityId) {
            this.currentUnityId = storedUnityId;
            setTimeout(() => this.loadUnityProfile(storedUnityId), 500);
        } else {
            window.location.href = 'login.html';
        }
    },

    // Logout Unity
    logout() {
        localStorage.removeItem('unityId');
        localStorage.removeItem('unityUser');
        window.location.href = 'login.html';
    },

    // Carregar perfil Unity
    async loadUnityProfile(unityId) {
        if (!unityId) return;

        this.showLoading('dashboard-content', 'Carregando dados Unity...');
        this.showLoading('profile-content', 'Carregando perfil Unity...');
        this.showLoading('ai-content', 'Carregando análise IA...');
        this.showLoading('heatmap-content', 'Carregando estatísticas...');
        this.showLoading('readings-content', 'Carregando Unity...');
        this.showLoading('monitoring-content', 'Carregando monitoramento...');

        try {
            const response = await fetch(`${this.baseUrl}/unity/dashboard/${unityId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.profile) {
                throw new Error('Dados Unity inválidos');
            }

            this.currentUserData = data;
            this.showNavigation();
            
            this.loadDashboardContent(data);
            this.loadProfileContent(data);
            this.loadReadingsContent(data);
            this.loadHeatmapContent(data);
            this.loadMonitoringContent(data);
            
            // IA de forma assíncrona
            setTimeout(() => {
                this.loadAIContent(unityId).catch(() => {
                    this.showError('ai-content', 'Sistema de IA temporariamente indisponível');
                });
            }, 100);
            
            this.showSection('dashboard', document.getElementById('nav-dashboard'));
            this.showMessage(`Perfil Unity de ${data.profile.dados_pessoais?.nome || 'Jogador'} carregado!`, 'success', 3000);
            
        } catch (error) {
            console.error('Erro Unity:', error);
            let errorMsg = "Erro ao conectar com Unity API.";
            
            if (error.name === 'TypeError') {
                errorMsg = "Servidor Unity não encontrado. Verifique se a API está rodando na porta 8001.";
            }
            
            this.showMessage(errorMsg, 'error', 0);
            this.showError('dashboard-content', 'Falha na conexão Unity');
            this.showError('profile-content', 'Falha na conexão Unity');
            this.showError('ai-content', 'Falha na conexão Unity');
            this.showError('heatmap-content', 'Falha na conexão Unity');
            this.showError('readings-content', 'Falha na conexão Unity');
            this.showError('monitoring-content', 'Falha na conexão Unity');
        }
    },

    // Dashboard Content
    loadDashboardContent(data) {
        const profile = data.profile || {};
        const soilData = data.latest_soil_data || {};
        const dashboardData = data.dashboard_data || {};
        
        const soilParams = soilData.soil_parameters || {};
        const gameMetrics = soilData.game_metrics || {};
        const playerActions = soilData.player_actions || {};

        document.getElementById('dashboard-content').innerHTML = `
            <!-- Métricas Unity -->
            <div class="unity-metrics">
                <div class="unity-metric-card" style="border-left-color: var(--primary-green);">
                    <div class="unity-metric-value" style="color: var(--primary-green);">${Number(soilParams.ph || 0).toFixed(1)}</div>
                    <div class="unity-metric-label">pH do Solo</div>
                    <div class="unity-metric-status" style="color: ${Number(soilParams.ph || 0) >= 6.0 && Number(soilParams.ph || 0) <= 7.0 ? 'var(--primary-green)' : 'var(--orange)'};">
                        ${Number(soilParams.ph || 0) >= 6.0 && Number(soilParams.ph || 0) <= 7.0 ? '✓ Ideal' : '⚠ Atenção'}
                    </div>
                </div>
                
                <div class="unity-metric-card" style="border-left-color: var(--tech-blue);">
                    <div class="unity-metric-value" style="color: var(--tech-blue);">${Number(soilParams.umidade || 0).toFixed(0)}%</div>
                    <div class="unity-metric-label">Umidade</div>
                    <div class="unity-metric-status" style="color: ${Number(soilParams.umidade || 0) >= 40 && Number(soilParams.umidade || 0) <= 70 ? 'var(--primary-green)' : 'var(--orange)'};">
                        ${Number(soilParams.umidade || 0) >= 40 && Number(soilParams.umidade || 0) <= 70 ? '✓ Ideal' : '⚠ Atenção'}
                    </div>
                </div>
                
                <div class="unity-metric-card" style="border-left-color: var(--orange);">
                    <div class="unity-metric-value" style="color: var(--orange);">${Number(soilParams.temperatura || 0).toFixed(0)}°C</div>
                    <div class="unity-metric-label">Temperatura</div>
                    <div class="unity-metric-status" style="color: ${Number(soilParams.temperatura || 0) >= 20 && Number(soilParams.temperatura || 0) <= 30 ? 'var(--primary-green)' : 'var(--orange)'};">
                        ${Number(soilParams.temperatura || 0) >= 20 && Number(soilParams.temperatura || 0) <= 30 ? '✓ Ideal' : '⚠ Atenção'}
                    </div>
                </div>
                
                <div class="unity-metric-card" style="border-left-color: var(--purple);">
                    <div class="unity-metric-value" style="color: var(--purple);">${gameMetrics.score || 0}</div>
                    <div class="unity-metric-label">Score Unity</div>
                    <div class="unity-metric-status" style="color: var(--gray-500);">Última sessão</div>
                </div>
            </div>
            
            <!-- Cards Unity -->
            <div class="unity-info-grid">
                <!-- Perfil Unity -->
                <div class="unity-card">
                    <div class="unity-card-header">
                        <div class="unity-card-icon">
                            <i class="fas fa-gamepad"></i>
                        </div>
                        <div>
                            <h3 class="unity-card-title">${profile.dados_pessoais?.nome || 'Jogador Unity'}</h3>
                            <p class="unity-card-subtitle">
                                <i class="fas fa-tractor" style="color: var(--primary-green);"></i>
                                ${dashboardData.propriedade || 'Fazenda Unity'}
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-user" style="color: var(--tech-blue);"></i> Dados Unity
                        </h4>
                        <div>
                            <div class="unity-data-row">
                                <i class="fas fa-id-card"></i>
                                <span><strong>Unity ID:</strong> ${this.currentUnityId}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-envelope"></i>
                                <span><strong>Email:</strong> ${profile.dados_pessoais?.email || 'N/A'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-phone"></i>
                                <span><strong>Telefone:</strong> ${profile.dados_pessoais?.telefone || 'N/A'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-expand-arrows-alt"></i>
                                <span><strong>Área:</strong> ${dashboardData.area || 0} ha</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Gaming Stats -->
                <div class="unity-card">
                    <div class="unity-card-header">
                        <div class="unity-card-icon" style="background: linear-gradient(135deg, var(--unity-primary), var(--unity-secondary));">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div>
                            <h3 class="unity-card-title">Stats de Jogo</h3>
                            <p class="unity-card-subtitle">Performance Unity</p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-chart-bar" style="color: var(--unity-primary);"></i> Ações do Jogador
                        </h4>
                        <div>
                            <div class="unity-data-row">
                                <i class="fas fa-tint"></i>
                                <span><strong>Irrigação:</strong> ${playerActions.irrigacao || 0}%</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-seedling"></i>
                                <span><strong>NPK Aplicado:</strong> N:${playerActions.fertilizante_npk?.N || 0} P:${playerActions.fertilizante_npk?.P || 0} K:${playerActions.fertilizante_npk?.K || 0}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-coins"></i>
                                <span><strong>Dinheiro Gasto:</strong> R$ ${Number(gameMetrics.money_spent || 0).toFixed(2)}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-heart"></i>
                                <span><strong>Saúde Solo:</strong> ${dashboardData.soil_health || 50}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Profile Content
    loadProfileContent(data) {
        const profile = data.profile || {};
        const pessoais = profile.dados_pessoais || {};
        const propriedade = profile.propriedade || {};
        const experiencia = profile.experiencia || {};
        const unityStats = profile.unity_stats || {};
        const auditoria = profile.auditoria || {};

        // Formatação de datas
        const dataNascimento = pessoais.data_nascimento ? new Date(pessoais.data_nascimento).toLocaleDateString('pt-BR') : 'N/A';
        const dataCriacao = auditoria.created_at ? new Date(auditoria.created_at).toLocaleDateString('pt-BR') : 'N/A';
        const ultimoLogin = auditoria.last_login ? new Date(auditoria.last_login).toLocaleDateString('pt-BR') : 'Nunca';

        document.getElementById('profile-content').innerHTML = `
            <!-- Grid Principal 3 Colunas -->
            <div class="unity-info-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom: 2rem;">
                <!-- Coluna 1: Dados Pessoais -->
                <div class="unity-card" style="border-left: 4px solid var(--primary-green);">
                    <h3 style="color: var(--primary-green); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-user-circle"></i> Dados Pessoais
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-user"></i>
                            <span><strong>Nome:</strong> ${pessoais.nome || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-envelope"></i>
                            <span><strong>Email:</strong> ${pessoais.email || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-phone"></i>
                            <span><strong>Telefone:</strong> ${pessoais.telefone || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-id-card"></i>
                            <span><strong>CPF:</strong> ${pessoais.cpf || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-birthday-cake"></i>
                            <span><strong>Nascimento:</strong> ${dataNascimento}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-venus-mars"></i>
                            <span><strong>Gênero:</strong> ${pessoais.genero || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-gamepad"></i>
                            <span><strong>Unity ID:</strong> ${this.currentUnityId}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Coluna 2: Propriedade & Localização -->
                <div class="unity-card" style="border-left: 4px solid var(--tech-blue);">
                    <h3 style="color: var(--tech-blue); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-map-marked-alt"></i> Propriedade & Localização
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-home"></i>
                            <span><strong>Nome Fazenda:</strong> ${propriedade.nome || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-expand-arrows-alt"></i>
                            <span><strong>Área:</strong> ${propriedade.area_hectares || 0} hectares</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Localização:</strong> ${propriedade.localizacao || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-mountain"></i>
                            <span><strong>Região:</strong> ${propriedade.regiao || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-layer-group"></i>
                            <span><strong>Tipo Solo:</strong> ${propriedade.tipo_solo || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-tint"></i>
                            <span><strong>Irrigação:</strong> ${propriedade.irrigacao_disponivel ? 'Disponível' : 'Não disponível'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-certificate"></i>
                            <span><strong>Certificações:</strong> ${Array.isArray(propriedade.certificacoes) ? propriedade.certificacoes.join(', ') || 'Nenhuma' : 'Nenhuma'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Coluna 3: Experiência & Unity -->
                <div class="unity-card" style="border-left: 4px solid var(--unity-primary);">
                    <h3 style="color: var(--unity-primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-graduation-cap"></i> Experiência & Unity
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-seedling"></i>
                            <span><strong>Anos Agricultura:</strong> ${experiencia.anos_agricultura || 0} anos</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-microchip"></i>
                            <span><strong>Nível Tecnologia:</strong> ${experiencia.nivel_tecnologia || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-leaf"></i>
                            <span><strong>Uso Defensivos:</strong> ${experiencia.uso_defensivos || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-level-up-alt"></i>
                            <span><strong>Nível Unity:</strong> ${unityStats.nivel || 'Iniciante'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-play"></i>
                            <span><strong>Total Sessions:</strong> ${unityStats.total_sessions || 0}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-trophy"></i>
                            <span><strong>Melhor Score:</strong> ${unityStats.best_score || 0}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-clock"></i>
                            <span><strong>Tempo Total:</strong> ${Math.floor((unityStats.total_playtime || 0) / 60)} min</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Card Inferior: Achievements & Cultivos -->
            <div class="unity-info-grid" style="grid-template-columns: 1fr 1fr;">
                <!-- Achievements & Auditoria -->
                <div class="unity-card" style="border-left: 4px solid var(--purple);">
                    <h3 style="color: var(--purple); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-medal"></i> Achievements & Auditoria
                    </h3>
                    <div>
                        <!-- Achievements -->
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-star" style="color: var(--amber);"></i> Conquistas
                            </h4>
                            ${Array.isArray(unityStats.achievements) && unityStats.achievements.length > 0 ? 
                                unityStats.achievements.map(achievement => `
                                    <div style="display: inline-block; background: linear-gradient(135deg, var(--amber), var(--orange)); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; margin: 0.25rem; font-weight: 600;">
                                        <i class="fas fa-trophy"></i> ${achievement}
                                    </div>
                                `).join('') : 
                                '<p style="color: var(--gray-600); font-style: italic; font-size: 0.9rem;">Nenhuma conquista desbloqueada ainda</p>'
                            }
                        </div>
                        
                        <!-- Auditoria -->
                        <div>
                            <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-history" style="color: var(--tech-blue);"></i> Auditoria
                            </h4>
                            <div class="unity-data-row">
                                <i class="fas fa-calendar-plus"></i>
                                <span><strong>Criado em:</strong> ${dataCriacao}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-sign-in-alt"></i>
                                <span><strong>Último Login:</strong> ${ultimoLogin}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-hashtag"></i>
                                <span><strong>Total Logins:</strong> ${auditoria.login_count || 0}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-check-circle"></i>
                                <span><strong>Status:</strong> 
                                    <span style="color: ${auditoria.status === 'active' ? 'var(--secondary-green)' : 'var(--orange)'}; font-weight: 600;">
                                        ${auditoria.status === 'active' ? 'Ativo' : auditoria.status || 'N/A'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cultivos Principais -->
                <div class="unity-card" style="border-left: 4px solid var(--secondary-green);">
                    <h3 style="color: var(--secondary-green); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-leaf"></i> Cultivos Principais
                    </h3>
                    <div>
                        <!-- Cultivos Grid -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                            ${Array.isArray(propriedade.cultivos_principais) ? propriedade.cultivos_principais.map((cultivo, index) => {
                                const areaEstimada = (propriedade.area_hectares / propriedade.cultivos_principais.length).toFixed(1);
                                const produtividade = this.getProductivityByCrop(cultivo, propriedade.regiao);
                                return `
                                    <div style="text-align: center; padding: 1rem; background: var(--gray-50); border-radius: 8px; border: 2px solid var(--secondary-green);">
                                        <i class="fas fa-${this.getCultivoIcon(cultivo)}" style="font-size: 1.5rem; color: var(--secondary-green); margin-bottom: 0.5rem;"></i>
                                        <div style="font-weight: 600; color: var(--gray-800); font-size: 0.9rem;">${cultivo}</div>
                                        <div style="font-size: 0.8rem; color: var(--gray-600);">${areaEstimada} ha</div>
                                        <div style="font-size: 0.75rem; color: var(--secondary-green); font-weight: 600;">${produtividade}</div>
                                    </div>
                                `;
                            }).join('') : '<p style="color: var(--gray-600); font-style: italic;">Nenhum cultivo cadastrado</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Função auxiliar para ícones de cultivos
    getCultivoIcon(cultivo) {
        const icons = {
            'Café': 'coffee',
            'Milho': 'seedling',
            'Soja': 'leaf',
            'Cana': 'sugar-cane',
            'Feijão': 'circle',
            'Arroz': 'seedling',
            'Trigo': 'wheat-awn'
        };
        return icons[cultivo] || 'leaf';
    },

    // Função auxiliar para produtividade por cultivo e região
    getProductivityByCrop(cultivo, regiao) {
        const produtividade = {
            'Café': {
                'Sul de Minas': '28 sc/ha',
                'Zona da Mata': '25 sc/ha',
                'default': '26 sc/ha'
            },
            'Milho': {
                'Sul de Minas': '8.5 t/ha',
                'Triângulo Mineiro': '9.2 t/ha',
                'default': '8.8 t/ha'
            },
            'Soja': {
                'Triângulo Mineiro': '3.8 t/ha',
                'Sul de Minas': '3.5 t/ha',
                'default': '3.6 t/ha'
            },
            'Cana': {
                'Zona da Mata': '85 t/ha',
                'Triângulo Mineiro': '90 t/ha',
                'default': '87 t/ha'
            },
            'Feijão': {
                'Sul de Minas': '2.2 t/ha',
                'default': '2.0 t/ha'
            }
        };
        
        const cultivoData = produtividade[cultivo];
        if (!cultivoData) return 'N/A';
        
        return cultivoData[regiao] || cultivoData['default'] || 'N/A';
    },

    // Readings Content
    loadReadingsContent(data) {
        const profile = data.profile || {};
        const unityStats = profile.unity_stats || {};
        const auditoria = profile.auditoria || {};
        
        // Simular sessões baseadas nos dados reais
        const totalSessions = unityStats.total_sessions || 0;
        const totalPlaytime = unityStats.total_playtime || 0;
        const bestScore = unityStats.best_score || 0;
        const avgSessionTime = totalSessions > 0 ? Math.floor(totalPlaytime / totalSessions) : 0;
        
        document.getElementById('readings-content').innerHTML = `
            <!-- Stats Resumo -->
            <div class="unity-metrics" style="margin-bottom: 2rem;">
                <div class="unity-metric-card" style="border-left-color: var(--primary-green);">
                    <div class="unity-metric-value" style="color: var(--primary-green);">${totalSessions}</div>
                    <div class="unity-metric-label">Total de Sessões</div>
                </div>
                <div class="unity-metric-card" style="border-left-color: var(--tech-blue);">
                    <div class="unity-metric-value" style="color: var(--tech-blue);">${Math.floor(totalPlaytime / 60)}</div>
                    <div class="unity-metric-label">Minutos Jogados</div>
                </div>
                <div class="unity-metric-card" style="border-left-color: var(--orange);">
                    <div class="unity-metric-value" style="color: var(--orange);">${bestScore}</div>
                    <div class="unity-metric-label">Melhor Score</div>
                </div>
                <div class="unity-metric-card" style="border-left-color: var(--purple);">
                    <div class="unity-metric-value" style="color: var(--purple);">${avgSessionTime}</div>
                    <div class="unity-metric-label">Tempo Médio (min)</div>
                </div>
            </div>
            
            <div class="unity-card">
                <h3 style="color: var(--primary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line"></i> Histórico de Atividades Unity
                </h3>
                ${totalSessions > 0 ? `
                    <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                        <h4 style="color: var(--gray-800); margin-bottom: 1rem;">Estatísticas de Jogo</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div class="unity-data-row">
                                <i class="fas fa-play"></i>
                                <span><strong>Sessões Totais:</strong> ${totalSessions}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-clock"></i>
                                <span><strong>Tempo Total:</strong> ${Math.floor(totalPlaytime / 60)} minutos</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-trophy"></i>
                                <span><strong>Melhor Score:</strong> ${bestScore} pontos</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-chart-bar"></i>
                                <span><strong>Média por Sessão:</strong> ${avgSessionTime} min</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-level-up-alt"></i>
                                <span><strong>Nível Atual:</strong> ${unityStats.nivel || 'Iniciante'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-medal"></i>
                                <span><strong>Conquistas:</strong> ${Array.isArray(unityStats.achievements) ? unityStats.achievements.length : 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, var(--gray-50), var(--white)); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--tech-blue);">
                        <h4 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-info-circle"></i> Informações da Conta
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                            <div class="unity-data-row">
                                <i class="fas fa-calendar-plus"></i>
                                <span><strong>Conta Criada:</strong> ${auditoria.created_at ? new Date(auditoria.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-sign-in-alt"></i>
                                <span><strong>Último Login:</strong> ${auditoria.last_login ? new Date(auditoria.last_login).toLocaleDateString('pt-BR') : 'Nunca'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-hashtag"></i>
                                <span><strong>Total de Logins:</strong> ${auditoria.login_count || 0}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-check-circle"></i>
                                <span><strong>Status da Conta:</strong> 
                                    <span style="color: ${auditoria.status === 'active' ? 'var(--secondary-green)' : 'var(--orange)'}; font-weight: 600;">
                                        ${auditoria.status === 'active' ? 'Ativa' : auditoria.status || 'N/A'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div style="text-align: center; padding: 3rem; background: var(--gray-50); border-radius: 12px;">
                        <i class="fas fa-gamepad" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                        <h4 style="color: var(--gray-600); margin-bottom: 0.5rem;">Nenhuma Sessão Registrada</h4>
                        <p style="color: var(--gray-500);">Comece a jogar Unity para ver seu histórico aqui!</p>
                        <div style="margin-top: 1.5rem;">
                            <div class="unity-data-row" style="justify-content: center; background: white; display: inline-flex; padding: 1rem 2rem; border-radius: 8px;">
                                <i class="fas fa-calendar-plus"></i>
                                <span><strong>Conta Criada:</strong> ${auditoria.created_at ? new Date(auditoria.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    },

    // Heatmap Content
    loadHeatmapContent(data) {
        const soilHistory = data.soil_history || [];
        
        if (soilHistory.length === 0) {
            this.showEmpty('heatmap-content', 'Não há dados de solo suficientes para gerar mapas de calor');
            return;
        }
        
        document.getElementById('heatmap-content').innerHTML = `
            <!-- Controles do Mapa -->
            <div class="unity-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-green); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-sliders-h"></i> Controles do Mapa Unity
                </h3>
                <div class="unity-info-grid" style="grid-template-columns: 1fr 1fr;">
                    <div style="background: rgba(255,255,255,0.8); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--gray-200);">
                        <label style="font-family: 'Poppins', sans-serif; font-weight: 600; color: var(--gray-800); display: block; margin-bottom: 0.75rem;">Parâmetro de Análise</label>
                        <select id="unity-heatmap-parameter" onchange="UnityDashboard.updateHeatmapView()" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--gray-200); border-radius: 12px; font-size: 1rem; background: white;">
                            <option value="ph">pH do Solo</option>
                            <option value="umidade">Umidade (%)</option>
                            <option value="temperatura">Temperatura (°C)</option>
                            <option value="condutividade">Condutividade</option>
                            <option value="salinidade">Salinidade</option>
                            <option value="npk">NPK Total</option>
                            <option value="score">Score Unity</option>
                        </select>
                    </div>
                    <div style="background: rgba(255,255,255,0.8); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--gray-200);">
                        <label style="font-family: 'Poppins', sans-serif; font-weight: 600; color: var(--gray-800); display: block; margin-bottom: 0.75rem;">Período de Tempo</label>
                        <select id="unity-heatmap-period" onchange="UnityDashboard.updateHeatmapView()" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--gray-200); border-radius: 12px; font-size: 1rem; background: white;">
                            <option value="latest">Última Sessão</option>
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mês</option>
                            <option value="all">Todas as Sessões</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Mapas Principais -->
            <div class="unity-info-grid" style="margin-bottom: 2rem;">
                <!-- Mapa de Parâmetros vs Tempo -->
                <div class="unity-card">
                    <h4 style="color: var(--primary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-line"></i> <span id="unity-timeline-title">Evolução do pH no Tempo</span>
                    </h4>
                    <div style="position: relative; height: 300px; background: var(--gray-50); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <canvas id="unityTimelineChart" style="max-width: 100%; max-height: 100%;"></canvas>
                    </div>
                </div>
                
                <!-- Mapa de Calor Real -->
                <div class="unity-card">
                    <h4 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-fire"></i> <span id="unity-heatmap-title">Mapa de Calor - pH</span>
                    </h4>
                    <div style="position: relative; height: 350px; background: var(--gray-50); border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 25px;">
                        <canvas id="unityHeatmapChart" style="border-radius: 8px;"></canvas>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                            <span style="width: 16px; height: 16px; border-radius: 3px; background: #ff4444;"></span>
                            <span>Crítico</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                            <span style="width: 16px; height: 16px; border-radius: 3px; background: #ffaa00;"></span>
                            <span>Atenção</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                            <span style="width: 16px; height: 16px; border-radius: 3px; background: #00aa00;"></span>
                            <span>Ideal</span>
                        </div>
                    </div>
                </div>
            </div>
            

        `;
        
        // Armazenar dados para os gráficos
        window.unitySoilData = soilHistory;
        
        // Inicializar gráficos
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                this.initializeUnityCharts();
                this.updateHeatmapView();
            } else {
                console.error('Chart.js não carregado');
            }
        }, 1000);
    },

    // AI Content - Nova implementação com análise real
    async loadAIContent(unityId) {
        try {
            // Buscar análise IA do backend
            const response = await fetch(`${this.baseUrl}/unity/analise-ia/${unityId}`);
            
            if (response.ok) {
                const analiseIA = await response.json();
                this.renderAnaliseIA(analiseIA);
            } else {
                // Fallback para análise local se API não disponível
                this.renderAnaliseLocal();
            }
        } catch (error) {
            console.error('Erro ao carregar IA:', error);
            this.renderAnaliseLocal();
        }
    },
    
    // Renderizar análise IA do backend
    renderAnaliseIA(data) {
        const diagnostico = data.diagnostico || {};
        const parametros = diagnostico.parametros || {};
        const resumo = data.resumo || {};
        const acoesPrioritarias = diagnostico.acoes_prioritarias || [];
        
        document.getElementById('ai-content').innerHTML = `
            <!-- Header IA Avançada -->
            <div class="unity-card" style="background: linear-gradient(135deg, var(--primary-green), var(--secondary-green)); color: white; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h2 style="color: white; margin: 0; display: flex; align-items: center; gap: 0.75rem; font-size: 1.5rem;">
                        <i class="fas fa-robot"></i> EKKO IA - Análise Avançada
                    </h2>
                    <div style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600;">
                        🌾 ${data.cultivo_principal || 'Cultivo Geral'}
                    </div>
                </div>
                
                <!-- Métricas Principais -->
                <div class="unity-info-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.15); border-radius: 12px; backdrop-filter: blur(10px);">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem; font-weight: 700;">${Math.round(diagnostico.saude_geral || 0)}%</div>
                        <div style="font-weight: 600; opacity: 0.9;">Saúde Geral</div>
                        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem;">${this.getHealthStatus(diagnostico.saude_geral)}</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.15); border-radius: 12px; backdrop-filter: blur(10px);">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem; font-weight: 700;">${resumo.parametros_ideais || 0}/${resumo.total_parametros || 0}</div>
                        <div style="font-weight: 600; opacity: 0.9;">Parâmetros Ideais</div>
                        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem;">${Math.round(((resumo.parametros_ideais || 0) / (resumo.total_parametros || 1)) * 100)}% otimizado</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.15); border-radius: 12px; backdrop-filter: blur(10px);">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem; font-weight: 700;">${(diagnostico.alertas_criticos || []).length}</div>
                        <div style="font-weight: 600; opacity: 0.9;">Alertas Críticos</div>
                        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem;">${(diagnostico.alertas_criticos || []).length === 0 ? 'Tudo OK' : 'Atenção'}</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.15); border-radius: 12px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">${resumo.nivel_sustentabilidade || 0}%</div>
                        <div style="font-weight: 600; opacity: 0.9;">Sustentabilidade</div>
                        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.25rem;">🌱 ${this.getSustainabilityLevel(resumo.nivel_sustentabilidade)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Insights e Previsões -->
            <div class="unity-info-grid" style="margin-bottom: 2rem;">
                <!-- Previsão de Colheita -->
                <div class="unity-card" style="border-left: 4px solid var(--amber);">
                    <h3 style="color: var(--amber); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-line"></i> Previsão de Colheita
                    </h3>
                    <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05)); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--gray-800); margin-bottom: 0.5rem;">
                            ${diagnostico.previsao_colheita || 'Calculando...'}
                        </div>
                        <div style="font-size: 0.9rem; color: var(--gray-600);">Baseado na saúde atual do solo</div>
                    </div>
                </div>
                
                <!-- Análise Econômica -->
                <div class="unity-card" style="border-left: 4px solid var(--tech-blue);">
                    <h3 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-coins"></i> Análise Econômica
                    </h3>
                    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--gray-800); margin-bottom: 0.5rem;">
                            ${diagnostico.economia_estimada || 'Analisando...'}
                        </div>
                        <div style="font-size: 0.9rem; color: var(--gray-600);">Impacto financeiro estimado</div>
                    </div>
                </div>
            </div>
            
            <!-- Ações Prioritárias -->
            ${acoesPrioritarias.length > 0 ? `
                <div class="unity-card" style="border-left: 4px solid var(--orange); margin-bottom: 2rem;">
                    <h3 style="color: var(--orange); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-exclamation-triangle"></i> Ações Prioritárias
                    </h3>
                    <div style="background: rgba(249, 115, 22, 0.1); padding: 1.5rem; border-radius: 12px;">
                        ${acoesPrioritarias.map(acao => `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; border-radius: 8px; margin-bottom: 0.75rem; border-left: 3px solid var(--orange);">
                                <div style="font-size: 1.1rem;">${acao.includes('🚨') ? '🚨' : '⚡'}</div>
                                <div style="color: var(--gray-800); font-weight: 500;">${acao.replace('🚨 ', '').replace('⚡ ', '')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Tendência e Recomendação Geral -->
            <div class="unity-info-grid" style="margin-bottom: 2rem;">
                <div class="unity-card" style="border-left: 4px solid var(--purple);">
                    <h3 style="color: var(--purple); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-trending-up"></i> Tendência
                    </h3>
                    <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 12px;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${this.getTrendIcon(resumo.tendencia_geral)}</div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--gray-800);">${resumo.tendencia_geral || 'Estável'}</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); margin-top: 0.5rem;">Últimas 3 sessões</div>
                    </div>
                </div>
                
                <div class="unity-card" style="border-left: 4px solid var(--secondary-green);">
                    <h3 style="color: var(--secondary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-lightbulb"></i> Recomendação IA
                    </h3>
                    <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); padding: 1.5rem; border-radius: 12px;">
                        <p style="color: var(--gray-800); font-weight: 500; margin: 0; line-height: 1.6;">
                            ${diagnostico.recomendacao_geral || 'Continue monitorando os parâmetros do solo'}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Análise Detalhada por Parâmetro -->
            <div class="unity-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--gray-800); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-microscope"></i> Análise Detalhada dos Parâmetros
                </h3>
                <div class="unity-info-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                    ${Object.entries(parametros).map(([param, data]) => `
                        <div class="unity-card" style="border-left: 4px solid ${this.getStatusColor(data.status)}; background: ${this.getStatusBg(data.status)};">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <h4 style="color: ${this.getStatusColor(data.status)}; margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                                    <i class="fas fa-${this.getParametroIcon(param)}"></i> ${this.getParametroNome(param)}
                                </h4>
                                <div style="padding: 0.25rem 0.75rem; border-radius: 12px; background: ${this.getStatusColor(data.status)}; color: white; font-size: 0.75rem; font-weight: 600;">
                                    ${this.getStatusTexto(data.status)}
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <div style="font-size: 2.2rem; font-weight: 700; color: ${this.getStatusColor(data.status)}; margin-bottom: 0.25rem;">
                                    ${data.valor}${this.getParametroUnidade(param)}
                                </div>
                                <div style="font-size: 0.9rem; color: var(--gray-600); background: rgba(255,255,255,0.8); padding: 0.25rem 0.75rem; border-radius: 12px; display: inline-block;">
                                    Ideal: ${data.faixa_ideal}
                                </div>
                            </div>
                            
                            <div style="background: rgba(255,255,255,0.9); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <h5 style="color: var(--gray-800); margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-info-circle" style="color: ${this.getStatusColor(data.status)};"></i> Impacto:
                                </h5>
                                <p style="color: var(--gray-700); font-size: 0.85rem; margin: 0; line-height: 1.4;">${data.impacto}</p>
                            </div>
                            
                            <div style="background: linear-gradient(135deg, ${this.getStatusColor(data.status)}, ${this.getStatusColorDark(data.status)}); padding: 1rem; border-radius: 8px; color: white;">
                                <h5 style="margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-lightbulb"></i> Ação Recomendada:
                                </h5>
                                <p style="font-size: 0.85rem; margin: 0; line-height: 1.4; font-weight: 500;">${data.sugestao}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // Renderizar análise local (fallback)
    renderAnaliseLocal() {
        const profile = this.currentUserData.profile || {};
        const experiencia = profile.experiencia || {};
        const propriedade = profile.propriedade || {};
        const unityStats = profile.unity_stats || {};
        const auditoria = profile.auditoria || {};
        
        // Análise baseada nos dados reais
        const perfilJogador = this.analisarPerfilJogador(experiencia, unityStats);
        const recomendacoes = this.gerarRecomendacoes(propriedade, experiencia);
        const performance = this.analisarPerformance(unityStats, auditoria);
        
        document.getElementById('ai-content').innerHTML = `
            <div class="unity-info-grid" style="margin-bottom: 2rem;">
                <!-- Perfil de Jogador -->
                <div class="unity-card" style="border-left: 4px solid var(--purple);">
                    <h3 style="color: var(--purple); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user-astronaut"></i> Perfil de Jogador
                    </h3>
                    <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 12px; margin-bottom: 1rem;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${perfilJogador.emoji}</div>
                        <h4 style="color: var(--purple); margin-bottom: 0.5rem;">${perfilJogador.tipo}</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">${perfilJogador.descricao}</p>
                    </div>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-microchip"></i>
                            <span><strong>Nível Tech:</strong> ${experiencia.nivel_tecnologia || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-leaf"></i>
                            <span><strong>Sustentabilidade:</strong> ${perfilJogador.sustentabilidade}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-gamepad"></i>
                            <span><strong>Gaming Level:</strong> ${unityStats.nivel || 'Iniciante'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Análise de Performance -->
                <div class="unity-card" style="border-left: 4px solid var(--tech-blue);">
                    <h3 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-line"></i> Análise de Performance
                    </h3>
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: var(--gray-700);">Engajamento</span>
                                <span style="color: ${performance.engajamento.cor}; font-weight: 600;">${performance.engajamento.nivel}</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${performance.engajamento.porcentagem}%; height: 100%; background: ${performance.engajamento.cor}; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: var(--gray-700);">Consistência</span>
                                <span style="color: ${performance.consistencia.cor}; font-weight: 600;">${performance.consistencia.nivel}</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${performance.consistencia.porcentagem}%; height: 100%; background: ${performance.consistencia.cor}; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: var(--gray-700);">Progresso</span>
                                <span style="color: ${performance.progresso.cor}; font-weight: 600;">${performance.progresso.nivel}</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${performance.progresso.porcentagem}%; height: 100%; background: ${performance.progresso.cor}; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recomendações Personalizadas -->
            <div class="unity-card" style="border-left: 4px solid var(--secondary-green);">
                <h3 style="color: var(--secondary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-lightbulb"></i> Recomendações Personalizadas
                </h3>
                <div class="unity-info-grid">
                    <!-- Cultivos Sugeridos -->
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-seedling" style="color: var(--secondary-green);"></i> Cultivos Sugeridos
                        </h4>
                        <div>
                            ${recomendacoes.cultivos_sugeridos.map(cultivo => `
                                <div style="display: inline-block; background: linear-gradient(135deg, var(--secondary-green), var(--primary-green)); color: white; padding: 0.5rem 1rem; border-radius: 20px; margin: 0.25rem; font-size: 0.9rem; font-weight: 600;">
                                    <i class="fas fa-${this.getCultivoIcon(cultivo)}"></i> ${cultivo}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Tecnologias Recomendadas -->
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-microchip" style="color: var(--tech-blue);"></i> Tecnologias
                        </h4>
                        <div>
                            ${recomendacoes.tecnologias.map(tech => `
                                <div style="display: inline-block; background: linear-gradient(135deg, var(--tech-blue), var(--cyan)); color: white; padding: 0.5rem 1rem; border-radius: 20px; margin: 0.25rem; font-size: 0.9rem; font-weight: 600;">
                                    <i class="fas fa-cog"></i> ${tech}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Certificações Próximas -->
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-certificate" style="color: var(--amber);"></i> Próximas Certificações
                        </h4>
                        <div>
                            ${recomendacoes.certificacoes_proximas.map(cert => `
                                <div style="display: inline-block; background: linear-gradient(135deg, var(--amber), var(--orange)); color: white; padding: 0.5rem 1rem; border-radius: 20px; margin: 0.25rem; font-size: 0.9rem; font-weight: 600;">
                                    <i class="fas fa-award"></i> ${cert}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Funções auxiliares para IA
    getSaudeColor(saude) {
        if (saude >= 80) return 'var(--secondary-green)';
        if (saude >= 60) return 'var(--orange)';
        return 'var(--red)';
    },
    
    getHealthStatus(saude) {
        if (saude >= 90) return 'Excelente';
        if (saude >= 80) return 'Muito Bom';
        if (saude >= 70) return 'Bom';
        if (saude >= 60) return 'Regular';
        if (saude >= 40) return 'Ruim';
        return 'Crítico';
    },
    
    getSustainabilityLevel(nivel) {
        if (nivel >= 80) return 'Alto';
        if (nivel >= 60) return 'Médio';
        return 'Baixo';
    },
    
    getTrendIcon(trend) {
        if (trend === 'Melhorando') return '📈';
        if (trend === 'Declinando') return '📉';
        return '📊';
    },
    
    getStatusBg(status) {
        const bgs = {
            'ideal': 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02))',
            'aceitavel': 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02))',
            'atencao': 'linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(249, 115, 22, 0.02))',
            'critico': 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02))'
        };
        return bgs[status] || 'var(--gray-50)';
    },
    
    getStatusColorDark(status) {
        const cores = {
            'ideal': '#059669',
            'aceitavel': '#047857',
            'atencao': '#ea580c',
            'critico': '#dc2626'
        };
        return cores[status] || 'var(--gray-600)';
    },
    
    getStatusColor(status) {
        const cores = {
            'ideal': 'var(--secondary-green)',
            'aceitavel': 'var(--primary-green)',
            'atencao': 'var(--orange)',
            'critico': 'var(--red)'
        };
        return cores[status] || 'var(--gray-500)';
    },
    
    getStatusTexto(status) {
        const textos = {
            'ideal': '✓ IDEAL',
            'aceitavel': '✓ ACEITÁVEL',
            'atencao': '⚠ ATENÇÃO',
            'critico': '❌ CRÍTICO'
        };
        return textos[status] || 'N/A';
    },
    
    getParametroIcon(param) {
        const icons = {
            'ph': 'flask',
            'umidade': 'tint',
            'temperatura': 'thermometer-half',
            'salinidade': 'water',
            'nitrogenio': 'leaf',
            'fosforo': 'seedling',
            'potassio': 'tree',
            'condutividade': 'bolt',
            'materia_organica': 'recycle',
            'performance': 'gamepad'
        };
        return icons[param] || 'chart-bar';
    },
    
    getParametroNome(param) {
        const nomes = {
            'ph': 'pH do Solo',
            'umidade': 'Umidade',
            'temperatura': 'Temperatura',
            'salinidade': 'Salinidade',
            'nitrogenio': 'Nitrogênio (N)',
            'fosforo': 'Fósforo (P)',
            'potassio': 'Potássio (K)',
            'condutividade': 'Condutividade',
            'performance': 'Performance Unity'
        };
        return nomes[param] || param.toUpperCase();
    },
    
    getParametroUnidade(param) {
        const unidades = {
            'ph': '',
            'umidade': '%',
            'temperatura': '°C',
            'salinidade': ' ppm',
            'nitrogenio': ' mg/kg',
            'fosforo': ' mg/kg',
            'potassio': ' mg/kg',
            'condutividade': ' dS/m',
            'performance': ' pts'
        };
        return unidades[param] || '';
    },
    
    // Funções auxiliares para IA
    analisarPerfilJogador(experiencia, unityStats) {
        const anosAgricultura = experiencia.anos_agricultura || 0;
        const nivelTech = experiencia.nivel_tecnologia || '';
        const usoDefensivos = experiencia.uso_defensivos || '';
        
        let tipo, emoji, descricao, sustentabilidade;
        
        if (anosAgricultura > 10 && nivelTech === 'Avançado') {
            tipo = 'Agricultor Tech Expert';
            emoji = '🚀';
            descricao = 'Agricultor experiente com alta adoção tecnológica';
        } else if (anosAgricultura > 10) {
            tipo = 'Agricultor Experiente';
            emoji = '🌾';
            descricao = 'Vasta experiência em práticas agrícolas tradicionais';
        } else if (nivelTech === 'Avançado') {
            tipo = 'Tech Enthusiast';
            emoji = '💻';
            descricao = 'Jovem agricultor com foco em inovação tecnológica';
        } else {
            tipo = 'Agricultor Iniciante';
            emoji = '🌱';
            descricao = 'Começando a jornada na agricultura moderna';
        }
        
        sustentabilidade = usoDefensivos === 'Reduzido' ? 'Alto' : usoDefensivos === 'Moderado' ? 'Médio' : 'Baixo';
        
        return { tipo, emoji, descricao, sustentabilidade };
    },
    
    gerarRecomendacoes(propriedade, experiencia) {
        const regiao = propriedade.regiao || '';
        const nivelTech = experiencia.nivel_tecnologia || '';
        const certificacoes = propriedade.certificacoes || [];
        
        let cultivos_sugeridos = [];
        let tecnologias = [];
        let certificacoes_proximas = [];
        
        // Cultivos por região
        if (regiao.includes('Sul de Minas')) {
            cultivos_sugeridos = ['Café', 'Milho', 'Feijão'];
        } else if (regiao.includes('Triângulo')) {
            cultivos_sugeridos = ['Soja', 'Milho', 'Sorgo'];
        } else if (regiao.includes('Zona da Mata')) {
            cultivos_sugeridos = ['Cana', 'Café', 'Pastagem'];
        } else {
            cultivos_sugeridos = ['Milho', 'Soja', 'Feijão'];
        }
        
        // Tecnologias por nível
        if (nivelTech === 'Avançado') {
            tecnologias = ['IoT Sensors', 'Drones', 'IA Predictiva', 'Agricultura de Precisão'];
        } else if (nivelTech === 'Intermediário') {
            tecnologias = ['Sensores Básicos', 'GPS', 'Irrigação Automatizada'];
        } else {
            tecnologias = ['Sensores de Solo', 'Aplicativo Mobile', 'Monitoramento Básico'];
        }
        
        // Certificações
        if (certificacoes.includes('Orgânico')) {
            certificacoes_proximas = ['Biodinâmico', 'Fair Trade', 'Rainforest Alliance'];
        } else {
            certificacoes_proximas = ['Orgânico', 'Boas Práticas', 'Sustentável'];
        }
        
        return { cultivos_sugeridos, tecnologias, certificacoes_proximas };
    },
    
    analisarPerformance(unityStats, auditoria) {
        const totalSessions = unityStats.total_sessions || 0;
        const loginCount = auditoria.login_count || 0;
        const bestScore = unityStats.best_score || 0;
        
        // Engajamento
        let engajamento;
        if (totalSessions > 10) {
            engajamento = { nivel: 'Alto', cor: 'var(--secondary-green)', porcentagem: 85 };
        } else if (totalSessions > 5) {
            engajamento = { nivel: 'Médio', cor: 'var(--orange)', porcentagem: 60 };
        } else {
            engajamento = { nivel: 'Baixo', cor: 'var(--red)', porcentagem: 30 };
        }
        
        // Consistência
        let consistencia;
        if (loginCount > 15) {
            consistencia = { nivel: 'Consistente', cor: 'var(--secondary-green)', porcentagem: 90 };
        } else if (loginCount > 5) {
            consistencia = { nivel: 'Regular', cor: 'var(--orange)', porcentagem: 65 };
        } else {
            consistencia = { nivel: 'Esporádico', cor: 'var(--red)', porcentagem: 25 };
        }
        
        // Progresso
        let progresso;
        if (bestScore > 800) {
            progresso = { nivel: 'Excelente', cor: 'var(--secondary-green)', porcentagem: 95 };
        } else if (bestScore > 500) {
            progresso = { nivel: 'Bom', cor: 'var(--orange)', porcentagem: 70 };
        } else {
            progresso = { nivel: 'Em Desenvolvimento', cor: 'var(--tech-blue)', porcentagem: 40 };
        }
        
        return { engajamento, consistencia, progresso };
    },

    // Utility Functions
    showSection(sectionId, clickedElement = null) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        if (clickedElement) {
            clickedElement.classList.add('active');
        }
        
        const titles = {
            'dashboard': 'Início',
            'profile': 'Perfil',
            'ai': 'IA & Solo',
            'heatmap': 'Estatísticas',
            'readings': 'Unity',
            'monitoring': 'Monitoramento Real Time'
        };
        
        if (titles[sectionId]) {
            document.getElementById('page-title').textContent = titles[sectionId];
            if (sectionId === 'dashboard') {
                document.getElementById('breadcrumb').textContent = 'Início';
            } else {
                document.getElementById('breadcrumb').textContent = `Início > ${titles[sectionId]}`;
            }
        }
    },

    showNavigation() {
        document.getElementById('nav-profile').style.display = 'block';
        document.getElementById('nav-ai').style.display = 'block';
        document.getElementById('nav-heatmap').style.display = 'block';
        document.getElementById('nav-readings').style.display = 'block';
        document.getElementById('nav-monitoring').style.display = 'block';
    },

    showMessage(text, type = 'success', duration = 5000) {
        const messageDiv = document.getElementById("mensagem");
        if (messageDiv) {
            messageDiv.className = `message ${type}`;
            messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${text}`;
            messageDiv.style.display = 'flex';
            
            if (duration > 0) {
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, duration);
            }
        }
    },

    showLoading(elementId, text = 'Carregando...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="loading"><i class="fas fa-spinner"></i> ${text}</div>`;
        }
    },

    showError(elementId, message = 'Erro ao carregar dados') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 0.5rem;">Ops! Algo deu errado</h3>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem; background: var(--unity-primary); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer;">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    },
    
    // Inicializar gráficos Unity
    initializeUnityCharts() {
        const timelineCanvas = document.getElementById('unityTimelineChart');
        const heatmapCanvas = document.getElementById('unityHeatmapChart');
        
        console.log('Inicializando gráficos...', {timelineCanvas, heatmapCanvas});
        
        if (!timelineCanvas || !heatmapCanvas) {
            console.error('Canvas não encontrados');
            return;
        }
        
        // Destruir gráficos existentes
        if (this.unityTimelineChart) {
            this.unityTimelineChart.destroy();
        }
        if (this.unityHeatmapChart) {
            this.unityHeatmapChart.destroy();
        }
        
        // Criar gráfico simples de linha
        this.unityTimelineChart = new Chart(timelineCanvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar'],
                datasets: [{
                    label: 'Teste',
                    data: [10, 20, 15],
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Criar mapa de calor real usando canvas
        this.createHeatmapCanvas(heatmapCanvas);
        
        console.log('Gráficos criados com sucesso');
    },
    
    // Atualizar visualização dos mapas
    updateHeatmapView() {
        if (!window.unitySoilData) return;
        
        const parametro = document.getElementById('unity-heatmap-parameter')?.value || 'ph';
        const periodo = document.getElementById('unity-heatmap-period')?.value || 'latest';
        
        // Atualizar títulos
        const titulos = {
            'ph': 'pH do Solo',
            'umidade': 'Umidade',
            'temperatura': 'Temperatura',
            'condutividade': 'Condutividade',
            'salinidade': 'Salinidade',
            'npk': 'NPK Total',
            'score': 'Score Unity'
        };
        
        const timelineTitle = document.getElementById('unity-timeline-title');
        const heatmapTitle = document.getElementById('unity-heatmap-title');
        
        if (timelineTitle) {
            timelineTitle.textContent = `Evolução do ${titulos[parametro]} no Tempo`;
        }
        if (heatmapTitle) {
            heatmapTitle.textContent = `Mapa de Calor - ${titulos[parametro]}`;
        }
        
        // Filtrar dados por período
        let dadosFiltrados = window.unitySoilData;
        if (periodo !== 'all') {
            const agora = new Date();
            let dataLimite;
            
            switch(periodo) {
                case 'latest':
                    dadosFiltrados = [window.unitySoilData[0]];
                    break;
                case 'week':
                    dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (dataLimite) {
                dadosFiltrados = window.unitySoilData.filter(item => {
                    const dataItem = new Date(item.timestamp);
                    return dataItem >= dataLimite;
                });
            }
        }
        
        // Processar dados
        const dadosTimeline = [];
        const dadosHeatmap = [];
        const cultivoData = {};
        
        dadosFiltrados.forEach(item => {
            const soilParams = item.soil_parameters || {};
            const gameMetrics = item.game_metrics || {};
            const cultivo = item.cultivo_atual || 'Cultivo N/A';
            const estacao = item.estacao || 'Plantio';
            
            let valor = 0;
            switch(parametro) {
                case 'ph':
                    valor = Number(soilParams.ph || 0);
                    break;
                case 'umidade':
                    valor = Number(soilParams.umidade || 0);
                    break;
                case 'temperatura':
                    valor = Number(soilParams.temperatura || 0);
                    break;
                case 'condutividade':
                    valor = Number(soilParams.condutividade || 0);
                    break;
                case 'salinidade':
                    valor = Number(soilParams.salinidade || 0);
                    break;
                case 'npk':
                    const nutrients = item.nutrients || {};
                    valor = (nutrients.nitrogenio || 0) + (nutrients.fosforo || 0) + (nutrients.potassio || 0);
                    break;
                case 'score':
                    valor = Number(gameMetrics.score || 0);
                    break;
            }
            
            // Dados para timeline
            dadosTimeline.push({
                x: new Date(item.timestamp),
                y: valor
            });
            
            // Dados para heatmap
            dadosHeatmap.push({
                x: cultivo,
                y: estacao,
                valor: valor,
                cultivo: cultivo,
                estacao: estacao,
                score: gameMetrics.score || 0,
                sustainability: gameMetrics.sustainability_index || 0
            });
            
            // Dados para análise por cultivo
            if (!cultivoData[cultivo]) cultivoData[cultivo] = [];
            cultivoData[cultivo].push(valor);
        });
        
        // Atualizar gráfico timeline
        if (this.unityTimelineChart && dadosTimeline.length > 0) {
            const labels = dadosTimeline.map((_, i) => `Sessão ${i+1}`);
            const valores = dadosTimeline.map(d => d.y);
            
            this.unityTimelineChart.data = {
                labels: labels,
                datasets: [{
                    label: titulos[parametro],
                    data: valores,
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            };
            
            this.unityTimelineChart.update();
        }
        
        // Atualizar mapa de calor real
        if (dadosHeatmap.length > 0) {
            this.updateHeatmapCanvas(dadosHeatmap, parametro);
        }
        

    },
    

    
    // Cores Unity por valor
    getUnityColorByValue(valor, parametro) {
        let cor = '#10B981'; // Verde (ideal)
        
        switch(parametro) {
            case 'ph':
                if (valor < 5.5 || valor > 7.5) cor = '#EF4444';
                else if (valor < 6.0 || valor > 7.0) cor = '#F59E0B';
                break;
            case 'umidade':
                if (valor < 30 || valor > 80) cor = '#EF4444';
                else if (valor < 40 || valor > 70) cor = '#F59E0B';
                break;
            case 'temperatura':
                if (valor < 15 || valor > 35) cor = '#EF4444';
                else if (valor < 20 || valor > 30) cor = '#F59E0B';
                break;
            case 'condutividade':
                if (valor > 2.0) cor = '#EF4444';
                else if (valor > 1.5) cor = '#F59E0B';
                break;
            case 'salinidade':
                if (valor > 800) cor = '#EF4444';
                else if (valor > 600) cor = '#F59E0B';
                break;
            case 'npk':
                if (valor < 100) cor = '#EF4444';
                else if (valor < 200) cor = '#F59E0B';
                break;
            case 'score':
                if (valor > 800) cor = '#10B981';
                else if (valor > 500) cor = '#F59E0B';
                else cor = '#EF4444';
                break;
        }
        
        return cor;
    },
    
    // Monitoramento Real Time Content
    loadMonitoringContent(data) {
        document.getElementById('monitoring-content').innerHTML = `
            <div class="unity-card">
                <h3 style="color: var(--secondary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-satellite-dish"></i> Monitoramento em Tempo Real
                </h3>
                <div style="text-align: center; padding: 3rem; background: var(--gray-50); border-radius: 12px;">
                    <i class="fas fa-broadcast-tower" style="font-size: 3rem; color: var(--secondary-green); margin-bottom: 1rem;"></i>
                    <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Sistema em Desenvolvimento</h4>
                    <p style="color: var(--gray-600);">Monitoramento de sensores IoT em tempo real será implementado em breve.</p>
                </div>
            </div>
        `;
    },
    
    // Criar canvas para mapa de calor real
    createHeatmapCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 400;
        const height = canvas.height = 300;
        
        // Limpar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Desenhar placeholder
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Mapa de Calor Unity', width/2, height/2);
        ctx.fillText('Selecione um parâmetro', width/2, height/2 + 25);
    },
    
    // Atualizar mapa de calor real
    updateHeatmapCanvas(dados, parametro) {
        const canvas = document.getElementById('unityHeatmapChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 400;
        const height = canvas.height = 300;
        
        // Organizar dados em matriz
        const cultivos = [...new Set(dados.map(d => d.cultivo))];
        const estacoes = ['Plantio', 'Crescimento', 'Floração', 'Colheita'];
        
        const cellWidth = width / cultivos.length;
        const cellHeight = height / estacoes.length;
        
        // Limpar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Desenhar células do heatmap
        estacoes.forEach((estacao, i) => {
            cultivos.forEach((cultivo, j) => {
                const dadosCelula = dados.filter(d => d.cultivo === cultivo && d.estacao === estacao);
                
                let cor = '#e5e7eb'; // Cinza padrão
                if (dadosCelula.length > 0) {
                    const valorMedio = dadosCelula.reduce((sum, d) => sum + d.valor, 0) / dadosCelula.length;
                    cor = this.getUnityColorByValue(valorMedio, parametro);
                }
                
                const x = j * cellWidth;
                const y = i * cellHeight;
                
                // Desenhar célula
                ctx.fillStyle = cor;
                ctx.fillRect(x, y, cellWidth, cellHeight);
                
                // Borda
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellWidth, cellHeight);
                
                // Texto
                if (dadosCelula.length > 0) {
                    const valorMedio = dadosCelula.reduce((sum, d) => sum + d.valor, 0) / dadosCelula.length;
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(valorMedio.toFixed(1), x + cellWidth/2, y + cellHeight/2 + 4);
                }
            });
        });
        
        // Labels dos eixos
        ctx.fillStyle = '#374151';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        
        // Labels cultivos (eixo X)
        cultivos.forEach((cultivo, j) => {
            const x = j * cellWidth + cellWidth/2;
            ctx.save();
            ctx.translate(x, height + 15);
            ctx.fillText(cultivo, 0, 0);
            ctx.restore();
        });
        
        // Labels estações (eixo Y)
        ctx.textAlign = 'right';
        estacoes.forEach((estacao, i) => {
            const y = i * cellHeight + cellHeight/2;
            ctx.fillText(estacao, -10, y + 4);
        });
    },
    
    showEmpty(elementId, message = 'Nenhum dado encontrado') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--gray-50); border-radius: 12px;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--gray-600); margin-bottom: 0.5rem;">Sem dados Unity</h3>
                    <p style="color: var(--gray-500);">${message}</p>
                </div>
            `;
        }
    }
};

// Global Functions
function showSection(sectionId, clickedElement) {
    UnityDashboard.showSection(sectionId, clickedElement);
}

function logout() {
    UnityDashboard.logout();
}

// Initialize
UnityDashboard.init();