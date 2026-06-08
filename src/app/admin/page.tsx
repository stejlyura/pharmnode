"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  FileCode, 
  Database, 
  Lock, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Settings,
  Beaker,
  UserCheck,
  CheckCircle2,
  HardDrive
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DbUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  tariff: string;
  createdAt?: string;
}

interface DbRecipe {
  _id: string;
  userId: string;
  name: string;
  nodes: any[];
  connections: any[];
  updatedAt?: string;
}

interface DbIngredient {
  _id: string;
  userId: string;
  name: string;
  role: string;
  casNumber?: string;
  looseBulkDensity: number;
  tappedBulkDensity: number;
  costPerKgUsd: number;
  createdAt?: string;
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [recipes, setRecipes] = useState<DbRecipe[]>([]);
  const [ingredients, setIngredients] = useState<DbIngredient[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "recipes" | "ingredients">("users");
  const [selectedRecipe, setSelectedRecipe] = useState<DbRecipe | null>(null);

  // Check if already authenticated on client side
  useEffect(() => {
    const token = localStorage.getItem("pharmnode_admin_auth_token");
    if (token) {
      setIsAuthorized(true);
      fetchDatabaseData(token);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const authHeader = "Basic " + btoa(`${username}:${password}`);
      const response = await fetch("/api/admin/data", {
        headers: {
          "Authorization": authHeader
        }
      });

      if (response.ok) {
        localStorage.setItem("pharmnode_admin_auth_token", authHeader);
        setIsAuthorized(true);
        const data = await response.json();
        setDbStatus(data.databaseOnline);
        setUsers(data.users || []);
        setRecipes(data.recipes || []);
        setIngredients(data.customIngredients || []);
      } else {
        setLoginError("Неверный логин или пароль администратора.");
      }
    } catch (err) {
      setLoginError("Ошибка авторизации на сервере или соединения с базой.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pharmnode_admin_auth_token");
    setIsAuthorized(false);
    setUsers([]);
    setRecipes([]);
    setIngredients([]);
  };

  const fetchDatabaseData = async (token?: string) => {
    setLoading(true);
    try {
      const authHeader = token || localStorage.getItem("pharmnode_admin_auth_token");
      if (!authHeader) {
        handleLogout();
        return;
      }
      
      const response = await fetch("/api/admin/data", {
        headers: {
          "Authorization": authHeader
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDbStatus(data.databaseOnline);
        setUsers(data.users || []);
        setRecipes(data.recipes || []);
        setIngredients(data.customIngredients || []);
      } else {
        setLoginError("Ошибка авторизации на сервере. Пожалуйста, войдите снова.");
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to load admin databases:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
        
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-t-2xl" />
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-500/20">
              <Lock size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Вход в панель администратора</h2>
            <p className="text-xs text-zinc-500 mt-1">Требуется авторизация в системе PharmNode</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Имя пользователя</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {loginError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10.5px] text-red-400 flex items-start gap-1.5 leading-normal">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer mt-2"
            >
              Подтвердить вход
            </button>
          </form>

          <Link href="/" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft size={13} />
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />

      {/* Header Banner */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-40 sticky top-0 theme-element">
        <div className="flex items-center gap-3">
          <Link href="/configurator" className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            PN
          </Link>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>PharmNode Admin Portal</span>
              <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System Core
              </span>
            </h1>
            <span className="text-[10px] text-zinc-500 block leading-tight">Database Viewer & Control Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <button
            onClick={() => fetchDatabaseData()}
            title="Обновить базы данных"
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Control Content Dashboard */}
      <main className="max-w-7xl w-full mx-auto p-6 flex-1 flex flex-col gap-6 relative z-10">
        
        {/* Connection status header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Card: DB Online */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              dbStatus 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              <HardDrive size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">MongoDB Connection</span>
              <span className={`text-xs font-bold block mt-0.5 ${dbStatus ? "text-emerald-400" : "text-amber-400"}`}>
                {dbStatus ? "ONLINE (Live Database)" : "SIMULATED (Offline Mode)"}
              </span>
            </div>
          </div>

          {/* Card: Users count */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Всего Пользователей</span>
              <span className="text-lg font-extrabold font-mono text-zinc-200 block leading-tight">
                {users.length}
              </span>
            </div>
          </div>

          {/* Card: Recipes count */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FileCode size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Сохранено Рецептур</span>
              <span className="text-lg font-extrabold font-mono text-zinc-200 block leading-tight">
                {recipes.length}
              </span>
            </div>
          </div>

          {/* Card: Ingredients count */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
              <Beaker size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Свой ингредиенты</span>
              <span className="text-lg font-extrabold font-mono text-zinc-200 block leading-tight">
                {ingredients.length}
              </span>
            </div>
          </div>
        </div>

        {/* Database Collections Tabs */}
        <div className="flex border-b border-zinc-900">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "users" 
                ? "border-indigo-500 text-indigo-400" 
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Users Collection ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("recipes")}
            className={`px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "recipes" 
                ? "border-indigo-500 text-indigo-400" 
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Recipes Collection ({recipes.length})
          </button>
          <button
            onClick={() => setActiveTab("ingredients")}
            className={`px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "ingredients" 
                ? "border-indigo-500 text-indigo-400" 
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            CustomIngredients ({ingredients.length})
          </button>
        </div>

        {/* Collections Viewer Panel */}
        <div className="flex-1 min-h-[400px]">
          {loading ? (
            <div className="h-full flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border border-zinc-800 border-t-indigo-500 animate-spin" />
            </div>
          ) : activeTab === "users" ? (
            /* Users Collection Table */
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Tariff Tier</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4">User ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 italic">Пользователи не найдены в базе данных</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {u.image ? (
                                <img src={u.image} alt={u.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-800" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                                  <UserCheck size={14} />
                                </div>
                              )}
                              <span className="font-semibold text-zinc-200">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-zinc-400">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              u.tariff === "enterprise" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : u.tariff === "professional"
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700/50"
                            }`}>
                              {u.tariff}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-500 font-mono">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="p-4 text-[10px] font-mono text-zinc-600 select-all">{u._id}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "recipes" ? (
            /* Recipes Collection Table */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left recipes list */}
              <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <th className="p-4">Formula / Recipe Name</th>
                        <th className="p-4">Owner ID</th>
                        <th className="p-4">Layout Data</th>
                        <th className="p-4">Updated At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {recipes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-zinc-500 italic">Рецепты не найдены в базе данных</td>
                        </tr>
                      ) : (
                        recipes.map((r) => (
                          <tr 
                            key={r._id} 
                            onClick={() => setSelectedRecipe(r)}
                            className={`hover:bg-white/5 transition-colors cursor-pointer ${
                              selectedRecipe?._id === r._id ? "bg-indigo-500/5 border-l-2 border-l-indigo-500" : ""
                            }`}
                          >
                            <td className="p-4">
                              <span className="font-bold text-zinc-200 block">{r.name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono block select-all mt-0.5">{r._id}</span>
                            </td>
                            <td className="p-4 font-mono text-[10px] text-zinc-500 select-all">{r.userId}</td>
                            <td className="p-4 text-zinc-400">
                              <span className="block font-mono text-[10px]">
                                {r.nodes?.length || 0} нод • {r.connections?.length || 0} связей
                              </span>
                            </td>
                            <td className="p-4 text-zinc-500 font-mono">
                              {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right JSON viewer */}
              <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                  <h3 className="font-bold text-xs text-zinc-300 flex items-center gap-1.5">
                    <FileCode size={14} className="text-indigo-400" />
                    Редактор Схемы (JSON Schema Viewer)
                  </h3>
                  {selectedRecipe && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                      {selectedRecipe.name.slice(0, 20)}...
                    </span>
                  )}
                </div>

                {selectedRecipe ? (
                  <pre className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-lg text-[10px] font-mono text-zinc-400 overflow-auto max-h-[420px] select-text whitespace-pre-wrap leading-normal">
                    {JSON.stringify(
                      {
                        _id: selectedRecipe._id,
                        userId: selectedRecipe.userId,
                        name: selectedRecipe.name,
                        nodes: selectedRecipe.nodes,
                        connections: selectedRecipe.connections
                      },
                      null,
                      2
                    )}
                  </pre>
                ) : (
                  <div className="py-24 text-center text-zinc-500 italic text-xs flex flex-col items-center gap-2">
                    <Database size={20} className="text-zinc-700" />
                    <span>Выберите рецептуру слева для просмотра структуры холста</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Custom Ingredients Table */
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Ingredient Name</th>
                      <th className="p-4">CAS Number</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Bulk Densities</th>
                      <th className="p-4">Cost/kg</th>
                      <th className="p-4">Owner User ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {ingredients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 italic">Пользовательские ингредиенты не обнаружены</td>
                      </tr>
                    ) : (
                      ingredients.map((ing) => (
                        <tr key={ing._id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-zinc-200">{ing.name}</td>
                          <td className="p-4 font-mono text-zinc-400">{ing.casNumber || "N/A"}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-800 border border-zinc-700 text-zinc-400">
                              {ing.role}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-300 font-mono">
                            {ing.looseBulkDensity.toFixed(2)} → {ing.tappedBulkDensity.toFixed(2)} g/mL
                          </td>
                          <td className="p-4 text-emerald-400 font-bold font-mono">
                            ${ing.costPerKgUsd.toFixed(2)}
                          </td>
                          <td className="p-4 text-[10px] font-mono text-zinc-500 select-all">{ing.userId}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 px-6 bg-zinc-950/80 backdrop-blur-md text-xs text-zinc-500 text-center mt-auto theme-element">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Beaker size={14} className="text-zinc-500" />
            <span>PharmNode Admin Console &copy; 2026</span>
          </div>
          <Link href="/configurator" className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-semibold">
            Вернуться в студию
            <ArrowLeft size={12} className="rotate-180" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
