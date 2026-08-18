# 🛰️ GitHub AI Radar

Detecta repositorios de **IA emergentes** en GitHub y mide su *momentum*
(estrellas ganadas por hora entre corridas) para cazarlos **antes** de que
exploten en popularidad.

En un ecosistema donde salen cientos de herramientas de IA por semana, saber
cuáles están creciendo rápido — no cuáles ya son famosas — es información que
vale. Este proyecto convierte esa señal en un CSV limpio y accionable.

## ¿Qué hace?

1. **Extract** — consulta el Search API de GitHub filtrando por *topics* de IA
   (`llm`, `rag`, `ai-agents`, `mcp`, etc.) y repos creados recientemente.
2. **Load** — guarda un snapshot de las estrellas de cada repo con timestamp
   en SQLite, construyendo un historial en el tiempo.
3. **Transform** — con **Polars**, compara la corrida actual contra el snapshot
   anterior y calcula estrellas ganadas y estrellas/hora (momentum).
4. **Report** — marca los repos que rompen umbrales de crecimiento como
   `EMERGING` y exporta un ranking a `ai_radar_report.csv`.

## Arquitectura

```
GitHub Search API  ──►  Extract  ──►  SQLite (snapshots históricos)
                                          │
                                          ▼
                                  Transform (Polars)
                                  · stars_gained
                                  · stars_per_hour  (momentum)
                                  · emerging flag
                                          │
                                          ▼
                                  ai_radar_report.csv
```

Es un mini pipeline **ETL** clásico: el valor no está en el scrape puntual,
sino en que corre en schedule y **acumula historial** — así el momentum se
vuelve más preciso con cada corrida.

## Uso

```bash
pip install -r requirements.txt

python ai_radar.py                 # repos de los últimos 30 días
python ai_radar.py --days 14       # ventana más corta = más "fresco"
python ai_radar.py --token <PAT>   # token opcional: 5000 req/h vs 60
```

> La **primera** corrida solo guarda el snapshot base (aún no hay con qué
> comparar). A partir de la **segunda**, ya calcula momentum y detecta
> emergentes. Corre en un cron cada pocas horas para mejores resultados.

### Token de GitHub (opcional pero recomendado)

Sin token: 60 peticiones/hora. Con un [Personal Access Token](https://github.com/settings/tokens)
gratis (sin permisos especiales): 5000/hora. El script respeta el rate limit
automáticamente.

## Automatizar (cron cada 4 horas)

```cron
0 */4 * * * cd /ruta/github-ai-radar && python ai_radar.py --token <PAT>
```

## Salida de ejemplo

| full_name | stars | stars_gained | stars_per_hour | emerging |
|-----------|------:|-------------:|---------------:|:--------:|
| org/rocket-agent | 200 | 80 | 8.0 | ✅ |
| org/steady-lib | 500 | 5 | 0.5 | |

## Cómo se monetiza

- **Exports semanales** de repos emergentes de IA vendidos en Gumroad /
  Lemon Squeezy a inversores, devs y newsletters de tech.
- **API/dashboard** de tendencias de IA como micro-SaaS.
- **Servicio a medida** de detección de tendencias para fondos o VCs.

## Stack

Python · Polars · SQLite · GitHub REST API

## Ideas para v2

- Enriquecer con datos de commits/contribuidores (velocidad de desarrollo).
- Detección de anomalías para filtrar star-farming (crecimiento artificial).
- Alertas por email/Telegram cuando un repo cruza el umbral.
- Dashboard con Streamlit o Next.js.

---

*Proyecto de portafolio — pipeline de recolección y análisis de datos.
Respeta los [Términos de Servicio de GitHub](https://docs.github.com/site-policy)
y los límites de la API.*
