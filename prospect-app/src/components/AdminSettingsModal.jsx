import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useProspectStore } from '../store';
import { deleteAllContactsSupabase } from '../services/supabaseContacts';
import { deleteAllCampaignsSupabase } from '../services/supabaseCampaigns';
import { deleteAllActionsSupabase } from '../services/supabaseActions';

export default function AdminSettingsModal({ onClose }) {
  const contacts = useProspectStore(s => s.contacts);
  const campaigns = useProspectStore(s => s.campaigns);
  const removeContact = useProspectStore(s => s.removeContact);
  const removeCampaign = useProspectStore(s => s.removeCampaign);
  const updateContact = useProspectStore(s => s.updateContact);
  const addNotification = useProspectStore(s => s.addNotification);

  const handleDeleteAllContacts = async () => {
    if (window.confirm('⚠️ Êtes-vous ABSOLUMENT SÛR de vouloir supprimer TOUS les contacts ? Cette action est irréversible !')) {
      const contactCount = contacts.length;
      
      // Vider localement
      contacts.forEach(c => removeContact(c.id));
      
      // Supprimer dans Supabase (1 requête)
      const success = await deleteAllContactsSupabase();
      
      if (success) {
        addNotification({
          type: 'error',
          message: `🗑️ ${contactCount} contact(s) supprimé(s) (Supabase)`,
          duration: 2000,
        });
      } else {
        addNotification({
          type: 'error',
          message: `❌ Erreur lors de la suppression`,
          duration: 2000,
        });
      }
    }
  };

  const handleDeleteAllCampaigns = async () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES les campagnes ? Cette action est irréversible !')) {
      const campaignCount = campaigns.length;
      
      // Vider localement
      campaigns.forEach(c => removeCampaign(c.id));
      
      // Supprimer dans Supabase (1 requête)
      const success = await deleteAllCampaignsSupabase();
      
      if (success) {
        addNotification({
          type: 'error',
          message: `📍 ${campaignCount} campagne(s) supprimée(s) (Supabase)`,
          duration: 2000,
        });
      } else {
        addNotification({
          type: 'error',
          message: `❌ Erreur lors de la suppression`,
          duration: 2000,
        });
      }
    }
  };

  const handleClearAllNextActions = () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES les relances ? Cette action est irréversible !')) {
      let count = 0;
      contacts.forEach(c => {
        if ((c.nextActions || []).length > 0) {
          count += c.nextActions.length;
          updateContact(c.id, { nextActions: [] });
        }
      });
      addNotification({
        type: 'error',
        message: `📅 ${count} relance(s) supprimée(s)`,
        duration: 2000,
      });
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('⚠️⚠️⚠️ ATTENTION : Ceci va RÉINITIALISER COMPLÈTEMENT l\'application ! Tous les données seront perdues de Supabase ET localement. Êtes-vous SÛR ?')) {
      // Supprimer de Supabase (3 requêtes en parallèle)
      await Promise.all([
        deleteAllContactsSupabase(),
        deleteAllCampaignsSupabase(),
        deleteAllActionsSupabase(),
      ]);
      
      // Effacer localement
      localStorage.clear();
      
      addNotification({
        type: 'error',
        message: '🧹 Application complètement réinitialisée',
        duration: 2000,
      });
      
      // Recharger après 1 sec
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-nocr text-white p-6 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="text-2xl font-bold">🔧 Paramètres</h2>
            <p className="text-white/80 text-sm">Outils d'administration</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:opacity-80 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            ⚠️ <strong>Attention :</strong> Les actions ci-dessous sont irréversibles
          </div>

          {/* Supprimer contacts */}
          <button
            onClick={handleDeleteAllContacts}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition text-left"
          >
            <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">🗑️ Supprimer tous les contacts</p>
              <p className="text-xs text-red-600">{contacts.length} contact(s)</p>
            </div>
          </button>

          {/* Supprimer campagnes */}
          <button
            onClick={handleDeleteAllCampaigns}
            className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-left"
          >
            <Trash2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-700">📍 Supprimer toutes les campagnes</p>
              <p className="text-xs text-orange-600">{campaigns.length} campagne(s)</p>
            </div>
          </button>

          {/* Supprimer relances */}
          <button
            onClick={handleClearAllNextActions}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-left"
          >
            <Trash2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-700">📅 Supprimer toutes les relances</p>
              <p className="text-xs text-blue-600">Vide les nextActions</p>
            </div>
          </button>

          {/* Réinitialiser */}
          <button
            onClick={handleResetAll}
            className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-left"
          >
            <Trash2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-700">🧹 Réinitialiser complètement</p>
              <p className="text-xs text-purple-600">Efface tout et recharge</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
