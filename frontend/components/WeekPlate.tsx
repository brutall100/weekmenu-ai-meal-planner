import { WEEKDAYS } from "@shared/types.ts";

/**
 * SAVAITĖS LĖKŠTĖ – pradžios puslapio piešinys.
 *
 * Septynios dienos sudėtos kaip septynios lėkštės dalys: savaitė
 * atrodo kaip vienas patiekalas, o ne kaip lentelė su langeliais.
 * Spalvos – tik dizaino žetonai (fill-brand, fill-plate…), todėl
 * lėkštė pati persidažo tamsiame režime.
 */
const SLICE_FILLS = [
  "fill-brand",
  "fill-butter",
  "fill-fresh",
  "fill-brand-soft",
  "fill-plate",
  "fill-butter",
  "fill-brand",
];

function slicePath(i: number): string {
  const r = 78;
  const a0 = (i / 7) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / 7) * Math.PI * 2 - Math.PI / 2;
  const x0 = 100 + Math.cos(a0) * r;
  const y0 = 100 + Math.sin(a0) * r;
  const x1 = 100 + Math.cos(a1) * r;
  const y1 = 100 + Math.sin(a1) * r;
  return `M100 100 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${
    x1.toFixed(2)
  } ${y1.toFixed(2)} Z`;
}

function labelPos(i: number) {
  const a = ((i + 0.5) / 7) * Math.PI * 2 - Math.PI / 2;
  return { x: 100 + Math.cos(a) * 54, y: 100 + Math.sin(a) * 54 };
}

export function WeekPlate() {
  return (
    <svg
      viewBox="0 0 200 200"
      class="mx-auto w-full max-w-[22rem] drop-shadow-xl"
      role="img"
      aria-label="Savaitės lėkštė: septynios dienos nuo pirmadienio iki sekmadienio"
    >
      <circle cx="100" cy="100" r="98" class="fill-plate" />
      <circle cx="100" cy="100" r="90" class="fill-surface-raised" />
      <g class="lekste-sukasi">
        {WEEKDAYS.map((day, i) => {
          const p = labelPos(i);
          return (
            <g key={day}>
              <path
                d={slicePath(i)}
                class={`${SLICE_FILLS[i]} stroke-surface-raised`}
                stroke-width="3"
              />
              {
                /* Dienos vardas ant balto taškelio – įskaitomas ant bet kurios
                  dalies spalvos ir abiejose temose. */
              }
              <circle cx={p.x} cy={p.y} r="10" class="fill-surface-raised" />
              <text
                x={p.x}
                y={p.y}
                text-anchor="middle"
                dominant-baseline="central"
                class="fill-ink font-mono text-[11px] font-medium"
              >
                {day.slice(0, 2)}
              </text>
            </g>
          );
        })}
      </g>
      <circle cx="100" cy="100" r="22" class="fill-surface-raised" />
      <text
        x="100"
        y="100"
        text-anchor="middle"
        dominant-baseline="central"
        class="fill-ink font-display text-[18px] font-extrabold"
      >
        7
      </text>
    </svg>
  );
}
