"use client";

import React, { useState, useEffect, useRef } from "react";
import BloodCursor from "../components/BloodCursor";

interface PhysicsObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface PhysicsSystem {
  update(objects: PhysicsObject[]): void;
}

interface RendererSystem {
  render(objects: PhysicsObject[]): void;
  clear(): void;
}

class Engine {
  physics: PhysicsSystem;
  renderer: RendererSystem;
  objects: PhysicsObject[];

  constructor(
    physics: PhysicsSystem,
    renderer: RendererSystem,
    objects: PhysicsObject[] = [],
  ) {
    this.physics = physics;
    this.renderer = renderer;
    this.objects = objects;
  }

  add(...objects: PhysicsObject[]) {
    this.objects = this.objects.concat(objects);
  }

  tick() {
    this.physics.update(this.objects);
  }

  render() {
    this.renderer.render(this.objects);
  }

  clear() {
    this.renderer.clear();
  }
}

function PhysicsSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple physics for blood cells
    const physics: PhysicsSystem = {
      update(objects: PhysicsObject[]) {
        objects.forEach((obj: PhysicsObject) => {
          obj.x += obj.vx;
          obj.y += obj.vy;

          // Bounce off walls
          if (obj.x <= 0 || obj.x >= canvas.width) obj.vx *= -1;
          if (obj.y <= 0 || obj.y >= canvas.height) obj.vy *= -1;
        });
      },
    };

    // Simple renderer
    const renderer: RendererSystem = {
      render(objects: PhysicsObject[]) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        objects.forEach((obj: PhysicsObject) => {
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.fill();
        });
      },
      clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
    };

    const engine = new Engine(physics, renderer);

    // Add some blood cells
    for (let i = 0; i < 20; i++) {
      engine.add({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 8 + Math.random() * 4,
        color: i % 2 === 0 ? "#ef4444" : "#3b82f6",
      });
    }

    engineRef.current = engine;

    // Animation loop
    const animate = () => {
      engine.tick();
      engine.render();
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.clear();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64 rounded-[2rem] border border-white/10 bg-black/80"
      style={{ maxWidth: "100%", height: "256px" }}
    />
  );
}

