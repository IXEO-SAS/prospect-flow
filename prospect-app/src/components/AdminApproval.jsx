import React from 'react';
import { useProspectStore } from '../store';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';

export default function AdminApproval() {
  const users = useProspectStore(s => s.users);
  const approveUser = useProspectStore(s => s.approveUser);
  const rejectUser = useProspectStore(s => s.rejectUser);
  const addNotification = useProspectStore(s => s.addNotification);

  // Séparer les comptes
  const pendingUsers = users.filter(u => u.approvalStatus === 'pending');
  const approvedUsers = users.filter(u => u.approvalStatus === 'approved');
  const rejectedUsers = users.filter(u => u.approvalStatus === 'rejected');

  const handleApprove = (userId) => {
    approveUser(userId);
    const user = users.find(u => u.id === userId);
    addNotification({
      type: 'success',
      message: `✅ Compte "${user?.name}" approuvé`,
      duration: 2000,
    });
  };

  const handleReject = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir rejeter ce compte ?')) {
      rejectUser(userId);
      const user = users.find(u => u.id === userId);
      addNotification({
        type: 'error',
        message: `❌ Compte "${user?.name}" rejeté`,
        duration: 2000,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">🔐 Gestion des Approbations</h2>
        <p className="text-gray-600 text-sm">Approbation des nouveaux comptes utilisateur</p>
      </div>

      {/* COMPTES EN ATTENTE */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-yellow-900">
            En attente d'approbation
          </h3>
          <span className="ml-auto bg-yellow-600 text-white rounded-full px-3 py-1 text-sm font-semibold">
            {pendingUsers.length}
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <p className="text-yellow-700 text-sm">Aucun compte en attente</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div
                key={user.id}
                className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Rôle : <span className="font-semibold">{user.role === 'manager' ? '👨‍💼 Manager' : '👤 Commercial'}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPTES APPROUVÉS */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-green-900">
            Comptes approuvés
          </h3>
          <span className="ml-auto bg-green-600 text-white rounded-full px-3 py-1 text-sm font-semibold">
            {approvedUsers.length}
          </span>
        </div>

        {approvedUsers.length === 0 ? (
          <p className="text-green-700 text-sm">Aucun compte approuvé</p>
        ) : (
          <div className="space-y-2">
            {approvedUsers.map(user => (
              <div key={user.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                  ✅ Actif
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPTES REJETÉS */}
      {rejectedUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-red-900">
              Comptes rejetés
            </h3>
            <span className="ml-auto bg-red-600 text-white rounded-full px-3 py-1 text-sm font-semibold">
              {rejectedUsers.length}
            </span>
          </div>

          <div className="space-y-2">
            {rejectedUsers.map(user => (
              <div key={user.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                  ❌ Rejeté
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RÉSUMÉ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{pendingUsers.length}</p>
          <p className="text-sm text-yellow-700 font-semibold mt-1">En attente</p>
        </div>
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{approvedUsers.length}</p>
          <p className="text-sm text-green-700 font-semibold mt-1">Approuvés</p>
        </div>
        <div className="bg-red-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{rejectedUsers.length}</p>
          <p className="text-sm text-red-700 font-semibold mt-1">Rejetés</p>
        </div>
      </div>
    </div>
  );
}
