import React, { useState } from 'react';
import { useProspectStore } from '../store';
import { Plus } from 'lucide-react';

// Générateur d'ID IDENTIQUE au store
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function AddCommercialForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'commercial',
    password: '',
  });

  const addUser = useProspectStore(s => s.addUser);
  const addNotification = useProspectStore(s => s.addNotification);

  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      addNotification({
        type: 'error',
        message: 'Remplissez tous les champs',
        duration: 2000,
      });
      return;
    }

    const newUser = {
      id: generateId(),
      email: formData.email,
      name: formData.name,
      role: formData.role,
      password: formData.password,
      color: colors[Math.floor(Math.random() * colors.length)],
      permissions: formData.role === 'manager' 
        ? ['create', 'read', 'update', 'delete'] 
        : ['create', 'read', 'update'],
    };

    addUser(newUser);

    addNotification({
      type: 'success',
      message: `${formData.name} (${formData.role}) ajouté à l'équipe`,
      duration: 2000,
    });

    setFormData({ name: '', email: '', role: 'commercial', password: '' });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ex: Marie Dupont"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="marie@ixeo.fr"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Rôle
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="commercial">Commercial</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mot de passe
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="ex: SecurePass123"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
