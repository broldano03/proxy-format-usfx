// src/app/page.jsx
import ProxyFormatter from "../components/ProxyFormatter";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Formateador de Proxys
        </h1>
        <p className="text-center text-slate-600 mb-10">
          Pega tu lista de proxys completa en el formato usuario:contraseña@ip:port; se eliminan las de <code>:50101</code> y se formatea a <strong>EU n</strong> + <strong>http://ip:port</strong>.
        </p>
        <ProxyFormatter />
      </div>
    </main>
  );
}
