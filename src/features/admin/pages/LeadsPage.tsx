import { useState } from 'react';
import { Search, Download, ChevronDown, ChevronUp, Trash2, Phone, Mail, Building2, DollarSign, StickyNote, Calendar } from 'lucide-react';

type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';

interface Lead {
  id: string;
  name: string;
  phone: string;
  restaurantName: string;
  email?: string;
  selectedPackage?: string;
  packagePrice?: number;
  status: LeadStatus;
  notes?: string;
  created: string;
  visitCount?: number;
}

interface LeadsPageProps {
  leads: Lead[];
  onUpdate: (id: string, data: Partial<Lead>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contactado', color: 'bg-yellow-100 text-yellow-700' },
  converted: { label: 'Convertido', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-500' },
};

const statusOptions: LeadStatus[] = ['new', 'contacted', 'converted', 'closed'];

export const LeadsPage = ({ leads, onUpdate, onDelete }: LeadsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleNotes = (id: string) => {
    const next = new Set(expandedNotes);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedNotes(next);
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await onUpdate(id, { status });
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Restaurant', 'Email', 'Package', 'Price', 'Status', 'Notes', 'Created'];
    const rows = filteredLeads.map((lead) => [
      `"${lead.name}"`,
      `"${lead.phone}"`,
      `"${lead.restaurantName}"`,
      `"${lead.email || ''}"`,
      `"${lead.selectedPackage || ''}"`,
      lead.packagePrice?.toString() || '',
      lead.status,
      `"${(lead.notes || '').replace(/"/g, '""')}"`,
      lead.created,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatMoney = (amount?: number) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">
            {leads.length} total{leads.filter((l) => l.status === 'new').length > 0 && ` · ${leads.filter((l) => l.status === 'new').length} nuevos`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#7C3AED' }}
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o restaurante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">Todos los estados</option>
          <option value="new">Nuevos</option>
          <option value="contacted">Contactados</option>
          <option value="converted">Convertidos</option>
          <option value="closed">Cerrados</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurante</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquete</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.map((lead) => {
              const status = statusConfig[lead.status];
              return (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    {lead.email && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {lead.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-gray-700">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {lead.restaurantName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {lead.selectedPackage || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {formatMoney(lead.packagePrice)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${status.color}`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {statusConfig[opt].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lead.created)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {lead.notes && (
                        <button
                          onClick={() => toggleNotes(lead.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title={expandedNotes.has(lead.id) ? 'Ocultar notas' : 'Ver notas'}
                        >
                          <StickyNote className={`w-4 h-4 ${expandedNotes.has(lead.id) ? 'text-purple-600' : 'text-gray-400'}`} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(lead.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    {expandedNotes.has(lead.id) && lead.notes && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border">
                        {lead.notes}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron leads</p>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredLeads.map((lead) => {
          const status = statusConfig[lead.status];
          return (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                  <p className="text-sm text-gray-600">{lead.restaurantName}</p>
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                  className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${status.color}`}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {statusConfig[opt].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {lead.phone}
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  {formatMoney(lead.packagePrice)}
                </span>
                {lead.selectedPackage && (
                  <span className="text-gray-600 col-span-2">
                    {lead.selectedPackage}
                  </span>
                )}
              </div>

              {lead.notes && (
                <div>
                  <button
                    onClick={() => toggleNotes(lead.id)}
                    className="flex items-center gap-1 text-xs text-purple-600 font-medium"
                  >
                    {expandedNotes.has(lead.id) ? (
                      <><ChevronUp className="w-3.5 h-3.5" /> Ocultar notas</>
                    ) : (
                      <><ChevronDown className="w-3.5 h-3.5" /> Ver notas</>
                    )}
                  </button>
                  {expandedNotes.has(lead.id) && (
                    <p className="mt-1 text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border">
                      {lead.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-gray-400">{formatDate(lead.created)}</span>
                <button
                  onClick={() => setDeleteConfirm(lead.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-500">No se encontraron leads</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar lead?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Esta acción no se puede deshacer. El lead será eliminado permanentemente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
