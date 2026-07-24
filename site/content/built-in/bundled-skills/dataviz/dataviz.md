# /dataviz

Design guidance for building charts, graphs, and dashboards that read as one clean, accessible system, in any output medium.

## Usage

```
/dataviz [request]
```

Invoke it before you write chart code. Optionally describe what you are building.

## What It Does

When you are about to create any chart, graph, plot, or dashboard, `/dataviz` has Claude:

- Pick the chart form that fits the data, rather than defaulting to a bar chart
- Assign colour by role (categorical, sequential, or diverging) instead of arbitrarily
- Validate the palette for colourblind safety and contrast, using a bundled script
- Apply consistent mark, interaction, and accessibility rules

It uses a brand-neutral placeholder palette that you swap for your own.

## When to Use It

- Before the first line of chart code, in any library (matplotlib, plotly, D3, Recharts) or as inline SVG
- Building a dashboard, a KPI row, stat tiles, sparklines, or a heatmap
- Choosing categorical colours, or a sequential or diverging palette

## Tips

- Reach for it early. Its value is in the choices made before you render, not fixes after
- The colourblind and contrast validation is a real script, not a vibe check. Let it run
- It works across mediums: HTML or React artifacts, plotting code, or an image you will render

## Further Reading

- [Official docs: Bundled skills](https://code.claude.com/docs/en/skills#bundled-skills)
