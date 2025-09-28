// src/components/ProxyFormatter.jsx
"use client";
import { useEffect, useMemo, useState } from "react";

const LS_KEY = "pf_label"; // clave para guardar el nombre en localStorage

export default function ProxyFormatter() {
  const [rawInput, setRawInput] = useState("");
  const [items, setItems] = useState([]); // [{label:"USA 1", url:"http://..."}, ...]
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(""); // id temporal de lo copiado
  const [namePrefix, setNamePrefix] = useState("USA"); // nombre editable (por defecto USA)

  // Cargar nombre desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved != null) setNamePrefix(saved);
    } catch {}
  }, []);

  const canCopy = typeof navigator !== "undefined" && !!navigator.clipboard;

  const formatProxies = (input) => {
    const lines = input.split(/\r?\n/);
    const seen = new Set();
    const proxies = [];

    const ipv4 = String.raw`(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)`;
    const ipPort = new RegExp(`(${ipv4}):(\\d{2,5})`);

    for (const line of lines) {
      const m = line.match(ipPort);
      if (!m) continue;
      const ip = m[1];
      const port = m[2];
      if (port !== "50100") continue; // descartar 50101 u otros
      const key = `${ip}:${port}`;
      if (!seen.has(key)) {
        seen.add(key);
        proxies.push(key);
      }
    }

    const top = proxies.slice(0, 25);
    if (top.length === 0) return [];

    const prefix = (namePrefix?.trim() || "USA").toString();
    return top.map((ipport, idx) => ({
      label: `${prefix} ${idx + 1}`,
      url: `http://${ipport}`,
    }));
  };

  const handleGenerate = () => {
    setError("");
    // Persistir nombre en localStorage (reemplaza el anterior por el actual)
    try {
      localStorage.setItem(LS_KEY, namePrefix ?? "USA");
    } catch {}

    const arr = formatProxies(rawInput);
    if (arr.length === 0) {
      setItems([]);
      setError("No se encontraron proxys con puerto 50100.");
      return;
    }
    setItems(arr);
  };

  const copy = async (text, key) => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 900);
    } catch {}
  };

  const fullOutput = useMemo(() => {
    if (!items.length) return "";
    return items.map((it) => `${it.label}\n${it.url}`).join("\n\n");
  }, [items]);

  const handleCopyAll = async () => copy(fullOutput, "__all__");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Entrada */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">Entrada</h2>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Pega aquí tu lista completa de proxys..."
          className="w-full h-80 p-3 border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Generar
          </button>
          <button
            onClick={() => { setRawInput(""); setItems([]); setError(""); setCopiedKey(""); }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
          >
            Limpiar
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>
        )}
      </div>

      {/* Salida */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        {/* Campo de nombre arriba del resultado */}
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="labelName">
          Nombre para numeración
        </label>
        <div className="flex items-center gap-2 mb-4">
          <input
            id="labelName"
            type="text"
            value={namePrefix}
            onChange={(e) => setNamePrefix(e.target.value)}
            placeholder="USA"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-500">Se guarda al generar</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Salida</h2>
          <button
            onClick={handleCopyAll}
            disabled={!items.length}
            className="text-sm px-3 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40"
          >
            {copiedKey === "__all__" ? "Copiado!" : "Copiar todo"}
          </button>
        </div>

        {!items.length ? (
          <p className="text-slate-500 text-sm">El resultado aparecerá aquí…</p>
        ) : (
          <ol className="space-y-3">
            {items.map((it) => (
              <li key={it.label} className="border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium break-all">{it.label}</div>
                  <button
                    onClick={() => copy(it.label, `L:${it.label}`)}
                    className="text-xs px-2 py-1 rounded-md bg-slate-100 border border-slate-300 hover:bg-slate-200"
                  >
                    {copiedKey === `L:${it.label}` ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <code className="text-sm break-all">{it.url}</code>
                  <button
                    onClick={() => copy(it.url, `U:${it.url}`)}
                    className="text-xs px-2 py-1 rounded-md bg-slate-100 border border-slate-300 hover:bg-slate-200"
                  >
                    {copiedKey === `U:${it.url}` ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* Output crudo opcional */}
        {items.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-slate-600">Ver como texto crudo</summary>
            <pre className="mt-2 p-3 border border-slate-200 rounded-lg bg-slate-50 text-sm whitespace-pre-wrap">
              {fullOutput}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