export default function CirculatorySite() {
  const parts = {
    ra: "Баруун тосгуур: Биеэс ирсэн хүчилтөрөгч багатай цусыг хүлээн авна.",
    rv: "Баруун ховдол: Цусыг уушги руу шахна.",
    la: "Зүүн тосгуур: Уушгиас ирсэн хүчилтөрөгчтэй цусыг хүлээн авна.",
    lv: "Зүүн ховдол: Цусыг бүх бие рүү шахна.",
    tricuspid:
      "Гурван хавтаст хавхлага: Баруун тосгуур ба баруун ховдол хооронд цусны урсгалыг зохицуулна.",
    mitral:
      "Хоёр хавтаст хавхлага: Зүүн тосгуур ба зүүн ховдол хооронд цусны урсгалыг зохицуулна.",
    pulmonary: "Уушгины хавхлага: Баруун ховдлоос уушги руу цусыг шахна.",
    aortic: "Аортны хавхлага: Зүүн ховдлоос бүх бие рүү цусыг шахна.",
    venaCava: "Дээд ба доод хөндий вен: Биеийн цусыг зүрх рүү буцаана.",
    aorta: "Аорта: Хүчилтөрөгчтэй цусыг бүх бие рүү тархана.",
    pulmonaryArtery:
      "Уушгины артери: Хүчилтөрөгч багатай цусыг уушги руу хүргэнэ.",
    pulmonaryVein: "Уушгины вен: Хүчилтөрөгчтэй цусыг зүрх рүү буцаана.",
  } as const;

  const steps = [
    "Бие → Баруун тосгуур",
    "Баруун тосгуур → Баруун ховдол",
    "Баруун ховдол → Уушги ",
    "Уушги → Зүүн тосгуур",
    "Зүүн тосгуур → Зүүн ховдол",
    "Зүүн ховдол → Бие",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [selected, setSelected] = useState<keyof typeof parts | null>(null);

  const [showTeam, setShowTeam] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 border border-white/5 relative overflow-hidden">
      <BloodCursor />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-800/10"></div>
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl space-y-16">
          <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-purple-500/5 backdrop-blur-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-4 inline-flex rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">
                  Цусны эргэлтийн систем
                </p>
                <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                  🫀 Зүрхний цусны эргэлтийн интерактив туршлага
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-slate-300 sm:text-xl">
                  Цус зүрхээр хэрхэн хөдөлдөгийг хөдөлгөөнт урсгал, анатомийн
                  тодруулга болон интерактив сургалтын интерфейсээр судлаарай.
                </p>
              </div>
              <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-200 shadow-lg shadow-slate-950/20 md:w-[320px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Зүрхний цохилт</span>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
                    72 цохилт/мин
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Хүчилтөрөгчийн түвшин</span>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-200">
                    98%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Цусны эргэлт</span>
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-violet-200">
                    Тасралтгүй
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-purple-500/5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold text-white">
                    🩸 Цусны динамик урсгал
                  </h2>
                  <p className="mt-2 text-slate-400">
                    Цусны эсүүд судасаар зөөлөн хөдөлгөөнтэй, гэрэлтэх
                    мөртэйгээр урсаж байгааг ажиглаарай.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  Давтагдах хөдөлгөөнт урсгал
                </span>
              </div>

              <div
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-xl shadow-indigo-500/20"
                style={{ minHeight: "300px" }}
              >
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute h-5 w-5 rounded-full ${i % 2 === 0 ? "bg-red-500 shadow-red-500/60" : "bg-blue-500 shadow-blue-500/60"} animate-flow-cell`}
                    style={{
                      top: `${30 + (i % 6) * 35}px`,
                      left: `${-25}px`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${7 + (i % 3) * 1.5}s`,
                    }}
                  />
                ))}
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-r from-slate-900/60 via-transparent to-slate-900/60" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                <div className="absolute inset-x-0 top-1/4 h-px bg-white/5" />
                <div className="absolute inset-x-0 top-3/4 h-px bg-white/5" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/10">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Улаан эсүүд
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Хүчилтөрөгч зөөдөг
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/10">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Цэнхэр эсүүд
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Хаягдал буцаана
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-purple-500/5 backdrop-blur-xl">
              <h2 className="text-3xl font-semibold text-white">
                🫀 Интерактив зүрх
              </h2>
              <p className="mt-3 text-slate-400">
                Зүрхний хөндий, хавхлага эсвэл судас дээр дарж тэдний үүргийг
                судлаарай.
              </p>

              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="relative">
                  <svg viewBox="0 0 400 400" className="w-full max-w-sm">
                    {/* Major Vessels */}
                    {/* Vena Cava (Superior/Inferior) */}
                    <path
                      d="M50 80 L50 120 L80 120 L80 140"
                      fill="none"
                      stroke={
                        selected === "venaCava"
                          ? "#ef4444"
                          : "rgba(239,68,68,0.6)"
                      }
                      strokeWidth={selected === "venaCava" ? "4" : "3"}
                      className="cursor-pointer transition-all duration-300 hover:stroke-red-400"
                      onClick={() => setSelected("venaCava")}
                    />
                    <text
                      x="35"
                      y="100"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Vena Cava
                    </text>

                    {/* Pulmonary Veins */}
                    <path
                      d="M320 80 L320 120 L280 120 L280 140"
                      fill="none"
                      stroke={
                        selected === "pulmonaryVein"
                          ? "#3b82f6"
                          : "rgba(59,130,246,0.6)"
                      }
                      strokeWidth={selected === "pulmonaryVein" ? "4" : "3"}
                      className="cursor-pointer transition-all duration-300 hover:stroke-blue-400"
                      onClick={() => setSelected("pulmonaryVein")}
                    />
                    <text
                      x="325"
                      y="100"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Уушги вен
                    </text>

                    {/* Pulmonary Arteries */}
                    <path
                      d="M80 260 L80 280 L50 280 L50 320"
                      fill="none"
                      stroke={
                        selected === "pulmonaryArtery"
                          ? "#ef4444"
                          : "rgba(239,68,68,0.6)"
                      }
                      strokeWidth={selected === "pulmonaryArtery" ? "4" : "3"}
                      className="cursor-pointer transition-all duration-300 hover:stroke-red-400"
                      onClick={() => setSelected("pulmonaryArtery")}
                    />
                    <text
                      x="35"
                      y="290"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Уушги артери
                    </text>

                    {/* Aorta */}
                    <path
                      d="M320 260 L320 280 L350 280 L350 320"
                      fill="none"
                      stroke={
                        selected === "aorta"
                          ? "#3b82f6"
                          : "rgba(59,130,246,0.6)"
                      }
                      strokeWidth={selected === "aorta" ? "4" : "3"}
                      className="cursor-pointer transition-all duration-300 hover:stroke-blue-400"
                      onClick={() => setSelected("aorta")}
                    />
                    <text
                      x="365"
                      y="290"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Аорта
                    </text>

                    {/* Heart outline */}
                    <path
                      d="M200 350 C200 350, 50 250, 50 150 C50 100, 100 50, 200 100 C300 50, 350 100, 350 150 C350 250, 200 350, 200 350 Z"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                    />

                    {/* RA - Right Atrium */}
                    <circle
                      cx="120"
                      cy="150"
                      r="40"
                      fill={selected === "ra" ? "#ef4444" : "#7f1d1d"}
                      stroke={
                        selected === "ra" ? "#fca5a5" : "rgba(255,255,255,0.3)"
                      }
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-300 hover:stroke-white hover:scale-110"
                      onClick={() => setSelected("ra")}
                    />
                    <text
                      x="120"
                      y="155"
                      textAnchor="middle"
                      fontSize="14"
                      fill="white"
                      className="pointer-events-none"
                    >
                      RA
                    </text>

                    {/* LA - Left Atrium */}
                    <circle
                      cx="280"
                      cy="150"
                      r="40"
                      fill={selected === "la" ? "#3b82f6" : "#1e40af"}
                      stroke={
                        selected === "la" ? "#93c5fd" : "rgba(255,255,255,0.3)"
                      }
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-300 hover:stroke-white hover:scale-110"
                      onClick={() => setSelected("la")}
                    />
                    <text
                      x="280"
                      y="155"
                      textAnchor="middle"
                      fontSize="14"
                      fill="white"
                      className="pointer-events-none"
                    >
                      LA
                    </text>

                    {/* RV - Right Ventricle */}
                    <circle
                      cx="120"
                      cy="250"
                      r="45"
                      fill={selected === "rv" ? "#ef4444" : "#7f1d1d"}
                      stroke={
                        selected === "rv" ? "#fca5a5" : "rgba(255,255,255,0.3)"
                      }
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-300 hover:stroke-white hover:scale-110"
                      onClick={() => setSelected("rv")}
                    />
                    <text
                      x="120"
                      y="255"
                      textAnchor="middle"
                      fontSize="14"
                      fill="white"
                      className="pointer-events-none"
                    >
                      RV
                    </text>

                    {/* LV - Left Ventricle */}
                    <circle
                      cx="280"
                      cy="250"
                      r="45"
                      fill={selected === "lv" ? "#3b82f6" : "#1e40af"}
                      stroke={
                        selected === "lv" ? "#93c5fd" : "rgba(255,255,255,0.3)"
                      }
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-300 hover:stroke-white hover:scale-110"
                      onClick={() => setSelected("lv")}
                    />
                    <text
                      x="280"
                      y="255"
                      textAnchor="middle"
                      fontSize="14"
                      fill="white"
                      className="pointer-events-none"
                    >
                      LV
                    </text>

                    {/* Valves */}
                    {/* Tricuspid Valve */}
                    <g
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                      onClick={() => setSelected("tricuspid")}
                    >
                      <path
                        d="M140 190 Q160 200 140 210"
                        fill="none"
                        stroke={
                          selected === "tricuspid"
                            ? "#fca5a5"
                            : "rgba(252,165,165,0.6)"
                        }
                        strokeWidth={selected === "tricuspid" ? "4" : "3"}
                      />
                      <path
                        d="M160 190 Q180 200 160 210"
                        fill="none"
                        stroke={
                          selected === "tricuspid"
                            ? "#fca5a5"
                            : "rgba(252,165,165,0.6)"
                        }
                        strokeWidth={selected === "tricuspid" ? "4" : "3"}
                      />
                      <path
                        d="M180 190 Q200 200 180 210"
                        fill="none"
                        stroke={
                          selected === "tricuspid"
                            ? "#fca5a5"
                            : "rgba(252,165,165,0.6)"
                        }
                        strokeWidth={selected === "tricuspid" ? "4" : "3"}
                      />
                    </g>
                    <text
                      x="160"
                      y="225"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Гурван хавтаст
                    </text>

                    {/* Mitral Valve */}
                    <g
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                      onClick={() => setSelected("mitral")}
                    >
                      <path
                        d="M240 190 Q260 200 240 210"
                        fill="none"
                        stroke={
                          selected === "mitral"
                            ? "#93c5fd"
                            : "rgba(147,197,253,0.6)"
                        }
                        strokeWidth={selected === "mitral" ? "4" : "3"}
                      />
                      <path
                        d="M260 190 Q280 200 260 210"
                        fill="none"
                        stroke={
                          selected === "mitral"
                            ? "#93c5fd"
                            : "rgba(147,197,253,0.6)"
                        }
                        strokeWidth={selected === "mitral" ? "4" : "3"}
                      />
                    </g>
                    <text
                      x="260"
                      y="225"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Хоёр хавтаст
                    </text>

                    {/* Pulmonary Valve */}
                    <g
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                      onClick={() => setSelected("pulmonary")}
                    >
                      <path
                        d="M100 290 Q120 300 100 310"
                        fill="none"
                        stroke={
                          selected === "pulmonary"
                            ? "#fca5a5"
                            : "rgba(252,165,165,0.6)"
                        }
                        strokeWidth={selected === "pulmonary" ? "4" : "3"}
                      />
                      <path
                        d="M120 290 Q140 300 120 310"
                        fill="none"
                        stroke={
                          selected === "pulmonary"
                            ? "#fca5a5"
                            : "rgba(252,165,165,0.6)"
                        }
                        strokeWidth={selected === "pulmonary" ? "4" : "3"}
                      />
                      <path
                        d="M140 290 Q160 300 140 310"
                        fill="none"
                        stroke={
                          selected === "pulmonary"
                            ? "#fca5a5"
                            : "rgba(252,165,165,0.6)"
                        }
                        strokeWidth={selected === "pulmonary" ? "4" : "3"}
                      />
                    </g>
                    <text
                      x="120"
                      y="325"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Уушги
                    </text>

                    {/* Aortic Valve */}
                    <g
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                      onClick={() => setSelected("aortic")}
                    >
                      <path
                        d="M260 290 Q280 300 260 310"
                        fill="none"
                        stroke={
                          selected === "aortic"
                            ? "#93c5fd"
                            : "rgba(147,197,253,0.6)"
                        }
                        strokeWidth={selected === "aortic" ? "4" : "3"}
                      />
                      <path
                        d="M280 290 Q300 300 280 310"
                        fill="none"
                        stroke={
                          selected === "aortic"
                            ? "#93c5fd"
                            : "rgba(147,197,253,0.6)"
                        }
                        strokeWidth={selected === "aortic" ? "4" : "3"}
                      />
                      <path
                        d="M300 290 Q320 300 300 310"
                        fill="none"
                        stroke={
                          selected === "aortic"
                            ? "#93c5fd"
                            : "rgba(147,197,253,0.6)"
                        }
                        strokeWidth={selected === "aortic" ? "4" : "3"}
                      />
                    </g>
                    <text
                      x="280"
                      y="325"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      className="pointer-events-none"
                    >
                      Аорт
                    </text>

                    {/* Blood flow arrows */}
                    {selected && (
                      <>
                        {selected === "ra" && (
                          <path
                            d="M120 190 L120 210"
                            stroke="#ef4444"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                        {selected === "la" && (
                          <path
                            d="M280 190 L280 210"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                        {selected === "rv" && (
                          <path
                            d="M120 295 L120 315"
                            stroke="#ef4444"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                        {selected === "lv" && (
                          <path
                            d="M280 295 L280 315"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                        {selected === "venaCava" && (
                          <path
                            d="M80 140 L100 140"
                            stroke="#ef4444"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                        {selected === "pulmonaryVein" && (
                          <path
                            d="M280 140 L260 140"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                        {selected === "pulmonaryArtery" && (
                          <path
                            d="M80 260 L60 260"
                            stroke="#ef4444"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                        {selected === "aorta" && (
                          <path
                            d="M320 260 L340 260"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        )}
                      </>
                    )}

                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="currentColor"
                        />
                      </marker>
                    </defs>
                  </svg>

                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span>Хүчилтөрөгч багатай</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>Хүчилтөрөгчтэй</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-pink-400"></div>
                      <span>Хавхлага</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-gradient-to-r from-red-500 to-blue-500 rounded"></div>
                      <span>Судсууд</span>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-[1.75rem] border border-white/10 bg-black/70 p-6 text-left shadow-xl shadow-slate-950/20">
                  {selected ? (
                    <>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Сонгосон хэсэг
                      </p>
                      <p className="mt-4 text-2xl font-semibold text-white">
                        {parts[selected]}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400">
                      Цусны эргэлтийн үүргийг харахын тулд хэсэг дээр дарна уу.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-purple-500/5 backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  🔁 Цусны бүрэн эргэлтийн зам
                </h2>
                <p className="mt-3 max-w-2xl text-slate-400">
                  Биеэр цус хэрхэн хөдөлдөгийг зөөлөн хөдөлгөөнт дүрслэлээр
                  харуулсан гарын авлага.
                </p>
              </div>
              <div className="rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10">
                Зөөлөн хөдөлгөөн идэвхтэй
              </div>
            </div>

            <div
              className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-xl shadow-slate-950/20"
              style={{ minHeight: "400px" }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold mb-6 text-white">
                  Цусны эргэлтийн зам
                </h3>

                {/* Simple animated loop diagram */}
                <div className="relative w-80 h-80">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Heart */}
                    <circle cx="100" cy="100" r="20" fill="#ef4444" />

                    {/* Lungs */}
                    <circle cx="60" cy="60" r="12" fill="#60a5fa" />
                    <circle cx="140" cy="60" r="12" fill="#60a5fa" />

                    {/* Body */}
                    <circle cx="100" cy="170" r="15" fill="#22c55e" />

                    {/* Flow paths */}
                    <path
                      d="M100 170 Q100 130 100 100"
                      stroke="#22c55e"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M100 100 Q100 60 60 60"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M60 60 Q100 20 140 60"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M140 60 Q100 100 100 100"
                      stroke="#ef4444"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>

                  {/* Moving blood particle */}
                  <div
                    className="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse"
                    style={{
                      top: ["75%", "45%", "15%", "45%"][index],
                      left: ["47%", "47%", "27%", "67%"][index],
                      transition: "all 1.8s ease-in-out",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>

                <div className="mt-6 text-lg text-center text-white font-medium">
                  {steps[index]}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-purple-500/5 backdrop-blur-xl">
            <div className="mb-8">
              <span className="inline-flex rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">
                🫀 Алхамчилсан цагийн дараалал
              </span>
              <h2 className="mt-5 text-3xl font-semibold text-white">
                Цусны эргэлтийн дараалсан явц
              </h2>
              <p className="mt-3 max-w-3xl text-slate-400">
                Хүний биед цус хэрхэн эргэлддэгийг алхам алхмаар тайлбарласан
                хэсэг.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-red-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Биеэс хүчилтөрөгч багатай цус буцаж ирнэ
                  </h3>
                </div>
                <p className="mt-4 text-slate-300">
                  Биеийн эд эсүүд хүчилтөрөгчийг хэрэглэсний дараа цус “ядарсан”
                  байна. → Дээд ба доод хөндий венээр дамжин зүрхний баруун
                  тосгуурт орно.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-red-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Баруун тосгуураас баруун ховдол руу
                  </h3>
                </div>
                <p className="mt-4 text-slate-300">
                  Баруун тосгуур агших үед цус tricuspid valve-аар дамжин баруун
                  ховдол руу шилжинэ.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Уушгинд очиж шинэчлэгдэнэ
                  </h3>
                </div>
                <p className="mt-4 text-slate-300">
                  Баруун ховдол агших үед цус уушгины артериар дамжин уушгинд
                  очно. Нүүрсхүчлийн хий гадагшилж, хүчилтөрөгч шингэнэ.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Уушгиас зүрх рүү буцаж ирнэ
                  </h3>
                </div>
                <p className="mt-4 text-slate-300">
                  Хүчилтөрөгчтэй болсон цус уушгины венээр дамжин зүрхний зүүн
                  тосгуурт орно.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-sky-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
                    5
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Зүүн тосгуураас зүүн ховдол руу
                  </h3>
                </div>
                <p className="mt-4 text-slate-300">
                  Зүүн тосгуур агших үед цус mitral valve-аар дамжин зүүн ховдол
                  руу орно.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-sky-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
                    6
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Бүх биед тараана
                  </h3>
                </div>
                <p className="mt-4 text-slate-300">
                  Зүүн ховдол хамгийн хүчтэй тасалдаг. Агших үед цусыг аортаар
                  дамжуулан бүх бие рүү шахна.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
                    7
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Дахин давтагдана
                  </h3>
                </div>
                <p className="mt-4 text-slate-300">
                  Цус хүчилтөрөгчөө ашиглаж, нүүрсхүчлийн хийтэй болж 1-р алхам
                  руу буцна. Энэ нь тасралтгүй эргэлт.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/70 p-6 text-slate-300 shadow-xl shadow-slate-950/20">
              <p className="text-white font-semibold">Хялбар ойлгох арга</p>
              <p className="mt-2">Зүрх → Уушги → Зүрх → Бие → Зүрх</p>
              <p className="mt-3 text-slate-400">
                Бага эргэлт = Зүрх ↔ Уушги | Их эргэлт = Зүрх ↔ Бие
              </p>
            </div>

            <PhysicsSimulation />
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-red-500/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">🔄</span>
                Цусны их эргэлт ба бага эргэлт
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Хүний цусны эргэлт нь зүрхээр дамжин бүх биеэр цусыг зөөвөрлөдөг
                хоёр үндсэн хэсэгтэй: бага эргэлт (уушгины эргэлт) ба их эргэлт
                (биеийн эргэлт).
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[1.75rem] border border-blue-500/20 bg-gradient-to-br from-blue-950/50 to-blue-900/30 p-6 shadow-lg shadow-blue-500/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-300 text-sm">🫁</span>
                    </div>
                    <h3 className="text-xl font-semibold text-blue-200">
                      1. Цусны бага эргэлт (уушгины эргэлт)
                    </h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Энэ нь цусыг зүрхнээс уушги руу, дараа нь буцаан зүрх рүү
                    зөөвөрлөдөг эргэлт юм. Баруун ховдлоос хүчилтөрөгч багатай
                    цус уушгинд очиж, тэнд хүчилтөрөгчөөр баяжигдан нүүрсхүчлийн
                    хий гадагшилна. Дараа нь энэ хүчилтөрөгчөөр баялаг цус зүүн
                    тосгуурт буцаж ирдэг.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm">
                    <span>🔵</span>
                    <span>Хий солилцоо</span>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-red-500/20 bg-gradient-to-br from-red-950/50 to-red-900/30 p-6 shadow-lg shadow-red-500/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-300 text-sm">❤️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-red-200">
                      2. Цусны их эргэлт (биеийн эргэлт)
                    </h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Энэ нь зүрхнээс бүх биеийн эд эрхтнүүд рүү хүчилтөрөгчөөр
                    баялаг цус түгээж, дараа нь буцааж зүрх рүү авч ирдэг эргэлт
                    юм. Зүүн ховдлоос цус аортаар дамжин бүх биед тархаж, эд
                    эсүүдийг хүчилтөрөгч, шим тэжээлээр хангана. Дараа нь
                    хүчилтөрөгч багатай цус баруун тосгуурт буцаж ирдэг.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                    <span>🔴</span>
                    <span>Шим тэжээл хүргэх</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-gradient-to-r from-slate-900/80 via-black/70 to-slate-900/80 p-6 text-slate-300 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
                <p className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">👉</span>
                  Товчхондоо:
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-950/30 border border-blue-500/20">
                    <span className="text-blue-300">🔄</span>
                    <div>
                      <p className="text-blue-200 font-medium">Бага эргэлт</p>
                      <p className="text-slate-400 text-sm">
                        зүрх ↔ уушги (хий солилцоо)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-950/30 border border-red-500/20">
                    <span className="text-red-300">🔄</span>
                    <div>
                      <p className="text-red-200 font-medium">Их эргэлт</p>
                      <p className="text-slate-400 text-sm">
                        зүрх ↔ бүх бие (шим тэжээл, хүчилтөрөгч хүргэх)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400 shadow-2xl shadow-purple-500/5 backdrop-blur-xl">
            <p className="text-sm mb-4">
              Хөдөлгөөн, өнгө, жигд шилжилт бүхий гүнзгий биологийн сургалтад
              зориулсан дизайн.
            </p>
            <button
              onClick={() => setShowTeam(!showTeam)}
              className="rounded-full bg-slate-800/50 px-6 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors border border-white/10"
            >
              {showTeam ? "Нуух" : "Багийн гишүүд"}
            </button>
            {showTeam && (
              <div className="mt-6 grid gap-2 text-sm text-slate-300">
                <p className="font-semibold text-white">Багийн гишүүд:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Zorigtbaatar (Удирдагч)</li>
                  <li>Irmuun</li>
                  <li>Amina</li>
                  <li>Nomin</li>
                  <li>Nomin-Erdene</li>
                  <li>Nymzul</li>
                </ul>
              </div>
            )}
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes bloodFlow {
          0% { transform: translateX(0); opacity: 0.9; }
          100% { transform: translateX(900px); opacity: 0.2; }
        }

        @keyframes flowCell {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          50% { transform: translateX(600px) scale(1.1); opacity: 0.8; }
          100% { transform: translateX(1200px) scale(0.95); opacity: 0.2; }
        }
        .animate-flow-cell {
          animation: flowCell 6.5s linear infinite;
          will-change: transform, opacity;
        }

        @keyframes pathDot {
          0% { transform: translate(0, 0); opacity: 0.95; }
          25% { transform: translate(220px, 0); opacity: 0.8; }
          50% { transform: translate(220px, 120px); opacity: 0.6; }
          75% { transform: translate(0, 120px); opacity: 0.4; }
          100% { transform: translate(0, 0); opacity: 0.95; }
        }
        .animate-path-dot {
          animation: pathDot 6s ease-in-out infinite;
        }

        @keyframes circulationFlow {
          0% { transform: translate(0, 320px) scale(1); opacity: 1; }
          12.5% { transform: translate(-15, 200px) scale(1.1); opacity: 0.9; }
          25% { transform: translate(-45, 125px) scale(1); opacity: 0.8; }
          37.5% { transform: translate(15, 125px) scale(1.1); opacity: 0.9; }
          50% { transform: translate(15, 200px) scale(1); opacity: 0.8; }
          62.5% { transform: translate(0, 320px) scale(1.1); opacity: 0.9; }
          75% { transform: translate(0, 320px) scale(1); opacity: 0.7; }
          87.5% { transform: translate(0, 320px) scale(0.9); opacity: 0.5; }
          100% { transform: translate(0, 320px) scale(1); opacity: 1; }
        }
        .animate-circulation-flow {
          animation: circulationFlow 16s linear infinite;
          will-change: transform, opacity;
        }

        @keyframes circulationPath {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          10% { transform: translate(0, 30px) scale(1.1); opacity: 0.9; }
          20% { transform: translate(-50px, 60px) scale(1); opacity: 0.8; }
          30% { transform: translate(-80px, 90px) scale(0.9); opacity: 0.7; }
          40% { transform: translate(-60px, 120px) scale(1); opacity: 0.8; }
          50% { transform: translate(0, 120px) scale(1.1); opacity: 0.9; }
          60% { transform: translate(60px, 120px) scale(1); opacity: 0.8; }
          70% { transform: translate(80px, 90px) scale(0.9); opacity: 0.7; }
          80% { transform: translate(50px, 60px) scale(1); opacity: 0.8; }
          90% { transform: translate(0, 30px) scale(1.1); opacity: 0.9; }
          100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        .animate-circulation-path {
          animation: circulationPath 12s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
