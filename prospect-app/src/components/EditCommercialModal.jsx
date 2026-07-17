import React, { useState } from 'react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useProspectStore } from '../store';
import { supabase } from '../supabaseClient';

export default function EditCommercialModal({ commercial, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: commercial?.name || '',
    email: commercial?.email || '',
    password: '', // Optionnel
    color: commercial?.color || '#3b82f6',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addNotification = useProspectStore(s => s.addNotification);

  // Prédéfinis de couleurs pour le macaron
  const colorOptions = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#6b7280', // Gray
    '#1f2937', // Dark
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color,
    }));
  };

  const handleSave = async () => {
    // Validations
    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return;
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Email invalide');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ Préparer les données pour Supabase
      const updateData = {
        name: formData.name,
        email: formData.email,
        color: formData.color,
      };

      // Ajouter le password seulement s'il y a une nouvelle valeur
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      // ✅ METTRE À JOUR DANS SUPABASE
      const { error: supabaseError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', commercial.id);

      if (supabaseError) {
        throw supabaseError;
      }

      // ✅ LE REALTIME SUPABASE METTRA À JOUR LE STORE AUTOMATIQUEMENT !
      // Pas besoin d'appeler updateUserInStore

      setSuccess('Commercial mis à jour avec succès ! ✅');
      addNotification({
        type: 'success',
        message: `${formData.name} a été mis à jour`,
        duration: 2000,
      });

      // Fermer après 1s
      setTimeout(() => {
        onSave?.();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour :', err);
      setError(`Erreur : ${err.message || 'Impossible de mettre à jour'}`);
      addNotification({
        type: 'error',
        message: 'Erreur lors de la mise à jour',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 sticky top-0 flex justify-between items-center">
          <h2 className="text-xl font-bold">✏️ Éditer {commercial?.name}</h2>
          <button onClick={onClose} className="hover:opacity-80 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Messages d'erreur/succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Champ Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Jean Dupont"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Champ Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (adresse de connexion)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ex: jean@ixeo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Champ Mot de passe (optionnel) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nouveau mot de passe (optionnel)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Laisser vide pour garder l'actuel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Laisser vide pour ne pas changer le mot de passe
            </p>
          </div>

          {/* Sélecteur de couleur */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Couleur du macaron
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-10 h-10 rounded-full transition-all border-2 ${
                    formData.color === color
                      ? 'border-gray-900 shadow-lg scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-sm text-gray-600">Aperçu :</p>
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: formData.color }}
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
