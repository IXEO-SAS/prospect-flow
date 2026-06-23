import React, { useState } from 'react';
import { useProspectStore } from '../store';
import { Users, LogIn, CheckCircle, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '../config';
import logoIxeo from '../assets/logo-ixeo.png';

let idCounter = Date.now();
const generateId = () => ++idCounter + Math.floor(Math.random() * 1000);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('commercial');
  const [loginMode, setLoginMode] = useState('login');
  const [signupMessage, setSignupMessage] = useState(''); // NOUVEAU
  
  const setCurrentUser = useProspectStore(s => s.setCurrentUser);
  const addUser = useProspectStore(s => s.addUser);
  const users = useProspectStore(s => s.users);

  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (loginMode === 'login') {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Email ou mot de passe incorrect');
        return;
      }
      
      // Vérifier l'approbation
      if (APP_CONFIG.requireApproval && user.approvalStatus !== 'approved') {
        alert(`❌ Compte en attente d'approbation par l'administrateur`);
        return;
      }
      
      setCurrentUser(user);
    } else {
      // SIGNUP
      if (!name || !email || !password) {
        alert('Remplissez tous les champs');
        return;
      }
      
      // Vérifier que l'email n'existe pas déjà
      if (users.find(u => u.email === email)) {
        alert('❌ Cet email est déjà utilisé');
        return;
      }
      
      const newUser = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        password,
        role,
        color: colors[Math.floor(Math.random() * colors.length)],
        approvalStatus: 'pending', // ✅ IMPORTANT : toujours pending
        permissions: role === 'manager' 
          ? ['create', 'read', 'update', 'delete'] 
          : ['create', 'read', 'update'],
      };
      
      // ✅ Envoyer directement à Supabase (addUser fait le reste)
      addUser(newUser);
      
      // Message de confirmation
      setSignupMessage(`✅ Inscription réussie ! En attente d'approbation par l'administrateur`);
      setEmail('');
      setPassword('');
      setName('');
    }
  };

  const handleQuickLogin = (exampleUser) => {
    setCurrentUser(exampleUser);
  };

  return (
    <div className="min-h-screen bg-gradient-nocr flex items-center justify-center p-4 relative">
      {/* Logo IXEO top right */}
      <div className="absolute top-4 right-4">
        <img src={logoIxeo} alt="IXEO Logo" className="h-12 object-contain" />
      </div>

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ProspectFlow</h1>
          <p className="text-white/80">Campagnes de prospection</p>
        </div>

        {/* Message inscription réussie */}
        {signupMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">{signupMessage}</p>
              <p className="text-xs text-green-700 mt-1">Vous recevrez un email quand votre compte sera approuvé</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('login');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                loginMode === 'login'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('signup');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                loginMode === 'signup'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom (signup only) */}
            {loginMode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@ixeo.fr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Role (signup only) */}
            {loginMode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="commercial">Commercial</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition font-semibold flex items-center justify-center gap-2 mt-6"
            >
              <LogIn className="w-5 h-5" />
              {loginMode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>

        {/* Separator & Demo Buttons */}
        {APP_CONFIG.showDemoButtons && (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-nocr text-white/70">ou</span>
              </div>
            </div>

            {/* Demo Rapide */}
            <div className="space-y-2">
              <p className="text-xs text-white/70 text-center mb-3">Démo rapide :</p>
              {[
                { name: 'Marie (Commercial)', role: 'commercial', email: 'marie@ixeo.fr', password: 'marie123' },
                { name: 'Luc (Manager)', role: 'manager', email: 'luc@ixeo.fr', password: 'luc123' },
              ].map((u) => (
                <button
                  key={u.email}
                  onClick={() => {
                    handleQuickLogin({
                      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${u.email}`,
                      email: u.email,
                      name: u.name,
                      role: u.role,
                      password: u.password,
                      color: u.role === 'commercial' ? '#06b6d4' : '#8b5cf6',
                      approvalStatus: 'approved', // Auto approuvé en démo
                      permissions: u.role === 'manager'
                        ? ['create', 'read', 'update', 'delete']
                        : ['create', 'read', 'update'],
                    });
                  }}
                  className="w-full px-4 py-2 border border-white/30 rounded-lg hover:bg-white/10 text-sm text-white transition"
                >
                  {u.name}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-white/70 text-sm mt-6">
          {APP_CONFIG.isDevelopment ? '🧪 Mode Dev • Démo activée' : '🚀 Mode Production'}
        </p>
      </div>
    </div>
  );
}
