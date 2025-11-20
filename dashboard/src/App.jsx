import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Clock, DoorOpen, Activity } from "lucide-react";
import "./App.css";

function App() {
  const [historico, setHistorico] = useState([]);
  const [tempoFora, setTempoFora] = useState(0);
  const [tempoEstudando, setTempoEstudando] = useState(0); // Nova métrica
  const [vezesSaiu, setVezesSaiu] = useState(0);
  const [distanciaAtual, setDistanciaAtual] = useState(0);
  const [loading, setLoading] = useState(false);

  // Configurações
  const LIMIT_DISTANCIA = 120; // cm
  const DEVICE_ID = "urn:ngsi-ld:RoboEstudante:001";

  const FIWARE_HEADERS = {
    "fiware-service": "smart",
    "fiware-servicepath": "/",
  };

  // Função auxiliar para formatar o tempo (ex: 1h 30m 15s)
  const formatarTempo = (segundos) => {
    if (!segundos) return "0s";
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = Math.floor(segundos % 60);
    
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const buscarDados = async () => {
    setLoading(true);
    try {
      const resHist = await fetch(
        `/api/sth/STH/v1/contextEntities/type/RoboEstudante/id/${DEVICE_ID}/attributes/d?lastN=50`,
        { headers: FIWARE_HEADERS }
      );
      const dataHist = await resHist.json();

      if (
        dataHist.contextResponses &&
        dataHist.contextResponses[0].contextElement.attributes.length > 0
      ) {
        const valores =
          dataHist.contextResponses[0].contextElement.attributes[0].values;

        // Mapeia mantendo o objeto Date real para cálculos precisos
        const dadosProcessados = valores.map((item) => ({
          rawDate: new Date(item.recvTime),
          label: new Date(item.recvTime).toLocaleTimeString(),
          valor: parseFloat(item.attrValue),
        }));

        // Garante ordenação cronológica (antigo -> novo)
        dadosProcessados.sort((a, b) => a.rawDate - b.rawDate);

        setHistorico(dadosProcessados.map(d => ({ data: d.label, valor: d.valor })));

        if (dadosProcessados.length > 0) {
          setDistanciaAtual(dadosProcessados[dadosProcessados.length - 1].valor);
        }

        // --- NOVA LÓGICA DE CÁLCULO ---
        let somaTempoFora = 0;
        let somaTempoEstudando = 0;
        let contadorSaidas = 0;
        let estavaFora = false;

        // Percorre o histórico comparando o ponto atual com o anterior
        for (let i = 1; i < dadosProcessados.length; i++) {
          const atual = dadosProcessados[i];
          const anterior = dadosProcessados[i - 1];
          
          // Calcula a diferença de tempo em segundos entre as medições
          const diffSegundos = (atual.rawDate - anterior.rawDate) / 1000;
          
          // Filtra "pulos" muito grandes (ex: sistema ficou desligado) para não sujar a métrica
          // Se a diferença for maior que 60s, ignoramos esse intervalo no somatório
          if (diffSegundos < 60) {
            if (atual.valor > LIMIT_DISTANCIA) {
              somaTempoFora += diffSegundos;
            } else {
              somaTempoEstudando += diffSegundos;
            }
          }

          // Lógica de contagem de saídas (levantou da cadeira)
          if (atual.valor > LIMIT_DISTANCIA) {
            if (!estavaFora) {
              contadorSaidas++;
              estavaFora = true;
            }
          } else {
            estavaFora = false;
          }
        }

        setTempoFora(somaTempoFora);
        setTempoEstudando(somaTempoEstudando);
        setVezesSaiu(contadorSaidas);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
    const intervalo = setInterval(buscarDados, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>🎓 Monitor de Estudos IoT</h1>
      </header>

      <div className="metrics-grid">
        {/* Card: Tempo Fora */}
        <div className="card metric-card">
          <div className="icon-bg orange">
            <Clock size={32} />
          </div>
          <div>
            <h3>Tempo Ausente</h3>
            <p className="metric-value">{formatarTempo(tempoFora)}</p>
            <span className="metric-label">Não detectado</span>
          </div>
        </div>

        {/* NOVO Card: Tempo Estudando */}
        <div className="card metric-card">
          <div className="icon-bg blue">
            <Trophy size={32} />
          </div>
          <div>
            <h3>Tempo Focado</h3>
            <p className="metric-value">{formatarTempo(tempoEstudando)}</p>
            <span className="metric-label">Na cadeira</span>
          </div>
        </div>

        {/* Card: Saídas */}
        <div className="card metric-card">
          <div className="icon-bg blue" style={{backgroundColor: '#8b5cf6'}}> 
            <DoorOpen size={32} />
          </div>
          <div>
            <h3>Saídas</h3>
            <p className="metric-value">{vezesSaiu}</p>
            <span className="metric-label">Interrupções</span>
          </div>
        </div>

        {/* Card: Status Atual */}
        <div className="card metric-card">
          <div className={`icon-bg ${distanciaAtual < LIMIT_DISTANCIA ? 'green' : 'orange'}`}>
            <Activity size={32} />
          </div>
          <div>
            <h3>Status Agora</h3>
            <p className="metric-value">{distanciaAtual} cm</p>
            <span className="metric-label">
              {distanciaAtual < LIMIT_DISTANCIA ? "🟢 Estudando" : "🔴 Ausente"}
            </span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="card chart-section">
          <h3>Histórico de Foco (Distância)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={historico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line
                  type="stepAfter" // stepAfter mostra melhor as mudanças de estado bruscas
                  dataKey="valor"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => LIMIT_DISTANCIA}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Limite Ausência"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;