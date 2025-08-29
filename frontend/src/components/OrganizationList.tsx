import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ORGANIZATIONS } from '../graphql/queries';
import { DELETE_ORGANIZATION } from '../graphql/mutations';
import type { Organization } from '../types';
import { OrganizationForm } from './OrganizationForm';

export const OrganizationList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ORGANIZATIONS);
  const [deleteOrganization] = useMutation(DELETE_ORGANIZATION, {
    refetchQueries: [{ query: GET_ORGANIZATIONS }]
  });

  const organizations = data?.organizations || [];

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this organization? This will also delete all associated projects and tasks.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteOrganization({ variables: { id } });
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete organization. It may have associated data.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrg(undefined);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  if (loading) return <div className="p-6">Loading organizations...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No organizations found</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            Create your first organization
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org: Organization) => (
            <div key={org.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{org.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">/{org.slug}</p>
                  <p className="text-sm text-gray-600">{org.contactEmail}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(org)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
                    disabled={deletingId === org.id}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === org.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Created: {new Date(org.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <OrganizationForm
          organization={editingOrg}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};